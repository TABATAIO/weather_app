const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const natural = require("natural");
const nlp = require("compromise");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// カスタムモジュール
const nlpService = require("./modules/nlpService");
const {
  getWindDirection,
  getWeatherCategory,
} = require("./modules/weatherService");
const responseGenerator = require("./modules/responseGenerator");
const mascotService = require("./modules/mascotService");
const chatService = require("./modules/chatService");

// データベース関連のインポート
const { setupDatabase } = require("./database");
const {
  saveUserProfile,
  getUserProfile,
  saveChatHistory,
  getChatHistory,
  saveWeatherLog,
  createUser,
  authenticateUser,
  verifyToken,
} = require("./dbUtils");

// 環境変数を読み込み
dotenv.config();

// Gemini API設定はchatServiceに移行済み

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア設定
// CORS設定（フロントエンドからのfetchアクセス許可）
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:5000",
      "http://127.0.0.1:5500",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  }),
);

// JSONデータを受け取るための設定
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 静的ファイル（HTML, CSS, JS）を提供
app.use(express.static(__dirname));

// レスポンスヘッダー設定（API用）
app.use("/api", (req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// リクエストログ用ミドルウェア（デバッグ用）
app.use((req, res, next) => {
  console.log(
    `🔍 リクエスト受信: ${req.method} ${req.path} - ${new Date().toISOString()}`,
  );
  console.log(`🔍 Original URL: ${req.originalUrl}`);
  next();
});

// ログ出力ミドルウェア
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 認証ミドルウェア
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  try {
    const result = await verifyToken(token);
    if (result.success) {
      req.user = result.user;
      next();
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    console.error("認証エラー:", error);
    res.sendStatus(403);
  }
}

// 認証API - サインアップ（Node.js実装）
app.post("/api/auth/signup", async (req, res) => {
  try {
    console.log("� サインアップリクエスト受信:", req.body);

    const { email, username, password } = req.body;

    // バリデーション
    if (!email || !username || !password) {
      console.log("❌ 必須フィールドが不足:", {
        email,
        username,
        password: !!password,
      });
      return res.status(400).json({
        success: false,
        error: "メールアドレス、ユーザー名、パスワードは必須です",
      });
    }

    // ユーザー作成
    console.log("🔧 createUser呼び出し開始...");
    const result = await createUser({ email, username, password });
    console.log("✅ createUser完了:", result);

    res.json(result);
  } catch (error) {
    console.error("💥 サインアップエラー:", error);
    res.status(500).json({
      success: false,
      error: "サーバーエラーが発生しました",
    });
  }
});

// 認証API - サインイン（Node.js実装）
app.post("/api/auth/signin", async (req, res) => {
  try {
    console.log("🔐 サインインリクエスト受信:", req.body);

    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      console.log("❌ 必須フィールドが不足:", { email, password: !!password });
      return res.status(400).json({
        success: false,
        error: "メールアドレスとパスワードは必須です",
      });
    }

    // ユーザー認証
    console.log("🔧 authenticateUser呼び出し開始...");
    const result = await authenticateUser({ email, password });
    console.log("✅ authenticateUser完了:", result);

    res.json(result);
  } catch (error) {
    console.error("💥 サインインエラー:", error);
    res.status(500).json({
      success: false,
      error: "サーバーエラーが発生しました",
    });
  }
});

// デバッグ用エンドポイント - DBユーザー確認
app.get("/api/debug/users", async (req, res) => {
  try {
    const database = await require("./database").setupDatabase();

    database.all(
      "SELECT id, email, name, created_at FROM users",
      (err, users) => {
        if (err) {
          console.error("ユーザー取得エラー:", err);
          res.status(500).json({ success: false, error: err.message });
        } else {
          res.json({
            success: true,
            users: users,
            count: users.length,
          });
        }
      },
    );
  } catch (error) {
    console.error("デバッグエラー:", error);
    res.status(500).json({ success: false, error: "データベース接続エラー" });
  }
});

// 認証API - トークン検証（Node.js実装）
app.get("/api/auth/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "トークンが提供されていません",
      });
    }

    // Node.jsのトークン検証機能を使用
    const result = await verifyToken(token);

    if (result.success) {
      res.json({
        success: true,
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.error || "トークンが無効です",
      });
    }
  } catch (error) {
    console.error("トークン検証エラー:", error);
    res.status(500).json({
      success: false,
      error: "内部サーバーエラーが発生しました",
    });
  }
});

// ルート設定
app.get("/", (req, res) => {
  console.log("🔍 ルートエンドポイント (/) に到達しました");
  res.json({
    message: "Weather Mascot App Backend",
    version: "1.0.0",
    weatherAPI: "Weathernews Point Weather API",
    database: "SQLite (永続化対応)",
    endpoints: [
      "GET /api/weather/:lat/:lon - 緯度経度で天気情報を取得",
      "GET /api/weather/city/:city - 都市名で天気情報を取得",
      "POST /api/mascot/update - マスコット状態を更新",
      "GET /api/mascot/:id - マスコット情報を取得",
      "POST /api/mascot/chat - マスコットとの会話（AI機能・履歴保存）",
      "POST /api/user/profile - ユーザープロフィール設定（DB保存）",
      "GET /api/user/profile/:userId - ユーザープロフィール取得（DB）",
      "GET /api/chat/history/:userId - 会話履歴取得（DB）",
      "GET /api/images/:imageName - 画像ファイル配信",
    ],
    supportedCities: [
      "tokyo",
      "osaka",
      "kyoto",
      "yokohama",
      "nagoya",
      "fukuoka",
      "sendai",
      "hiroshima",
    ],
  });
});

// API情報を提供するエンドポイント
app.get("/api", (req, res) => {
  console.log("🔍 API情報エンドポイント (/api) に到達しました");
  res.json({
    service: "Weather Mascot API",
    version: "1.0.0",
    status: "active",
    database: "SQLite (永続化対応)",
    availableEndpoints: {
      weather: {
        "GET /api/weather/:lat/:lon": "緯度経度で天気情報を取得",
        "GET /api/weather/city/:city": "都市名で天気情報を取得",
      },
      mascot: {
        "POST /api/mascot/update": "マスコット状態を更新",
        "GET /api/mascot/:id": "マスコット情報を取得",
        "POST /api/mascot/chat": "マスコットとの会話（AI機能・履歴保存）",
      },
      user: {
        "POST /api/user/profile": "ユーザープロフィール設定（DB保存）",
        "GET /api/user/profile/:userId": "ユーザープロフィール取得（DB）",
      },
      chat: {
        "GET /api/chat/history/:userId": "会話履歴取得（DB）",
      },
      images: {
        "GET /api/images/:imageName": "画像ファイル配信",
      },
    },
    supportedCities: [
      "tokyo",
      "osaka",
      "kyoto",
      "yokohama",
      "nagoya",
      "fukuoka",
      "sendai",
      "hiroshima",
      "sapporo",
      "naha",
    ],
  });
});

// 画像配信エンドポイント
const path = require("path");
const fs = require("fs");

app.get("/api/images/:imageName", (req, res) => {
  try {
    const imageName = req.params.imageName;
    console.log(`🖼️ 画像リクエスト: ${imageName}`);
    console.log(`🔍 __dirname: ${__dirname}`);

    // 複数のパスを試行
    const possiblePaths = [
      path.join(__dirname, "../Laravel/weather-admin/public/images", imageName),
      path.join("/var/www/public/images", imageName),
      path.join("/app/Laravel/weather-admin/public/images", imageName),
      path.join(__dirname, "Laravel/weather-admin/public/images", imageName),
      path.join(__dirname, "public/images", imageName),
    ];

    let imagePath = null;

    // 各パスを確認
    for (const testPath of possiblePaths) {
      console.log(`🔍 テストパス: ${testPath}`);
      if (fs.existsSync(testPath)) {
        imagePath = testPath;
        console.log(`✅ 画像発見: ${testPath}`);
        break;
      } else {
        console.log(`❌ 存在しない: ${testPath}`);
      }
    }

    // ファイルの存在確認
    if (!imagePath) {
      console.warn(`⚠️ 画像が見つかりません: ${imageName}`);
      console.log(`🔍 試行したパス:`, possiblePaths);
      return res.status(404).json({
        success: false,
        error: `画像 '${imageName}' が見つかりません`,
        searchedPaths: possiblePaths,
      });
    }

    // 画像ファイルを送信
    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error(`❌ 画像送信エラー:`, err);
        res.status(500).json({
          success: false,
          error: "画像の送信に失敗しました",
        });
      } else {
        console.log(`✅ 画像送信成功: ${imageName}`);
      }
    });
  } catch (error) {
    console.error("❌ 画像配信エラー:", error);
    res.status(500).json({
      success: false,
      error: "画像の配信でエラーが発生しました",
    });
  }
});

