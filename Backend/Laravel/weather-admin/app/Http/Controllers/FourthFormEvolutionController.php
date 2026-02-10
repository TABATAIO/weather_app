<?php

namespace App\Http\Controllers;

use App\Models\FourthFormEvolution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FourthFormEvolutionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $evolutions = FourthFormEvolution::orderBy('evolution_from')
                                       ->orderBy('sort_order')
                                       ->orderBy('name')
                                       ->get();
        
        return view('admin.fourth-form-evolutions.index', compact('evolutions'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.fourth-form-evolutions.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'evolution_from' => 'required|in:active,calm',
            'evolution_condition_type' => 'required|in:level,special_item,weather_condition,time_condition,friendship',
            'evolution_condition_value' => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0'
        ]);

        $validated['is_active'] = $request->has('is_active');
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        try {
            // 画像アップロード処理
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('fourth-form-evolutions', 'public');
                $validated['image_path'] = $imagePath;
            }

            FourthFormEvolution::create($validated);

            return redirect()->route('admin.fourth-form-evolutions.index')
                           ->with('success', '第四形態が正常に追加されました。');
        } catch (\Exception $e) {
            \Log::error('第四形態の追加中にエラーが発生しました: ' . $e->getMessage());
            return redirect()->route('admin.fourth-form-evolutions.create')
                           ->with('error', '第四形態の追加中にエラーが発生しました: ' . $e->getMessage())
                           ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(FourthFormEvolution $fourthFormEvolution)
    {
        return view('admin.fourth-form-evolutions.show', compact('fourthFormEvolution'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FourthFormEvolution $fourthFormEvolution)
    {
        return view('admin.fourth-form-evolutions.edit', compact('fourthFormEvolution'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FourthFormEvolution $fourthFormEvolution)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp',
            'evolution_from' => 'required|in:active,calm',
            'evolution_condition_type' => 'required|in:level,special_item,weather_condition,time_condition,friendship',
            'evolution_condition_value' => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0'
        ]);

        $validated['is_active'] = $request->has('is_active');

        try {
            // 画像アップロード処理
            if ($request->hasFile('image')) {
                // 古い画像を削除
                if ($fourthFormEvolution->image_path && Storage::disk('public')->exists($fourthFormEvolution->image_path)) {
                    Storage::disk('public')->delete($fourthFormEvolution->image_path);
                }
                // 新しい画像を保存
                $imagePath = $request->file('image')->store('fourth-form-evolutions', 'public');
                $validated['image_path'] = $imagePath;
            }

            $fourthFormEvolution->update($validated);

            return redirect()->route('admin.fourth-form-evolutions.index')
                           ->with('success', '第四形態が正常に更新されました。');
        } catch (\Exception $e) {
            \Log::error('第四形態の更新中にエラーが発生しました: ' . $e->getMessage());
            return redirect()->route('admin.fourth-form-evolutions.edit', $fourthFormEvolution)
                           ->with('error', '第四形態の更新中にエラーが発生しました: ' . $e->getMessage())
                           ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FourthFormEvolution $fourthFormEvolution)
    {
        try {
            // 画像ファイルを削除
            if ($fourthFormEvolution->image_path && Storage::disk('public')->exists($fourthFormEvolution->image_path)) {
                Storage::disk('public')->delete($fourthFormEvolution->image_path);
            }

            $fourthFormEvolution->delete();

            return redirect()->route('admin.fourth-form-evolutions.index')
                           ->with('success', '第四形態が正常に削除されました。');
        } catch (\Exception $e) {
            \Log::error('第四形態の削除中にエラーが発生しました: ' . $e->getMessage());
            return redirect()->route('admin.fourth-form-evolutions.index')
                           ->with('error', '第四形態の削除中にエラーが発生しました: ' . $e->getMessage());
        }
    }
}
