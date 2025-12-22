<style>
    /* Admin Custom Styles */
    .admin-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 1.5rem;
        color: white;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .admin-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }

    .stat-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        transition: transform 0.2s ease;
    }

    .stat-card:hover {
        transform: translateY(-2px);
    }

    .nav-item {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        transition: all 0.2s ease;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
    }

    .nav-item:hover {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
        text-decoration: none;
    }

    .nav-item.active {
        background: #667eea;
        color: white;
    }

    @media (prefers-color-scheme: dark) {
        .stat-card {
            background: #1f2937;
            color: #e5e7eb;
        }
        
        body {
            background-color: #111827;
        }
    }
    
    /* Tailwind base styles (simplified) */
    body {
        background-color: #f9fafb;
        font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
    }
    
    .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    
    @media (min-width: 768px) {
        .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    
    @media (min-width: 1024px) {
        .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    }
    
    .gap-6 { gap: 1.5rem; } .gap-4 { gap: 1rem; } .gap-3 { gap: 0.75rem; } .gap-2 { gap: 0.5rem; }
    .flex { display: flex; } .items-center { align-items: center; } .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; } .flex-1 { flex: 1 1 0%; }
    .space-x-4 > * + * { margin-left: 1rem; } .space-y-2 > * + * { margin-top: 0.5rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    
    .bg-white { background-color: #ffffff; } .bg-gray-50 { background-color: #f9fafb; }
    .bg-gray-100 { background-color: #f3f4f6; } .bg-blue-100 { background-color: #dbeafe; }
    .bg-green-100 { background-color: #dcfce7; } .bg-yellow-100 { background-color: #fef3c7; }
    .bg-purple-100 { background-color: #e9d5ff; }
    
    .text-gray-500 { color: #6b7280; } .text-gray-600 { color: #4b5563; } .text-gray-900 { color: #111827; }
    .text-blue-600 { color: #2563eb; } .text-green-600 { color: #16a34a; }
    .text-yellow-600 { color: #ca8a04; } .text-purple-600 { color: #9333ea; }
    
    .text-xs { font-size: 0.75rem; } .text-sm { font-size: 0.875rem; } .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; } .text-2xl { font-size: 1.5rem; }
    
    .font-medium { font-weight: 500; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
    
    .p-3 { padding: 0.75rem; } .p-6 { padding: 1.5rem; } .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; } .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; } .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; } .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    
    .ml-2 { margin-left: 0.5rem; } .ml-3 { margin-left: 0.75rem; } .ml-4 { margin-left: 1rem; }
    .mr-2 { margin-right: 0.5rem; } .mr-3 { margin-right: 0.75rem; } .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; } .mb-8 { margin-bottom: 2rem; } .mt-1 { margin-top: 0.25rem; }
    .mt-12 { margin-top: 3rem; }
    
    .w-8 { width: 2rem; } .h-8 { height: 2rem; } .h-16 { height: 4rem; } .w-full { width: 100%; }
    .max-w-md { max-width: 28rem; } .max-w-7xl { max-width: 80rem; } .min-h-screen { min-height: 100vh; }
    
    .rounded-full { border-radius: 9999px; } .rounded-lg { border-radius: 0.5rem; }
    
    .border-b { border-bottom-width: 1px; } .border-t { border-top-width: 1px; }
    .border-gray-100 { border-color: #f3f4f6; } .border-gray-200 { border-color: #e5e7eb; }
    .border-gray-700 { border-color: #374151; }
    
    .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
    
    .text-center { text-align: center; } .block { display: block; }
    
    .transition-colors { 
        transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; 
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); 
        transition-duration: 150ms; 
    }
    
    .last\\:border-b-0:last-child { border-bottom-width: 0; }
</style>