// 都市名での天気取得（緯度経度変換付き）- 1kmメッシュ対応
// 注意：より具体的なルートを先に定義する必要があります
app.get("/api/weather/city/:city", async (req, res) => {
  try {
    const city = req.params.city;

    // 主要都市の緯度経度マッピング（より正確な座標に更新）
    const cityCoordinates = {
      tokyo: {
        lat: 35.681236,
        lon: 139.767125,
        name: "東京",
        area: "東京都千代田区",
      },
      osaka: {
        lat: 34.693738,
        lon: 135.502165,
        name: "大阪",
        area: "大阪府大阪市",
      },
      kyoto: {
        lat: 35.011636,
        lon: 135.768029,
        name: "京都",
        area: "京都府京都市",
      },
      yokohama: {
        lat: 35.447753,
        lon: 139.642514,
        name: "横浜",
        area: "神奈川県横浜市",
      },
      nagoya: {
        lat: 35.181446,
        lon: 136.906398,
        name: "名古屋",
        area: "愛知県名古屋市",
      },
      fukuoka: {
        lat: 33.590355,
        lon: 130.401716,
        name: "福岡",
        area: "福岡県福岡市",
      },
      sendai: {
        lat: 38.268215,
        lon: 140.869356,
        name: "仙台",
        area: "宮城県仙台市",
      },
      hiroshima: {
        lat: 34.385295,
        lon: 132.455293,
        name: "広島",
        area: "広島県広島市",
      },
      sapporo: {
        lat: 43.064171,
        lon: 141.346939,
        name: "札幌",
        area: "北海道札幌市",
      },
      naha: {
        lat: 26.212401,
        lon: 127.679138,
        name: "那覇",
        area: "沖縄県那覇市",
      },
    };

    const coords = cityCoordinates[city.toLowerCase()];
    if (!coords) {
      return res.status(400).json({
        success: false,
        error: `都市 '${city}' はサポートされていません`,
        supportedCities: Object.keys(cityCoordinates).map((key) => ({
          key: key,
          name: cityCoordinates[key].name,
          area: cityCoordinates[key].area,
        })),
      });
    }

    console.log(`🏙️ 都市名天気取得: ${coords.name} (${coords.area})`);

    // 1kmメッシュピンポイント天気予報API呼び出し
    const apiKey = process.env.WEATHERNEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Weathernews APIキーが設定されていません",
      });
    }

    const weatherResponse = await axios.get(
      "https://wxtech.weathernews.com/api/v1/ss1wx",
      {
        params: {
          lat: coords.lat,
          lon: coords.lon,
        },
        headers: {
          "X-API-Key": apiKey,
        },
      },
    );

    // エラーチェック
    if (weatherResponse.data.errors && weatherResponse.data.errors.length > 0) {
      console.error("❌ Weathernews APIエラー:", weatherResponse.data.errors);
      return res.status(400).json({
        success: false,
        error: "APIエラーが発生しました",
        apiErrors: weatherResponse.data.errors,
      });
    }

    const wxdata = weatherResponse.data.wxdata[0];
    if (!wxdata) {
      return res.status(404).json({
        success: false,
        error: "データが見つかりませんでした",
      });
    }

    const currentForecast = wxdata.srf[0];
    const todayMediumForecast = wxdata.mrf[0];

    const weatherName = mascotService.getWeatherName(currentForecast.wx);
    const weatherIcon = mascotService.getWeatherIcon(currentForecast.wx);
    const windDirectionName = getWindDirection(currentForecast.wnddir);

    const weatherData = {
      requestId: weatherResponse.data.requestId,
      location: {
        lat: coords.lat,
        lon: coords.lon,
        city: coords.name,
        area: coords.area,
      },
      current: {
        datetime: currentForecast.date,
        weather: weatherName,
        weatherCode: currentForecast.wx,
        temperature: currentForecast.temp,
        humidity: currentForecast.rhum,
        precipitation: currentForecast.prec,
        windSpeed: currentForecast.wndspd,
        windDirection: windDirectionName,
        windDirectionCode: currentForecast.wnddir,
        pressure: currentForecast.arpress,
        icon: weatherIcon,
      },
      today: {
        date: todayMediumForecast?.date,
        maxTemp: todayMediumForecast?.maxtemp,
        minTemp: todayMediumForecast?.mintemp,
        precipitationProbability: todayMediumForecast?.pop,
        weatherCode: todayMediumForecast?.wx,
      },
      forecast: {
        shortTerm: wxdata.srf.slice(0, 24),
        mediumTerm: wxdata.mrf.slice(0, 7),
      },
      timestamp: new Date().toISOString(),
    };

    // 天気ログをデータベースに保存
    try {
      await saveWeatherLog({
        location: `${coords.name} (${coords.area})`,
        weatherData: JSON.stringify(weatherData),
        timestamp: new Date().toISOString(),
      });
      console.log(`💾 ${coords.name}の天気データをデータベースに保存しました`);
    } catch (dbError) {
      console.error("データベース保存エラー:", dbError.message);
    }

    res.json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    console.error("❌ 都市天気取得エラー:", error.message);

    let errorDetails = error.message;
    if (error.response?.data) {
      errorDetails = error.response.data;
      console.error("API Error Details:", error.response.data);
    }

    res.status(500).json({
      success: false,
      error: "天気情報の取得に失敗しました",
      details: errorDetails,
      statusCode: error.response?.status,
    });
  }
});

// 天気情報取得API（緯度経度指定）- 1kmメッシュピンポイント天気予報
app.get("/api/weather/:lat/:lon", async (req, res) => {
  try {
    const { lat, lon } = req.params;

    // Weathernews API呼び出し
    const apiKey = process.env.WEATHERNEWS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Weathernews APIキーが設定されていません",
      });
    }

    console.log(`🌤️ 1kmメッシュ天気予報取得開始 - 緯度: ${lat}, 経度: ${lon}`);

    // 1kmメッシュピンポイント天気予報API
    const weatherResponse = await axios.get(
      "https://wxtech.weathernews.com/api/v1/ss1wx",
      {
        params: {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
        },
        headers: {
          "X-API-Key": apiKey,
        },
      },
    );

    console.log(
      `✅ APIレスポンス受信 - RequestID: ${weatherResponse.data.requestId}`,
    );

    // エラーチェック
    if (weatherResponse.data.errors && weatherResponse.data.errors.length > 0) {
      console.error("❌ Weathernews APIエラー:", weatherResponse.data.errors);
      return res.status(400).json({
        success: false,
        error: "APIエラーが発生しました",
        apiErrors: weatherResponse.data.errors,
      });
    }

    const wxdata = weatherResponse.data.wxdata[0]; // 最初の地点データ
    if (!wxdata) {
      return res.status(404).json({
        success: false,
        error: "データが見つかりませんでした",
      });
    }

    // 現在時刻に最も近い短期予報データを取得
    const currentForecast = wxdata.srf[0]; // 最新の短期予報
    const todayMediumForecast = wxdata.mrf[0]; // 今日の中期予報

    // 天気コードを天気名に変換
    const weatherName = mascotService.getWeatherName(currentForecast.wx);
    const weatherIcon = mascotService.getWeatherIcon(currentForecast.wx);

    // 風向を文字列に変換
    const windDirectionName = getWindDirection(currentForecast.wnddir);

    const weatherData = {
      requestId: weatherResponse.data.requestId,
      location: {
        lat: wxdata.lat,
        lon: wxdata.lon,
      },
      current: {
        datetime: currentForecast.date,
        weather: weatherName,
        weatherCode: currentForecast.wx,
        temperature: currentForecast.temp,
        humidity: currentForecast.rhum,
        precipitation: currentForecast.prec,
        windSpeed: currentForecast.wndspd,
        windDirection: windDirectionName,
        windDirectionCode: currentForecast.wnddir,
        pressure: currentForecast.arpress,
        icon: weatherIcon,
      },
      today: {
        date: todayMediumForecast?.date,
        maxTemp: todayMediumForecast?.maxtemp,
        minTemp: todayMediumForecast?.mintemp,
        precipitationProbability: todayMediumForecast?.pop,
        weatherCode: todayMediumForecast?.wx,
      },
      forecast: {
        shortTerm: wxdata.srf.slice(0, 24), // 24時間分
        mediumTerm: wxdata.mrf.slice(0, 7), // 7日分
      },
      timestamp: new Date().toISOString(),
    };

    // 天気ログをデータベースに保存
    try {
      await saveWeatherLog({
        location: `${lat},${lon}`,
        weatherData: JSON.stringify(weatherData),
        timestamp: new Date().toISOString(),
      });
      console.log("💾 天気データをデータベースに保存しました");
    } catch (dbError) {
      console.error("データベース保存エラー:", dbError.message);
      // エラーがあってもAPI応答は継続
    }

    res.json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    console.error("❌ Weathernews API呼び出しエラー:", error.message);

    // APIエラーの詳細を含める
    let errorDetails = error.message;
    if (error.response?.data) {
      errorDetails = error.response.data;
      console.error("API Error Details:", error.response.data);
    }

    res.status(500).json({
      success: false,
      error: "天気情報の取得に失敗しました",
      details: errorDetails,
      statusCode: error.response?.status,
    });
  }
});

