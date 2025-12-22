@props(['title', 'icon', 'description', 'buttons' => []])

<div class="admin-card">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">{{ $title }}</h3>
        <i class="{{ $icon }} text-2xl opacity-80"></i>
    </div>
    <p class="text-white/80 mb-4">{{ $description }}</p>
    <div class="space-y-2">
        @foreach($buttons as $button)
            @if($button['type'] === 'link')
                <a href="{{ $button['url'] }}" class="block w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors text-center">
                    <i class="{{ $button['icon'] }} mr-2"></i>{{ $button['text'] }}
                </a>
            @else
                <button onclick="{{ $button['onclick'] ?? '' }}" class="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors">
                    <i class="{{ $button['icon'] }} mr-2"></i>{{ $button['text'] }}
                </button>
            @endif
        @endforeach
    </div>
</div>