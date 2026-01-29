<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    /**
     * ユーザー登録（外部API用）
     */
    public function externalRegister(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => $validator->errors()->first(),
                ], 400);
            }

            $user = User::create([
                'name' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'ユーザーが正常に作成されました',
                'userId' => $user->id,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'サーバーエラーが発生しました',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ユーザーログイン（外部API用）
     */
    public function externalLogin(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => $validator->errors()->first(),
                ], 400);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'error' => 'メールアドレスまたはパスワードが正しくありません',
                ], 401);
            }

            // Sanctumトークンを作成
            $token = $user->createToken('weather-app-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'ログインしました',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->name,
                    'email' => $user->email,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'サーバーエラーが発生しました',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * トークン検証（外部API用）
     */
    public function externalVerify(Request $request)
    {
        try {
            $token = $request->bearerToken();
            
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'error' => 'トークンが提供されていません',
                ], 401);
            }

            $personalAccessToken = PersonalAccessToken::findToken($token);

            if (!$personalAccessToken) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid token',
                ], 401);
            }

            $user = $personalAccessToken->tokenable;

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->name,
                    'email' => $user->email,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'トークン検証に失敗しました',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 通常のユーザー登録（Webアプリケーション用）
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    /**
     * 通常のユーザーログイン（Webアプリケーション用）
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['認証に失敗しました'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    /**
     * ログアウト
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json(['message' => 'ログアウトしました']);
    }

    /**
     * 認証されたユーザー情報取得
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * トークン検証
     */
    public function verifyToken(Request $request)
    {
        return response()->json([
            'valid' => true,
            'user' => $request->user()
        ]);
    }
}