// マスコット状態更新API（新天気データ対応）
app.post("/api/mascot/update", (req, res) => {
  try {
    console.log("🎭 マスコット状態更新リクエスト受信:", req.body);
    
    const {
      weatherCode,
      temperature,
      humidity,
      precipitation,
      windSpeed,
      pressure,
      weatherName,
    } = req.body;

    console.log(
      `🎭 マスコット状態更新リクエスト - 天気コード: ${weatherCode}, 気温: ${temperature}℃`,
    );

    // リクエスト形式の詳細検証
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: "リクエストボディが不正です",
        details: "JSONオブジェクトが必要です",
      });
    }

    // 天気コードの厳密な検証とデフォルト値設定
    let validWeatherCode = 100; // デフォルト：晴れ
    if (weatherCode !== undefined && weatherCode !== null && weatherCode !== "") {
      const parsedCode = parseInt(weatherCode);
      if (!isNaN(parsedCode) && parsedCode >= 100 && parsedCode <= 999) {
        validWeatherCode = parsedCode;
      } else {
        console.warn(`⚠️ 無効な天気コード: ${weatherCode}, デフォルト値(100)を使用`);
      }
    }

    // 数値パラメータの厳密な検証とデフォルト値設定
    const validatedParams = {
      weatherCode: validWeatherCode,
      temperature: (temperature !== undefined && temperature !== null && !isNaN(temperature)) ? Number(temperature) : 20,
      humidity: (humidity !== undefined && humidity !== null && !isNaN(humidity)) ? Math.max(0, Math.min(100, Number(humidity))) : 50,
      precipitation: (precipitation !== undefined && precipitation !== null && !isNaN(precipitation)) ? Math.max(0, Number(precipitation)) : 0,
      windSpeed: (windSpeed !== undefined && windSpeed !== null && !isNaN(windSpeed)) ? Math.max(0, Number(windSpeed)) : 0,
      pressure: (pressure !== undefined && pressure !== null && !isNaN(pressure)) ? Number(pressure) : 1013,
    };

    console.log("✅ バリデーション済みパラメータ:", validatedParams);

    // マスコットの状態を計算（バリデーション済みデータを使用）
    const mascotState = mascotService.calculateMascotState(validatedParams);

    // 追加情報を含める（undefinedチェック強化）
    const safeWeatherName = weatherName && typeof weatherName === 'string' && weatherName.trim() !== '' 
      ? weatherName.trim() 
      : mascotService.getWeatherName(validatedParams.weatherCode) || `天気コード${validatedParams.weatherCode}`;
    
    const safeWeatherIcon = mascotService.getWeatherIcon(validatedParams.weatherCode) || 
      `https://tpf.weathernews.jp/wxicon/152/100.png`; // デフォルトアイコン

    mascotState.weatherInfo = {
      code: validatedParams.weatherCode,
      name: safeWeatherName,
      icon: safeWeatherIcon,
      category: mascotService.getWeatherCategory ? mascotService.getWeatherCategory(validatedParams.weatherCode) : getWeatherCategory(validatedParams.weatherCode),
    };

    // データの整合性を最終チェック
    if (!mascotState.mood) mascotState.mood = 'neutral';
    if (typeof mascotState.energy !== 'number') mascotState.energy = 50;
    if (typeof mascotState.happiness !== 'number') mascotState.happiness = 50;
    if (typeof mascotState.comfort !== 'number') mascotState.comfort = 50;

    console.log("✅ 最終マスコット状態:", mascotState);

    res.json({
      success: true,
      data: mascotState,
      message: `マスコットの気分: ${mascotState.mood}, エネルギー: ${mascotState.energy}%`,
    });
  } catch (error) {
    console.error("❌ マスコット状態更新エラー:", error.message);
    res.status(500).json({
      success: false,
      error: "マスコット状態の更新に失敗しました",
      details: error.message,
    });
  }
});

// 天気アイコン情報取得API
app.get("/api/icon/:weatherCode", (req, res) => {
  try {
    const weatherCode = parseInt(req.params.weatherCode);

    if (isNaN(weatherCode) || weatherCode < 100 || weatherCode > 999) {
      return res.status(400).json({
        success: false,
        error: "無効な天気コードです。100-999の範囲で指定してください。",
      });
    }

    const weatherInfo = mascotService.generateWeatherInfo(weatherCode);

    res.json({
      success: true,
      data: weatherInfo,
    });
  } catch (error) {
    console.error("❌ 天気アイコン取得エラー:", error.message);
    res.status(500).json({
      success: false,
      error: "天気アイコン情報の取得に失敗しました",
      details: error.message,
    });
  }
});

// 複数天気コードの一括アイコン取得API
app.post("/api/weather/icons", (req, res) => {
  try {
    const { weatherCodes } = req.body;

    if (!Array.isArray(weatherCodes) || weatherCodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: "天気コードの配列が必要です。",
      });
    }

    if (weatherCodes.length > 50) {
      return res.status(400).json({
        success: false,
        error: "一度に取得できる天気コードは50個までです。",
      });
    }

    const weatherIcons = weatherCodes.map((code) => {
      const weatherCode = parseInt(code);

      if (isNaN(weatherCode) || weatherCode < 100 || weatherCode > 999) {
        return {
          code: code,
          error: "無効な天気コード",
        };
      }

      return {
        code: weatherCode,
        name: mascotService.getWeatherName(weatherCode),
        icon: mascotService.getWeatherIcon(weatherCode),
        category: getWeatherCategory(weatherCode),
      };
    });

    res.json({
      success: true,
      data: weatherIcons,
      count: weatherIcons.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ 天気アイコン一括取得エラー:", error.message);
    res.status(500).json({
      success: false,
      error: "天気アイコン情報の一括取得に失敗しました",
      details: error.message,
    });
  }
});

// マスコット情報取得API
app.get("/api/mascot/:id", (req, res) => {
  try {
    const mascotId = req.params.id;

    // マスコット情報を生成
    const mascotInfo = mascotService.generateMascotInfo(mascotId);

    res.json({
      success: true,
      data: mascotInfo,
    });
  } catch (error) {
    console.error("マスコット情報取得エラー:", error.message);
    res.status(500).json({
      success: false,
      error: "マスコット情報の取得に失敗しました",
    });
  }
});

// 以下の関数群はmascotServiceに移管されました
// - getWeatherName
// - getWeatherIcon
// - getWindDirection
// - getWeatherCategory
// - calculateMascotState
// - getWeatherReaction
// - getRecommendations

