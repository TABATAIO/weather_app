# 🌤️ 天気マスコット API - フロントエンド連携ガイド

HTML/CSS/JavaScript から fetch API で天気マスコットバックエンドに接続する方法

## 🚀 **クイックスタート**

### 1. バックエンドサーバーの起動
```bash
cd Backend
npm install
npm start
```
サーバーは `http://localhost:3001` で起動します。

### 2. サンプルファイルの確認
- `sample-frontend.html` - 完全なサンプル画面
- `frontend-sample.js` - API連携のJavaScriptコード

### 3. ブラウザでテスト
```bash
# sample-frontend.htmlをブラウザで開く
open sample-frontend.html
```

## 📡 **API エンドポイント一覧**

### **天気情報取得**

#### 緯度経度で取得
```javascript
const response = await fetch('http://localhost:3001/api/weather/35.681236/139.767125');
const data = await response.json();
```

#### 都市名で取得
```javascript
const response = await fetch('http://localhost:3001/api/weather/city/tokyo');
const data = await response.json();
```

**利用可能な都市:**
- `tokyo` (東京)
- `osaka` (大阪)  
- `kyoto` (京都)
- `yokohama` (横浜)
- `nagoya` (名古屋)
- `fukuoka` (福岡)
- `sendai` (仙台)
- `hiroshima` (広島)
- `sapporo` (札幌)
- `naha` (那覇)

### **マスコット状態更新**
```javascript
const response = await fetch('http://localhost:3001/api/mascot/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        weatherCode: 100,
        temperature: 25,
        humidity: 65,
        precipitation: 0,
        windSpeed: 3,
        pressure: 1013
    })
});
```

### **AI会話機能**
```javascript
const response = await fetch('http://localhost:3001/api/mascot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: "今日の天気はどう？",
        userName: "ユーザー",
        weatherData: weatherDataObject, // オプション
        userId: "user_12345"
    })
});
```

### **天気アイコン取得**

#### 単体の天気アイコン
```javascript
const response = await fetch('http://localhost:3001/api/icon/100');
const data = await response.json();
```

#### 複数の天気アイコンを一括取得
```javascript
const response = await fetch('http://localhost:3001/api/weather/icons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        weatherCodes: [100, 200, 300, 400, 600]
    })
});
const data = await response.json();
```

## 📊 **レスポンスデータ構造**

### 天気情報レスポンス
```json
{
  "success": true,
  "data": {
    "requestId": "uuid-string",
    "location": {
      "lat": 35.681236,
      "lon": 139.767125
    },
    "current": {
      "datetime": "2025-12-08T15:00:00+09:00",
      "weather": "晴れ",
      "weatherCode": 100,
      "temperature": 22,
      "humidity": 73,
      "precipitation": 0,
      "windSpeed": 1,
      "windDirection": "N",
      "windDirectionCode": 16,
      "pressure": 1001,
      "icon": "https://tpf.weathernews.jp/wxicon/152/100.png"
    },
    "today": {
      "date": "2025-12-08T00:00:00+09:00",
      "maxTemp": 25,
      "minTemp": 15,
      "precipitationProbability": 20,
      "weatherCode": 100
    },
    "forecast": {
      "shortTerm": [...], // 24時間分
      "mediumTerm": [...]  // 7日分
    }
  }
}
```

### マスコット状態レスポンス
```json
{
  "success": true,
  "data": {
    "mood": "happy",
    "energy": 75,
    "happiness": 85,
    "comfort": 70,
    "weatherReaction": "今日はいい天気だね！☀️",
    "recommendations": [
      "日焼け止めと帽子を忘れずに",
      "お出かけに最適な天気"
    ],
    "weatherInfo": {
      "code": 100,
      "name": "晴れ",
      "icon": "https://tpf.weathernews.jp/wxicon/152/100.png"
    }
  }
}
```

### AI会話レスポンス
```json
{
  "success": true,
  "data": {
    "response": "今日は暖かくて気持ちいいですね！",
    "mood": "happy",
    "suggestions": ["公園でお散歩", "ピクニック"],
    "weatherAdvice": {
      "advice": "軽めの服装で大丈夫そうです",
      "items": ["半袖", "薄手の長袖", "ジーンズ"]
    }
  }
}
```

### 天気アイコン単体レスポンス
```json
{
  "success": true,
  "data": {
    "code": 100,
    "name": "晴れ",
    "icon": "https://tpf.weathernews.jp/wxicon/152/100.png",
    "category": "sunny",
    "timestamp": "2025-12-08T09:16:41.942Z"
  }
}
```

### 天気アイコン一括取得レスポンス
```json
{
  "success": true,
  "data": [
    {
      "code": 100,
      "name": "晴れ",
      "icon": "https://tpf.weathernews.jp/wxicon/152/100.png",
      "category": "sunny"
    },
    {
      "code": 200,
      "name": "くもり",
      "icon": "https://tpf.weathernews.jp/wxicon/152/200.png",
      "category": "cloudy"
    }
  ],
  "count": 2,
  "timestamp": "2025-12-08T09:16:41.942Z"
}
```

## 🎨 **HTML実装例**

### 基本的な天気表示
```html
<div class="weather-display">
    <img id="weather-icon" src="" alt="天気アイコン">
    <div id="temperature">--°C</div>
    <div id="weather-name">読み込み中...</div>
</div>

<script>
async function loadWeather() {
    const response = await fetch('http://localhost:3001/api/weather/city/tokyo');
    const data = await response.json();
    
    if (data.success) {
        document.getElementById('weather-icon').src = data.data.current.icon;
        document.getElementById('temperature').textContent = `${data.data.current.temperature}°C`;
        document.getElementById('weather-name').textContent = data.data.current.weather;
    }
}

loadWeather();
</script>
```

