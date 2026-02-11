/**
 * Performance Monitoring Utility
 * アプリケーションのパフォーマンスを監視・最適化するツール
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadStartTime: performance.now(),
            navigationStart: performance.timeOrigin,
            domContentLoaded: null,
            firstPaint: null,
            firstContentfulPaint: null,
            apiCallTimes: [],
            renderTimes: []
        };
        
        this.observers = new Map();
        this.init();
    }

    init() {
        // DOMContentLoaded timing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.metrics.domContentLoaded = performance.now() - this.metrics.loadStartTime;
                this.logMetric('DOM Content Loaded', this.metrics.domContentLoaded);
            });
        }

        // Paint timing
        this.observePaintTiming();
        
        // Resource loading
        this.observeResourceLoading();
        
        // Memory usage (if available)
        this.observeMemoryUsage();
    }

    /**
     * Paint timing observer
     */
    observePaintTiming() {
        if ('PerformanceObserver' in window) {
            try {
                const paintObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.name === 'first-paint') {
                            this.metrics.firstPaint = entry.startTime;
                            this.logMetric('First Paint', entry.startTime);
                        }
                        if (entry.name === 'first-contentful-paint') {
                            this.metrics.firstContentfulPaint = entry.startTime;
                            this.logMetric('First Contentful Paint', entry.startTime);
                        }
                    }
                });
                
                paintObserver.observe({ entryTypes: ['paint'] });
                this.observers.set('paint', paintObserver);
            } catch (error) {
                console.warn('Paint timing observation not supported:', error);
            }
        }
    }

    /**
     * Resource loading observer
     */
    observeResourceLoading() {
        if ('PerformanceObserver' in window) {
            try {
                const resourceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 1000) { // Log slow resources (>1s)
                            console.warn(`Slow resource detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
                        }
                    }
                });
                
                resourceObserver.observe({ entryTypes: ['resource'] });
                this.observers.set('resource', resourceObserver);
            } catch (error) {
                console.warn('Resource timing observation not supported:', error);
            }
        }
    }

    /**
     * Memory usage observer
     */
    observeMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const memoryUsage = {
                    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
                };
                
                // Warn if memory usage is high
                if (memoryUsage.used > memoryUsage.limit * 0.8) {
                    console.warn('High memory usage detected:', memoryUsage);
                }
                
                // Store latest memory info
                this.metrics.memoryUsage = memoryUsage;
            }, 30000); // Check every 30 seconds
        }
    }

    /**
     * Mark API call start
     */
    markApiStart(apiName) {
        const startMark = `api-${apiName}-start`;
        performance.mark(startMark);
        return startMark;
    }

    /**
     * Mark API call end and measure duration
     */
    markApiEnd(apiName, startMark) {
        const endMark = `api-${apiName}-end`;
        const measureName = `api-${apiName}-duration`;
        
        performance.mark(endMark);
        performance.measure(measureName, startMark, endMark);
        
        const measure = performance.getEntriesByName(measureName)[0];
        const duration = measure.duration;
        
        this.metrics.apiCallTimes.push({
            name: apiName,
            duration: duration,
            timestamp: Date.now()
        });
        
        this.logMetric(`API Call: ${apiName}`, duration);
        
        // Warn on slow API calls
        if (duration > 5000) {
            console.warn(`Slow API call detected: ${apiName} (${duration.toFixed(2)}ms)`);
        }
        
        return duration;
    }

    /**
     * Mark render start
     */
    markRenderStart(componentName) {
        const startMark = `render-${componentName}-start`;
        performance.mark(startMark);
        return startMark;
    }

    /**
     * Mark render end and measure duration
     */
    markRenderEnd(componentName, startMark) {
        const endMark = `render-${componentName}-end`;
        const measureName = `render-${componentName}-duration`;
        
        performance.mark(endMark);
        performance.measure(measureName, startMark, endMark);
        
        const measure = performance.getEntriesByName(measureName)[0];
        const duration = measure.duration;
        
        this.metrics.renderTimes.push({
            name: componentName,
            duration: duration,
            timestamp: Date.now()
        });
        
        if (duration > 16) { // Warn if render takes more than one frame (16ms at 60fps)
            console.warn(`Slow render detected: ${componentName} (${duration.toFixed(2)}ms)`);
        }
        
        return duration;
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        return {
            ...this.metrics,
            currentMemory: this.metrics.memoryUsage,
            averageApiTime: this.getAverageApiTime(),
            averageRenderTime: this.getAverageRenderTime()
        };
    }

    /**
     * Get average API call time
     */
    getAverageApiTime() {
        if (this.metrics.apiCallTimes.length === 0) return 0;
        
        const total = this.metrics.apiCallTimes.reduce((sum, call) => sum + call.duration, 0);
        return total / this.metrics.apiCallTimes.length;
    }

    /**
     * Get average render time
     */
    getAverageRenderTime() {
        if (this.metrics.renderTimes.length === 0) return 0;
        
        const total = this.metrics.renderTimes.reduce((sum, render) => sum + render.duration, 0);
        return total / this.metrics.renderTimes.length;
    }

    /**
     * Log performance metric
     */
    logMetric(name, value) {
        if (typeof value === 'number') {
            console.log(`📊 ${name}: ${value.toFixed(2)}ms`);
        } else {
            console.log(`📊 ${name}:`, value);
        }
    }

    /**
     * Debounce function for performance optimization
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function for performance optimization
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Request idle callback with fallback
     */
    static requestIdleCallback(callback, options = {}) {
        if ('requestIdleCallback' in window) {
            return requestIdleCallback(callback, options);
        } else {
            // Fallback for browsers that don't support requestIdleCallback
            return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 1);
        }
    }

    /**
     * Cleanup observers
     */
    destroy() {
        this.observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (error) {
                console.warn('Error disconnecting observer:', error);
            }
        });
        this.observers.clear();
    }
}

// Global performance monitor instance
window.perfMonitor = new PerformanceMonitor();

console.log('🚀 Performance Monitor initialized');