/**
 * AIマスコットとの会話APIエンドポイント
  const {
    weatherCode,
    temperature,
    humidity,
    precipitation,
    windSpeed,
    pressure
  } = weatherData;

  let mood = 'neutral';
  let energy = 50;
  let happiness = 50;
  let comfort = 50;

  // 天気コードによる基本状態変化
  if (weatherCode >= 100 && weatherCode < 200) {
    // 晴れ系
    mood = 'happy';
    energy += 25;
    happiness += 35;

    if (weatherCode >= 500 && weatherCode <= 583) {
      // 猛暑系
      mood = 'hot';
      energy -= 10;
      comfort -= 20;
    }
  } else if (weatherCode >= 200 && weatherCode < 300) {
    // 曇り系
    mood = 'calm';
    energy += 5;
    happiness += 5;

    if (weatherCode === 209) {
      // 霧
      mood = 'mysterious';
      comfort -= 5;
    }
  } else if (weatherCode >= 300 && weatherCode < 400) {
    // 雨系
    mood = 'sad';
    energy -= 15;
    happiness -= 25;

    if (weatherCode === 306 || (weatherCode >= 850 && weatherCode <= 884)) {
      // 大雨・嵐
      mood = 'worried';
      energy -= 25;
      happiness -= 35;
      comfort -= 30;
    }
  } else if (weatherCode >= 400 && weatherCode < 500) {
    // 雪系
    mood = 'excited';
    energy += 15;
    happiness += 20;

    if (weatherCode === 405 || (weatherCode >= 950 && weatherCode <= 984)) {
      // 大雪
      mood = 'amazed';
      energy += 10;
      comfort -= 15;
    }
  } else if (weatherCode === 800) {
    // 雷
    mood = 'surprised';
    energy += 10;
    happiness -= 10;
    comfort -= 20;
  }

  // 気温による調整（欠測値-9999を考慮）
  if (temperature !== -9999) {
    if (temperature < 0) {
      energy -= 20;
      comfort -= 30;
      mood = 'freezing';
    } else if (temperature < 10) {
      energy -= 10;
      comfort -= 15;
      if (mood === 'neutral') mood = 'cold';
    } else if (temperature > 35) {
      energy -= 15;
      comfort -= 25;
      mood = 'hot';
    } else if (temperature > 28) {
      energy -= 5;
      comfort -= 10;
    }
  }

  // 湿度による調整（欠測値-99を考慮）
  if (humidity !== -99) {
    if (humidity > 80) {
      comfort -= 20;
      energy -= 10;
    } else if (humidity < 30) {
      comfort -= 10;
    }
  }

  // 降水量による調整（欠測値-9999を考慮）
  if (precipitation !== -9999) {
    if (precipitation > 10) {
      happiness -= 15;
      energy -= 10;
    } else if (precipitation > 0) {
      happiness -= 5;
    }
  }

  // 風速による調整（欠測値-9999を考慮）
  if (windSpeed !== -9999) {
    if (windSpeed > 10) {
      energy -= 5;
      comfort -= 10;
    } else if (windSpeed > 5) {
      energy += 5; // 適度な風は気持ちいい
    }
  }

  // 気圧による調整（欠測値-9999を考慮）
  if (pressure !== -9999) {
    if (pressure < 1000) {
      comfort -= 10; // 低気圧で体調不良
    } else if (pressure > 1025) {
      comfort += 5; // 高気圧で快適
    }
  }

  // 値の範囲制限
  energy = Math.max(0, Math.min(100, energy));
  happiness = Math.max(0, Math.min(100, happiness));
  comfort = Math.max(0, Math.min(100, comfort));

  return {
    mood,
    energy,
    happiness,
    comfort,
    weatherReaction: mascotService.getWeatherReaction(weatherData),
    recommendations: mascotService.getRecommendations(weatherData),
    timestamp: new Date().toISOString()
  };
}

/**
 * AIマスコットとの会話APIエンドポイント
  const { weatherCode, temperature, precipitation, windSpeed, pressure } = weatherData;

  let reactions = [];

  // 天気コード別リアクション
  if (weatherCode >= 100 && weatherCode < 200) {
    // 晴れ系
    reactions = [
      '今日はいい天気だね！☀️',
      'お散歩日和だよ♪',
      '太陽が気持ちいい～',
      '洗濯物がよく乾きそう！',
      '青空がきれいだね！'
    ];

    if (weatherCode >= 550 && weatherCode <= 583) {
      // 猛暑
      reactions = [
        'わー！今日は猛暑だね🔥',
        '暑すぎる～！冷房の下にいよう',
        'アイスが食べたくなる暑さ🍦',
        '熱中症に気をつけて！'
      ];
    }
  } else if (weatherCode >= 200 && weatherCode < 300) {
    // 曇り系
    reactions = [
      '曇り空も悪くないね☁️',
      'ちょっと涼しいかな',
      'のんびりした天気だね',
      '過ごしやすい気温だね'
    ];

    if (weatherCode === 209) {
      reactions = ['霧がかかって幻想的だね🌫️', '視界が悪いから気をつけて'];
    }
  } else if (weatherCode >= 300 && weatherCode < 400) {
    // 雨系
    reactions = [
      '雨の音って落ち着くよね☔',
      '傘を忘れずにね！',
      '雨上がりが楽しみ',
      'お家でのんびりしよう'
    ];

    if (weatherCode === 306 || (weatherCode >= 850 && weatherCode <= 884)) {
      reactions = [
        '大雨だね！外出は控えめに☔',
        '嵐みたい...安全な場所にいてね',
        'すごい雨だ！窓から見てるだけにしよう'
      ];
    }
  } else if (weatherCode >= 400 && weatherCode < 500) {
    // 雪系
    reactions = [
      '雪だ！雪だ！❄️',
      '雪遊びしたいな～',
      '真っ白できれい！',
      '雪だるま作ろう⛄'
    ];

    if (weatherCode === 405 || (weatherCode >= 950 && weatherCode <= 984)) {
      reactions = [
        'すごい雪だね！❄️❄️',
        '大雪だから外出注意だよ',
        '雪かきが大変そう...'
      ];
    }
  } else if (weatherCode === 800) {
    // 雷
    reactions = [
      'ゴロゴロ～雷が鳴ってる⚡',
      '雷雲が近づいてるね',
      '雷は怖いけどちょっと迫力があるね'
    ];
  } else {
    reactions = ['今日も一日がんばろう！', '天気をチェックして準備しようね'];
  }

  // 特殊条件での追加リアクション
  if (temperature !== -9999) {
    if (temperature > 30) {
      reactions.push('暑いから水分補給を忘れずに！🥤');
    } else if (temperature < 5) {
      reactions.push('寒いから暖かくしてね🧣');
    }
  }

  if (precipitation !== -9999 && precipitation > 5) {
    reactions.push('雨が強いから気をつけてね！');
  }

  if (windSpeed !== -9999 && windSpeed > 8) {
    reactions.push('風が強いから飛ばされないように！💨');
  }

  if (pressure !== -9999 && pressure < 990) {
    reactions.push('気圧が低いから体調管理に注意してね');
  }

  return reactions[Math.floor(Math.random() * reactions.length)];
}

// おすすめ行動取得関数（新天気コード対応版）
function getRecommendations(weatherData) {
  const { weatherCode, temperature, precipitation, windSpeed, pressure } = weatherData;
  const recommendations = [];

  // 服装アドバイス（温度基準）
  if (temperature !== -9999) {
    if (temperature > 25) {
      recommendations.push('軽装で涼しく過ごそう');
    } else if (temperature < 15) {
      recommendations.push('暖かい服装がおすすめ');
    } else if (temperature > 30) {
      recommendations.push('熱中症対策の服装を');
    } else if (temperature < 5) {
      recommendations.push('防寒対策をしっかりと');
    }
  }

  // 持ち物アドバイス
  if (precipitation !== -9999 && precipitation > 0) {
    recommendations.push('傘を持参しよう');
    if (precipitation > 10) {
      recommendations.push('レインコートもあると安心');
    }
  }

  // 天気コード別のアドバイス
  if (weatherCode >= 100 && weatherCode < 200) {
    // 晴れ系
    recommendations.push('日焼け止めと帽子を忘れずに');
    if (weatherCode >= 550 && weatherCode <= 583) {
      recommendations.push('こまめな水分補給を');
      recommendations.push('涼しい場所で過ごそう');
    }
  } else if (weatherCode >= 300 && weatherCode < 400) {
    // 雨系
    recommendations.push('室内活動がおすすめ');
    if (weatherCode === 306 || (weatherCode >= 850 && weatherCode <= 884)) {
      recommendations.push('外出は控えめに');
      recommendations.push('安全な場所で待機');
    }
  } else if (weatherCode >= 400 && weatherCode < 500) {
    // 雪系
    recommendations.push('滑りにくい靴を選ぼう');
    recommendations.push('防寒具を忘れずに');
    if (weatherCode === 405 || (weatherCode >= 950 && weatherCode <= 984)) {
      recommendations.push('不要不急の外出は控えよう');
    }
  }

  // 風速によるアドバイス
  if (windSpeed !== -9999 && windSpeed > 8) {
    recommendations.push('風に飛ばされやすいものに注意');
    if (windSpeed > 15) {
      recommendations.push('強風のため外出注意');
    }
  }

  // 気圧によるアドバイス
  if (pressure !== -9999 && pressure < 1000) {
    recommendations.push('体調管理に注意しよう');
  }

  // 活動アドバイス
  if (weatherCode >= 100 && weatherCode < 200 && temperature !== -9999 && temperature < 25) {
    recommendations.push('お出かけに最適な天気');
  } else if (weatherCode >= 300 && weatherCode < 400) {
    recommendations.push('読書や映画鑑賞はいかが？');
  } else if (weatherCode >= 400 && weatherCode < 500) {
    recommendations.push('雪景色を楽しもう');
  }

  return recommendations;
}

/**
 * AIマスコットとの会話APIエンドポイント
 * chatServiceを使用してモジュール化された会話機能を提供
 */