### 天気アイコンギャラリー表示
```html
<div class="weather-icons-gallery">
    <h3>天気アイコン一覧</h3>
    <div id="icon-container"></div>
</div>

<script>
async function loadWeatherIcons() {
    const commonCodes = [100, 200, 300, 400, 500, 600];
    
    const response = await fetch('http://localhost:3001/api/weather/icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weatherCodes: commonCodes })
    });
    
    const data = await response.json();
    
    if (data.success) {
        const container = document.getElementById('icon-container');
        container.innerHTML = '';
        
        data.data.forEach(weather => {
            const iconElement = document.createElement('div');
            iconElement.className = 'weather-icon-item';
            iconElement.innerHTML = `
                <img src="${weather.icon}" alt="${weather.name}" />
                <p>${weather.name}</p>
                <span class="weather-code">Code: ${weather.code}</span>
                <span class="weather-category">${weather.category}</span>
            `;
            container.appendChild(iconElement);
        });
    }
}

// 単体アイコン取得（サーバー再起動後に利用可能）
async function getSingleIcon(weatherCode) {
    const response = await fetch(`http://localhost:3001/api/icon/${weatherCode}`);
    const data = await response.json();
    
    if (data.success) {
        return data.data;
    }
    return null;
}

loadWeatherIcons();
</script>
```

### マスコット状態表示
```html
<div class="mascot-status">
    <div id="mascot-mood">気分: --</div>
    <div class="energy-bar">
        <div id="energy-fill" style="width: 0%;"></div>
    </div>
    <div id="weather-reaction">--</div>
</div>

<script>
async function updateMascot(weatherData) {
    const response = await fetch('http://localhost:3001/api/mascot/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            weatherCode: weatherData.current.weatherCode,
            temperature: weatherData.current.temperature,
            humidity: weatherData.current.humidity,
            precipitation: weatherData.current.precipitation,
            windSpeed: weatherData.current.windSpeed,
            pressure: weatherData.current.pressure
        })
    });
    
    const mascotData = await response.json();
    
    if (mascotData.success) {
        document.getElementById('mascot-mood').textContent = `気分: ${mascotData.data.mood}`;
        document.getElementById('energy-fill').style.width = `${mascotData.data.energy}%`;
        document.getElementById('weather-reaction').textContent = mascotData.data.weatherReaction;
    }
}
</script>
```

### チャット機能
```html
<div class="chat-container">
    <div id="chat-display"></div>
    <input type="text" id="chat-input" placeholder="メッセージを入力...">
    <button onclick="sendMessage()">送信</button>
</div>

<script>
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    const response = await fetch('http://localhost:3001/api/mascot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: message,
            userName: 'ユーザー',
            userId: 'user_001'
        })
    });
    
    const chatData = await response.json();
    
    if (chatData.success) {
        const chatDisplay = document.getElementById('chat-display');
        chatDisplay.innerHTML += `
            <div class="user-message">${message}</div>
            <div class="mascot-response">${chatData.data.response}</div>
        `;
        input.value = '';
    }
}

// Enterキーで送信
document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
</script>
```

## 🔧 **CORS設定**

バックエンドは以下のオリジンからのアクセスを許可しています：
- `http://localhost:3000`
- `http://localhost:8080`  
- `http://localhost:5000`
- `http://127.0.0.1:5500`

他のポートを使用する場合は、バックエンドの `server.js` の CORS 設定を更新してください。

## ⚠️ **エラーハンドリング**

```javascript
async function safeApiCall() {
    try {
        const response = await fetch('http://localhost:3001/api/weather/city/tokyo');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            console.error('API Error:', data.error);
            return null;
        }
        
        return data.data;
        
    } catch (error) {
        console.error('Network Error:', error);
        // ユーザーにエラーメッセージを表示
        showErrorMessage('データの取得に失敗しました');
        return null;
    }
}
```

## 🎯 **パフォーマンス最適化**

### データキャッシュ
```javascript
let weatherCache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10分

async function getCachedWeather(city) {
    const cacheKey = city;
    const now = Date.now();
    
    if (weatherCache[cacheKey] && (now - weatherCache[cacheKey].timestamp) < CACHE_DURATION) {
        return weatherCache[cacheKey].data;
    }
    
    const data = await getWeatherByCity(city);
    if (data) {
        weatherCache[cacheKey] = {
            data: data,
            timestamp: now
        };
    }
    
    return data;
}
```

### 画像のプリロード
```javascript
function preloadWeatherIcons() {
    const commonWeatherCodes = [100, 200, 300, 400]; // よく使われる天気コード
    
    commonWeatherCodes.forEach(code => {
        const img = new Image();
        img.src = `https://tpf.weathernews.jp/wxicon/152/${code}.png`;
    });
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', preloadWeatherIcons);
```

## 🔍 **デバッグのヒント**

### ブラウザ開発者ツール
1. **Network タブ** - API リクエストの確認
2. **Console タブ** - エラーメッセージの確認
3. **Application タブ** - キャッシュデータの確認

### よくある問題と解決法

**CORS エラー**
```
Access to fetch at 'http://localhost:3001' from origin 'null' has been blocked by CORS policy
```
→ ファイルを HTTP サーバーで提供する（Live Server 拡張など使用）

**API キーエラー**  
```
{"success": false, "error": "Weathernews APIキーが設定されていません"}
```
→ バックエンドの `.env` ファイルに `WEATHERNEWS_API_KEY` を設定

**データが表示されない**
→ ブラウザの開発者ツールでレスポンスデータを確認

これでフロントエンド側から fetch API で簡単に天気マスコットシステムを利用できます！🚀