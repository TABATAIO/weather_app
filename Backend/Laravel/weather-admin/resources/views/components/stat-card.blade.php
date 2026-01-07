@props(['icon', 'title', 'value', 'color' => 'blue'])

<div class="stat-card">
    <div class="flex items-center">
        <div class="p-3 rounded-full bg-{{ $color }}-100">
            <i class="{{ $icon }} text-{{ $color }}-600"></i>
        </div>
        <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">{{ $title }}</h3>
            <p class="text-2xl font-bold text-gray-900">{{ $value }}</p>
        </div>
    </div>
</div>