app.post("/api/mascot/chat", async (req, res) => {
  const result = await chatService.handleChatAPI({
    requestBody: req.body,
    saveChatHistory,
  });

  res.status(result.status).json(result);
});

// 会話履歴取得API（chatServiceを使用）
app.get("/api/chat/history/:userId", async (req, res) => {
  console.log("🔍 会話履歴APIエンドポイントに到達しました");

  const result = await chatService.handleChatHistoryAPI({
    userId: req.params.userId,
    limit: req.query.limit,
    getChatHistory,
  });

  res.status(result.status).json(result);
});

// ============================================
// ミッション関連API
// ============================================

// 今日のミッション取得API
app.get("/api/missions/today", async (req, res) => {
  try {
    console.log("🎯 今日のミッション取得API呼び出し");
    
    // 現在の日付を取得
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // サンプルミッションデータ（実際の実装では天気やユーザー状況に基づく）
    const missions = [
      {
        id: 1,
        title: "天気をチェックしよう",
        description: "今日の天気予報を確認してみよう",
        type: "weather",
        progress: 0,
        target: 1,
        reward: 10,
        completed: false
      },
      {
        id: 2,
        title: "マスコットと遊ぼう",
        description: "マスコットをタップして触れ合おう",
        type: "interaction",
        progress: 0,
        target: 3,
        reward: 15,
        completed: false
      },
      {
        id: 3,
        title: "チャットを楽しもう",
        description: "マスコットとチャットをしてみよう",
        type: "chat",
        progress: 0,
        target: 1,
        reward: 20,
        completed: false
      }
    ];

    res.json({
      success: true,
      data: {
        date: dateStr,
        missions: missions,
        totalMissions: missions.length,
        completedMissions: missions.filter(m => m.completed).length
      }
    });

  } catch (error) {
    console.error("❌ ミッション取得エラー:", error);
    res.status(500).json({
      success: false,
      error: "ミッションデータの取得に失敗しました",
      details: error.message
    });
  }
});

// ミッション進捗更新API
app.post("/api/missions/:missionId/progress", async (req, res) => {
  try {
    const { missionId } = req.params;
    const { action, progress } = req.body;
    
    console.log(`🎯 ミッション進捗更新: ID=${missionId}, action=${action}, progress=${progress}`);
    
    // 実際の実装ではデータベースを更新
    // ここではサンプルレスポンス
    res.json({
      success: true,
      data: {
        missionId: parseInt(missionId),
        action: action,
        newProgress: progress || 1,
        completed: (progress || 1) >= 1, // 簡単な完了判定
        reward: 10
      }
    });
    
  } catch (error) {
    console.error("❌ ミッション進捗更新エラー:", error);
    res.status(500).json({
      success: false,
      error: "ミッション進捗の更新に失敗しました",
      details: error.message
    });
  }
});

// ============================================

/**
 * 天気情報に基づいてカジュアルなコメントを生成する
 * @param {Object} currentWeather - 天気データ（温度、天気など）
 * @returns {string} 天気に合ったカジュアルなコメント
 */
function getWeatherComment(currentWeather) {
  const { weather, temperature } = currentWeather;

  switch (weather?.toLowerCase()) {
    case "sunny":
      return temperature > 25
        ? "今日は暑くなりそうですね！水分補給を忘れずに🌞"
        : "今日はいい天気ですね！お出かけ日和です☀️";
    case "rainy":
      return "今日は雨模様ですね。傘を忘れずに！☔";
    case "cloudy":
      return "曇り空ですが、過ごしやすそうな気温ですね☁️";
    case "snow":
      return "雪が降っているんですね！暖かくしてくださいね❄️";
    default:
      return "今日もよろしくお願いします！";
  }
}

// 天気レスポンス生成

/**
 * 現在の天気情報に基づいて服装アドバイスを生成する
 * @param {Object} currentWeather - 現在の天気データ（温度、天気、湿度など）
 * @returns {Object} 服装アドバイスオブジェクト（advice, items, reasons）
 */
function generateClothingAdvice(currentWeather) {
  const { weather, temperature, feelsLike } = currentWeather;
  const temp = feelsLike || temperature;

  let advice = "";
  let items = [];

  // 温度による基本アドバイス
  if (temp >= 30) {
    advice = "暑いので、涼しい服装がおすすめです！";
    items = ["薄手のTシャツ", "短パン・スカート", "サンダル", "帽子", "日傘"];
  } else if (temp >= 25) {
    advice = "暖かいので、軽めの服装で大丈夫そうです";
    items = ["半袖", "薄手の長袖", "ジーンズ", "スニーカー"];
  } else if (temp >= 20) {
    advice = "過ごしやすい気温ですね！";
    items = ["長袖シャツ", "カーディガン", "チノパン", "軽めのジャケット"];
  } else if (temp >= 15) {
    advice = "少し涼しいので、重ね着がおすすめです";
    items = ["セーター", "ジャケット", "ロングパンツ", "スニーカー"];
  } else if (temp >= 10) {
    advice = "寒いので、暖かい格好でお出かけくださいね";
    items = ["厚手のセーター", "コート", "マフラー", "ブーツ"];
  } else {
    advice = "とても寒いので、しっかり防寒してください！";
    items = ["ダウンジャケット", "マフラー", "手袋", "ニット帽", "ブーツ"];
  }

  // 天気による追加アドバイス
  switch (weather?.toLowerCase()) {
    case "rainy":
      advice += " 雨なので防水対策も忘れずに！";
      items.push("レインコート", "傘", "レインブーツ");
      break;
    case "sunny":
      if (temp > 25) {
        advice += " 日差しが強いので紫外線対策も大切です";
        items.push("日焼け止め", "サングラス", "帽子");
      }
      break;
    case "snow":
      advice += " 雪なので滑りにくい靴がおすすめです";
      items.push("スノーブーツ", "防水ジャケット", "手袋");
      break;
  }

  return { advice, items };
}

// 意図分析（改良版）
/**
 * ユーザーのメッセージからインテント（意図）を分析する
 * @param {Object} doc - compromise.jsで解析されたドキュメントオブジェクト
 * @param {string} message - ユーザーの入力メッセージ
 * @returns {string} 検出されたインテント（fatigue_support, weather_clothing, greeting, etc.）
 */
function analyzeIntent(doc, message) {
  // 優先度順で判定（より具体的なものを先に判定）

  // 疲労・体調関連（最優先）
  const fatigueKeywords = [
    "疲れ",
    "つかれ",
    "だる",
    "しんど",
    "きつ",
    "ばて",
    "へとへと",
    "くたくた",
    "げんなり",
    "ぐったり",
    "眠い",
    "やばい",
    "限界",
    "無理",
    "もうだめ",
    "たまらん",
    "しんどすぎ",
  ];

  // 疲労関連の文脈パターンも検出
  const fatiguePatterns = [
    /疲れ.*な[ーあ]/,
    /だる.*よ[ーお]/,
    /しんど.*は[ーあ]/,
    /きつ.*な[ーあ]/,
  ];

  if (
    fatigueKeywords.some((keyword) => message.includes(keyword)) ||
    fatiguePatterns.some((pattern) => pattern.test(message))
  ) {
    return "fatigue_support";
  }

  // 天気情報問い合わせ（高優先）
  const weatherInquiryPatterns = [
    /天気.*[？?]/,
    /今日.*天気/,
    /天気.*どう/,
    /天気.*教えて/,
    /天気.*知りたい/,
    /天気.*分かる/,
    /外.*天気/,
    /天候.*どう/,
  ];
  const weatherInquiryKeywords = [
    "天気は",
    "天気教えて",
    "天気どう",
    "今日の天気",
  ];

  if (
    weatherInquiryPatterns.some((pattern) => pattern.test(message)) ||
    weatherInquiryKeywords.some((keyword) => message.includes(keyword))
  ) {
    return "weather_inquiry";
  }

  // 服装相談（天気情報問い合わせの次の優先度）
  const clothingKeywords = [
    "服",
    "着る",
    "洋服",
    "ファッション",
    "コーデ",
    "何着る",
    "服装",
    "何を着",
    "着れば",
    "服選び",
  ];
  const clothingPatterns = [
    /何.*着/,
    /服.*選/,
    /コーデ/,
    /ファッション/,
    /着こなし/,
  ];

  if (
    clothingKeywords.some((keyword) => message.includes(keyword)) ||
    clothingPatterns.some((pattern) => pattern.test(message))
  ) {
    return "weather_clothing";
  }

  // 一般的な天気関連（温度や状況について）
  const generalWeatherKeywords = [
    "気温",
    "寒い",
    "暑い",
    "涼しい",
    "暖かい",
    "雨",
    "晴れ",
    "曇り",
    "雪",
    "風",
    "湿度",
    "気候",
  ];

  if (generalWeatherKeywords.some((keyword) => message.includes(keyword))) {
    return "weather_general";
  }

  // 挨拶の検出
  const greetingKeywords = [
    "おはよう",
    "こんにちは",
    "こんばんは",
    "はじめまして",
    "やあ",
    "hello",
    "hi",
    "ハロー",
  ];
  if (greetingKeywords.some((keyword) => message.includes(keyword))) {
    return "greeting";
  }

  // お別れの検出
  const farewellKeywords = [
    "さよなら",
    "また今度",
    "バイバイ",
    "また明日",
    "おつかれ",
    "bye",
    "see you",
  ];
  if (farewellKeywords.some((keyword) => message.includes(keyword))) {
    return "farewell";
  }

  // 活動・提案関連
  const activityKeywords = [
    "何する",
    "遊び",
    "出かける",
    "家にいる",
    "おすすめ",
    "プラン",
    "予定",
    "行く",
    "何しよう",
    "どこ行く",
  ];
  if (activityKeywords.some((keyword) => message.includes(keyword))) {
    return "activity_suggestion";
  }

  // 感謝・褒め言葉
  const appreciationKeywords = [
    "ありがとう",
    "すごい",
    "いいね",
    "素敵",
    "かわいい",
    "助かる",
    "感謝",
    "よかった",
  ];
  if (appreciationKeywords.some((keyword) => message.includes(keyword))) {
    return "appreciation";
  }

  // リクエスト・依頼の検出
  const requestKeywords = [
    "教えて",
    "してください",
    "お願い",
    "できる",
    "して",
    "やって",
    "どうすれば",
    "どうしたら",
  ];
  if (requestKeywords.some((keyword) => message.includes(keyword))) {
    return "request";
  }

  // 質問の検出（一般的な疑問詞）
  const questionKeywords = [
    "どう",
    "なに",
    "なん",
    "いつ",
    "どこ",
    "なんで",
    "どれ",
    "どちら",
    "どの",
    "いくら",
    "どのくらい",
  ];
  if (
    message.includes("？") ||
    message.includes("?") ||
    questionKeywords.some((keyword) => message.includes(keyword))
  ) {
    // 天気関連の質問かどうか再チェック
    if (weatherKeywords.some((keyword) => message.includes(keyword))) {
      return "weather_clothing";
    }
    return "question";
  }

  return "general";
}

// ユーザープロフィール設定API
/**
 * インテント、感情、エンティティを基に高度な応答を生成する
 * @param {string} userMessage - ユーザーの入力メッセージ
 * @param {string} intent - 検出されたインテント
 * @param {string} sentiment - 検出された感情（positive/negative/neutral）
 * @param {Object} entities - 抽出されたエンティティ情報
 * @param {string} userName - ユーザー名
 * @param {Object} weatherData - 天気データ
 * @param {Object} userPreferences - ユーザーの設定情報
 * @returns {Object} 応答オブジェクト（response, mood, suggestions, weatherAdvice）
 */
function generateAdvancedResponse(
  userMessage,
  intent,
  sentiment,
  entities,
  userName,
  weatherData,
  userPreferences,
) {
  let response = "";
  let mood = "friendly";
  let suggestions = [];
  let weatherAdvice = null;

  // 正規化
  const normalizedMessage = normalizeForSpeech(userMessage);

  switch (intent) {
    case "greeting":
      response = generateContextualGreeting(userName, weatherData, sentiment);
      break;

    case "weather_inquiry":
      if (weatherData && weatherData.current) {
        response = generateWeatherResponse(weatherData.current, userName);
        suggestions = getWeatherSuggestions(weatherData.current);
        mood = weatherData.current.weather === "sunny" ? "happy" : "friendly";
      } else {
        response = `${userName}さん、天気情報をお調べしますね！現在の位置情報があれば詳しい天気をお教えできますが、天気データの取得ボタンを押していただけますか？🌤️`;
        suggestions = [
          "天気データを取得",
          "位置情報を許可",
          "手動で地域を入力",
        ];
      }
      break;

    case "weather_clothing":
      if (weatherData && weatherData.current) {
        weatherAdvice = generateClothingAdvice(weatherData.current);
        response = generateWeatherClothingResponse(
          userName,
          weatherData.current,
          weatherAdvice,
          sentiment,
        );
        suggestions = weatherAdvice.items;
      } else {
        response = `${userName}さん、服装アドバイスをしたいのですが、今日の天気情報があるともっと具体的にお話しできます！先に天気データを取得してみてくださいね👔`;
        suggestions = ["天気データを取得", "一般的な服装のコツ"];
      }
      break;

    case "weather_general":
      if (weatherData && weatherData.current) {
        response = generateWeatherResponse(weatherData.current, userName);
        suggestions = getWeatherSuggestions(weatherData.current);
      } else {
        response = `${userName}さん、お天気のことですね！☁️ 天気によって一日の気分も変わりますよね。現在の天気情報があれば、詳しくお教えできますよ`;
        suggestions = ["天気データを取得", "天気について相談"];
      }
      break;

    case "fatigue_support":
      response = generateFatigueResponse(
        userName,
        userMessage,
        weatherData,
        sentiment,
      );
      mood = "caring";
      suggestions = [
        "ゆっくり休む",
        "温かい飲み物",
        "軽いストレッチ",
        "好きな音楽を聴く",
      ];
      break;

    case "appreciation":
      const thankfulResponses = [
        `${userName}さん、そう言ってもらえて嬉しいです！💕`,
        `${userName}さんのお役に立てて良かったです✨`,
        `ありがとうございます、${userName}さん！もっと頑張りますね`,
        `${userName}さんに喜んでもらえることが私の一番の幸せです♪`,
      ];
      response =
        thankfulResponses[Math.floor(Math.random() * thankfulResponses.length)];
      mood = "happy";
      break;

    case "activity_suggestion":
      if (weatherData && weatherData.current) {
        const activities = generatePersonalizedActivitySuggestions(
          weatherData.current,
          userPreferences,
        );
        response = generateActivityResponse(userName, activities, sentiment);
        suggestions = activities.options;
      } else {
        response = generateNoWeatherDataResponse(userName, "activity");
      }
      break;

    case "question":
      response = generateQuestionResponse(
        normalizedMessage,
        userName,
        weatherData,
        sentiment,
      );
      break;

    case "farewell":
      response = generateFarewellResponse(userName, sentiment);
      mood = "sad";
      break;

    case "request":
      response = generateHelpfulResponse(
        normalizedMessage,
        userName,
        sentiment,
      );
      break;

    default:
      response = generateContextualGeneral(
        normalizedMessage,
        userName,
        sentiment,
        entities,
      );
  }

  // 感情に応じてムード調整
  if (sentiment === "negative") {
    mood = "caring";
    if (!suggestions.length) {
      suggestions = ["深呼吸する", "お茶を飲む", "好きな音楽を聴く"];
    }
  } else if (sentiment === "positive") {
    mood = "happy";
  }

  return { response, mood, suggestions, weatherAdvice };
}

// コンテキスト別応答生成関数群
/**
 * 時間帯と天気情報を考慮したコンテキスト型挨拶を生成する
 * @param {string} userName - ユーザー名
 * @param {Object} weatherData - 天気データ
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} パーソナライズされた挨拶メッセージ
 */
function generateContextualGreeting(userName, weatherData, sentiment) {
  const timeOfDay = new Date().getHours();
  let timeGreeting = "";

  if (timeOfDay < 10) timeGreeting = "おはようございます";
  else if (timeOfDay < 18) timeGreeting = "こんにちは";
  else timeGreeting = "こんばんは";

  let baseResponse = `${timeGreeting}、${userName}さん！`;

  if (sentiment === "positive") {
    baseResponse += " 元気そうで何よりです♪";
  } else if (sentiment === "negative") {
    baseResponse += " 何かお困りのことがあれば、お話し聞きますよ。";
  }

  if (weatherData && weatherData.current) {
    baseResponse += ` ${getWeatherComment(weatherData.current)}`;
  }

  return baseResponse;
}

/**
 * 天気情報に基づいた服装アドバイス応答を生成する
 * @param {string} userName - ユーザー名
 * @param {Object} weather - 現在の天気情報
 * @param {Object} advice - 生成された服装アドバイス
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} 天気に応じた服装アドバイスメッセージ
 */
function generateWeatherClothingResponse(userName, weather, advice, sentiment) {
  let response = `${userName}さん、今日の服装についてですね！`;

  if (sentiment === "negative") {
    response = `${userName}さん、体調に合わせた服装選びが大切ですね。`;
  }

  response += ` ${advice.advice}`;

  // 具体的なアドバイス追加
  if (weather.temperature < 10) {
    response += " 冷え込むので、重ね着で調整できるようにしてくださいね。";
  } else if (weather.temperature > 25) {
    response += " 暑くなりそうなので、涼しい素材がおすすめです。";
  }

  return response;
}

/**
 * ユーザーの感情状態に応じた活動提案応答を生成する
 * @param {string} userName - ユーザー名
 * @param {Object} activities - 提案する活動リスト
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} パーソナライズされた活動提案メッセージ
 */
function generateActivityResponse(userName, activities, sentiment) {
  let response = `${userName}さん、`;

  if (sentiment === "negative") {
    response += "リフレッシュできる活動はいかがでしょうか？";
  } else {
    response += `今日は${activities.main}はいかがですか？`;
  }

  return response;
}

/**
 * ユーザーの質問内容を分析して適切な応答を生成する
 * @param {string} message - ユーザーの質問メッセージ
 * @param {string} userName - ユーザー名
 * @param {Object} weatherData - 天気データ
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} 質問に対する応答メッセージ
 */
function generateQuestionResponse(message, userName, weatherData, sentiment) {
  // 質問の内容を分析して適切な応答
  if (message.includes("なぜ") || message.includes("どうして")) {
    return `${userName}さん、いい質問ですね！それについて考えてみましょう。`;
  } else if (message.includes("いつ") || message.includes("時間")) {
    return `${userName}さん、タイミングは大切ですよね。状況を見て判断しましょう。`;
  } else {
    return `${userName}さんの質問、興味深いです！一緒に考えてみましょう。`;
  }
}

/**
 * 天気データがない場合の応答を生成する
 * @param {string} userName - ユーザー名
 * @param {string} type - リクエストの種類（clothing/activity）
 * @returns {string} 天気データなしの場合の応答メッセージ
 */
function generateNoWeatherDataResponse(userName, type) {
  if (type === "clothing") {
    return `${userName}さん、服装アドバイスをしたいのですが、今日の天気情報があるともっと具体的にお話しできます！`;
  } else {
    return `${userName}さん、活動提案をしたいのですが、天気情報があるとより良い提案ができますよ。`;
  }
}

/**
 * 疲労を表現するメッセージに対する共感的な応答を生成する
 * @param {string} userName - ユーザー名
 * @param {string} message - 疲労を表現するメッセージ
 * @param {Object} weatherData - 天気データ（体調アドバイスに使用）
 * @param {string} sentiment - 感情の種類
 * @returns {string} 共感的で励ましの応答メッセージ
 */
function generateFatigueResponse(userName, message, weatherData, sentiment) {
  // メッセージの内容によって応答を調整
  let response = `${userName}さん、`;

  // くだけた表現の検出
  if (
    message.includes("なー") ||
    message.includes("よー") ||
    message.includes("はあ")
  ) {
    response += "お疲れ様です...本当にお疲れですね😔";
  } else if (message.includes("つかれた") || message.includes("疲れた")) {
    response += "お疲れ様でした。今日も頑張りましたね";
  } else if (message.includes("だるい") || message.includes("しんどい")) {
    response += "体調が優れないようですね。無理は禁物ですよ";
  } else {
    response += "なんだかお疲れのようですね";
  }

  // 天気情報があれば体調に関するアドバイスを追加
  if (weatherData && weatherData.current) {
    const temp = weatherData.current.temperature;
    const weather = weatherData.current.weather;

    if (temp < 15) {
      response += "。寒いので体を温めて、ゆっくり休んでくださいね🧥";
    } else if (temp > 25) {
      response +=
        "。暑いので水分補給を忘れずに、涼しい場所で休憩してください💧";
    } else if (weather === "rain") {
      response +=
        "。雨の日は気分も沈みがちですよね。温かい飲み物でも飲んでリラックスしましょう☔";
    } else {
      response += "。少し外の空気を吸うのもいいかもしれませんね🌸";
    }
  } else {
    response += "。温かい飲み物を飲んで、少し休憩してみてはいかがでしょう？";
  }

  // 激励の言葉を追加
  const encouragements = [
    "明日はきっといい日になりますよ",
    "あまり頑張りすぎず、自分を大切にしてくださいね",
    "疲れた時は休むのも大切です",
    "ゆっくり休んで、また元気になりましょう",
  ];

  response += ` ${encouragements[Math.floor(Math.random() * encouragements.length)]}✨`;

  return response;
}

/**
 * お別れの挨拶メッセージを生成する
 * @param {string} userName - ユーザー名
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} お別れの挨拶メッセージ
 */
function generateFarewellResponse(userName, sentiment) {
  const farewells = [
    `${userName}さん、またお話ししましょうね！`,
    `${userName}さん、素敵な時間をありがとうございました。`,
    `${userName}さん、お疲れ様でした！ゆっくり休んでくださいね。`,
  ];

  return farewells[Math.floor(Math.random() * farewells.length)];
}

/**
 * ユーザーからのリクエストに対するサポート的な応答を生成する
 * @param {string} message - ユーザーのリクエストメッセージ
 * @param {string} userName - ユーザー名
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} サポート的な応答メッセージ
 */
function generateHelpfulResponse(message, userName, sentiment) {
  return `${userName}さん、もちろんお手伝いします！何についてお話ししたいですか？`;
}

/**
 * 一般的な会話のためのコンテキスト型応答を生成する
 * @param {string} message - ユーザーのメッセージ
 * @param {string} userName - ユーザー名
 * @param {string} sentiment - ユーザーの感情状態
 * @param {Object} entities - 抽出されたエンティティ情報
 * @returns {string} コンテキストに応じた一般的な応答
 */
function generateContextualGeneral(message, userName, sentiment, entities) {
  // エンティティに基づいた応答
  if (entities.places.length > 0) {
    return `${userName}さん、${entities.places[0]}のお話ですね！興味深いです。`;
  } else if (entities.times.length > 0) {
    return `${userName}さん、時間に関するお話ですね。タイミングは大切ですよね。`;
  } else {
    const responses = [
      `${userName}さんのお話、とても興味深いです！`,
      `${userName}さん、もう少し詳しく教えてください。`,
      `${userName}さんとこうしてお話しできて嬉しいです。`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

/**
 * 天気データがない状態で天気関連の質問に応答する
 * @param {string} userName - ユーザー名
 * @param {string} message - ユーザーの天気関連メッセージ
 * @param {string} sentiment - ユーザーの感情状態
 * @returns {string} 天気データなしでも役立つ応答メッセージ
 */
function generateWeatherResponseWithoutData(userName, message, sentiment) {
  const message_lower = message.toLowerCase();

  // 寒さ・暑さの質問
  if (message_lower.includes("寒い") || message_lower.includes("寒く")) {
    return `${userName}さん、今日は寒そうですね。暖かい格好でお出かけくださいね🧥 具体的な天気情報があれば、もっと詳しくアドバイスできますよ！`;
  } else if (message_lower.includes("暑い") || message_lower.includes("暑く")) {
    return `${userName}さん、今日は暑そうですね。涼しい服装と水分補給を忘れずに☀️ 詳しい天気情報があれば、より具体的なアドバイスができます！`;
  }
  // 天気の質問全般
  else if (message_lower.includes("天気") || message_lower.includes("気温")) {
    return `${userName}さん、天気が気になりますよね！現在の天気データがあれば、詳しい情報やおすすめの服装をお教えできるのですが...🌤️ お住まいの地域の天気はいかがですか？`;
  }
  // 服装の質問
  else if (message_lower.includes("着る") || message_lower.includes("服")) {
    return `${userName}さん、服装選びですね！天気に合わせた服装が一番ですが、現在の気温や天候が分かればもっと具体的にアドバイスできます👔 今日の天気はどんな感じですか？`;
  }
  // 一般的な天気関連
  else {
    return `${userName}さん、お天気のことですね！☁️ 天気によって一日の気分も変わりますよね。現在の天気情報があれば、服装や活動のアドバイスもできますよ`;
  }
}

// ユーザープロフィール設定API
app.post("/api/user/profile", async (req, res) => {
  try {
    console.log("🔍 ユーザープロフィール設定リクエスト受信:", req.body);
    
    const {
      userId,
      userName,
      preferences = {},
      favoriteActivities = [],
      clothingStyle = "casual",
    } = req.body;

    // 詳細なリクエスト形式検証
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: "リクエストボディが不正です",
        details: "JSONオブジェクトが必要です",
      });
    }

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "有効なユーザーIDが必須です",
        details: "userIdは空でない文字列である必要があります",
      });
    }

    if (!userName || typeof userName !== 'string' || userName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "有効なユーザー名が必須です",
        details: "userNameは空でない文字列である必要があります",
      });
    }

    // preferencesの検証
    if (preferences && typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        error: "preferencesはオブジェクト形式である必要があります",
      });
    }

    // favoriteActivitiesの検証
    if (favoriteActivities && !Array.isArray(favoriteActivities)) {
      return res.status(400).json({
        success: false,
        error: "favoriteActivitiesは配列形式である必要があります",
      });
    }

    // データベースにプロフィールを保存
    const userProfile = {
      userId,
      userName,
      preferences: {
        temperature: preferences.temperature || "moderate",
        activities: preferences.activities || "both",
        style: preferences.style || clothingStyle,
        weatherSensitivity: preferences.weatherSensitivity || "normal",
      },
      favoriteActivities,
    };

    const result = await saveUserProfile(userProfile);

    if (result.success) {
      res.json({
        success: true,
        data: userProfile,
        message: `${userName}さんのプロフィールをデータベースに保存しました！`,
        dbResult: result,
      });
    } else {
      throw new Error("データベース保存に失敗しました");
    }
  } catch (error) {
    console.error("プロフィール設定エラー:", error.message);
    res.status(500).json({
      success: false,
      error: "プロフィールの設定に失敗しました",
      details: error.message,
    });
  }
});

// ユーザープロフィール取得API
app.get("/api/user/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "ユーザーIDが必要です",
      });
    }

    // データベースからプロフィールを取得
    const userProfile = await getUserProfile(userId);

    if (userProfile) {
      res.json({
        success: true,
        data: userProfile,
        message: "プロフィール情報をデータベースから取得しました",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "ユーザープロフィールが見つかりません",
        message: `ユーザーID: ${userId} のプロフィールは登録されていません`,
      });
    }
  } catch (error) {
    console.error("プロフィール取得エラー:", error.message);
    res.status(500).json({
      success: false,
      error: "プロフィールの取得に失敗しました",
      details: error.message,
    });
  }
});

// 診断用シンプルエンドポイント
app.get("/ping", (req, res) => {
  console.log("🔍 Pingエンドポイントに到達しました");
  res.send("pong");
});

// 会話履歴テスト用API（デバッグ）
app.get("/api/chat/test", (req, res) => {
  console.log("🔍 テストAPIエンドポイントに到達しました");
  res.json({
    success: true,
    message: "会話履歴APIテスト成功",
    timestamp: new Date().toISOString(),
  });
});

// 会話履歴取得API（元のバージョン - 一時的にコメントアウト）
/*
app.get('/api/chat/history/:userId', async (req, res) => {
  console.log('🔍 会話履歴APIエンドポイントに到達しました');
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    console.log(`📋 会話履歴取得リクエスト - UserID: ${userId}, Limit: ${limit}`);

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ユーザーIDが必要です'
      });
    }

    // データベースから会話履歴を取得
    const chatHistory = await getChatHistory(userId, parseInt(limit));

    console.log(`📋 会話履歴取得結果 - 件数: ${chatHistory.length}`);

    res.json({
      success: true,
      data: {
        userId,
        history: chatHistory,
        count: chatHistory.length
      },
      message: `${userId}の会話履歴を${chatHistory.length}件取得しました`
    });

  } catch (error) {
    console.error('会話履歴取得エラー:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: '会話履歴の取得に失敗しました',
      details: error.message,
      userId: req.params.userId,
      requestedLimit: req.query.limit
    });
  }
});
*/

// 404エラーハンドリング
app.use((req, res) => {
  console.log(
    `❌ 404 - エンドポイントが見つかりません: ${req.method} ${req.originalUrl}`,
  );
  res.status(404).json({
    success: false,
    error: "エンドポイントが見つかりません",
    method: req.method,
    path: req.originalUrl,
    availableEndpoints: [
      "GET /",
      "GET /api/weather/:lat/:lon",
      "POST /api/mascot/chat",
      "POST /api/user/profile",
      "GET /api/user/profile/:userId",
      "GET /api/chat/history/:userId",
      "GET /api/missions/today",
      "POST /api/missions/:missionId/progress",
    ],
  });
});

// サーバー起動とデータベース初期化
async function startServer() {
  try {
    // データベースを初期化
    console.log("🔄 データベースを初期化中...");
    await setupDatabase();
    console.log("✅ データベース初期化完了");

    // サーバー起動
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 API documentation: http://localhost:${PORT}`);
      console.log("💾 SQLiteデータベース接続済み");
    });
  } catch (error) {
    console.error("❌ サーバー起動エラー:", error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
