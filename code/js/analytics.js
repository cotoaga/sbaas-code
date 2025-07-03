// Privacy-Compliant Analytics - Local tracking only

class CalculatorAnalytics {
    constructor() {
        this.sessionData = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            interactions: 0,
            calculations: 0,
            achievements: 0,
            maxCostDiscovered: 0,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            referrer: document.referrer || 'direct',
            pageUrl: window.location.href
        };
        
        this.interactionSequence = [];
        this.performanceMetrics = {};
        
        this.initializeTracking();
        this.setupPerformanceMonitoring();
    }
    
    initializeTracking() {
        // Track initial page load
        this.trackPageLoad();
        
        // Setup event listeners for automatic tracking
        this.setupAutomaticTracking();
        
        // Setup visibility change tracking
        this.setupVisibilityTracking();
        
        // Setup unload tracking
        this.setupUnloadTracking();
        
        console.log(`Analytics session started: ${this.sessionData.sessionId}`);
    }
    
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
    
    trackPageLoad() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        
        this.performanceMetrics.pageLoad = {
            loadTime: loadTime,
            domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            firstPaint: this.getFirstPaintTime(),
            timestamp: Date.now()
        };
        
        this.trackInteraction('page_load', {
            loadTime: loadTime,
            timestamp: Date.now()
        });
    }
    
    getFirstPaintTime() {
        try {
            const paintEntries = performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
            return firstPaint ? firstPaint.startTime : null;
        } catch (e) {
            return null;
        }
    }
    
    setupAutomaticTracking() {
        // Track clicks on interactive elements
        document.addEventListener('click', (e) => {
            if (e.target.matches('.slider, .result-card, .achievement-item, button')) {
                this.trackInteraction('click', {
                    element: e.target.tagName.toLowerCase(),
                    className: e.target.className,
                    id: e.target.id || null
                });
            }
        });
        
        // Track focus on input elements
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('.slider, input, button')) {
                this.trackInteraction('focus', {
                    element: e.target.tagName.toLowerCase(),
                    id: e.target.id || null
                });
            }
        });
        
        // Track keyboard interactions
        document.addEventListener('keydown', (e) => {
            if (e.target.matches('.slider')) {
                this.trackInteraction('keyboard_navigation', {
                    key: e.key,
                    element: e.target.id || null
                });
            }
        });
    }
    
    setupVisibilityTracking() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackInteraction('page_hidden', {
                    sessionDuration: Date.now() - this.sessionData.startTime
                });
            } else {
                this.trackInteraction('page_visible', {
                    timestamp: Date.now()
                });
            }
        });
    }
    
    setupUnloadTracking() {
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
        });
        
        // Fallback for mobile browsers
        window.addEventListener('pagehide', () => {
            this.trackSessionEnd();
        });
    }
    
    setupPerformanceMonitoring() {
        // Monitor FPS
        this.monitorFPS();
        
        // Monitor memory usage (if available)
        this.monitorMemoryUsage();
        
        // Monitor network information (if available)
        this.monitorNetworkInformation();
    }
    
    monitorFPS() {
        let lastTime = performance.now();
        let frameCount = 0;
        let fpsArray = [];
        
        const measureFPS = (currentTime) => {
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                fpsArray.push(fps);
                
                // Keep only last 60 measurements (1 minute at 1fps)
                if (fpsArray.length > 60) {
                    fpsArray.shift();
                }
                
                this.performanceMetrics.averageFPS = fpsArray.reduce((a, b) => a + b, 0) / fpsArray.length;
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                this.performanceMetrics.memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
            }, 30000); // Every 30 seconds
        }
    }
    
    monitorNetworkInformation() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.performanceMetrics.network = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            };
            
            connection.addEventListener('change', () => {
                this.performanceMetrics.network = {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData,
                    timestamp: Date.now()
                };
                
                this.trackInteraction('network_change', this.performanceMetrics.network);
            });
        }
    }
    
    trackInteraction(type, data = null) {
        this.sessionData.interactions++;
        
        const interaction = {
            type: type,
            data: data,
            timestamp: Date.now(),
            sessionTime: Date.now() - this.sessionData.startTime,
            sequenceNumber: this.interactionSequence.length + 1
        };
        
        this.interactionSequence.push(interaction);
        
        // Keep only last 100 interactions to prevent memory issues
        if (this.interactionSequence.length > 100) {
            this.interactionSequence.shift();
        }
        
        // Store patterns locally
        this.storeUsagePatterns(interaction);
        
        // Update session metrics
        this.updateSessionMetrics(type, data);
    }
    
    storeUsagePatterns(interaction) {
        try {
            const patterns = JSON.parse(localStorage.getItem('usage_patterns') || '[]');
            
            // Add anonymized interaction
            patterns.push({
                type: interaction.type,
                timestamp: interaction.timestamp,
                sessionId: this.sessionData.sessionId,
                sessionTime: interaction.sessionTime,
                data: this.anonymizeData(interaction.data)
            });
            
            // Keep only last 200 patterns
            if (patterns.length > 200) {
                patterns.splice(0, patterns.length - 200);
            }
            
            localStorage.setItem('usage_patterns', JSON.stringify(patterns));
        } catch (e) {
            console.warn('Failed to store usage patterns:', e);
        }
    }
    
    anonymizeData(data) {
        if (!data) return null;
        
        // Remove any potentially identifying information
        const anonymized = { ...data };
        
        // Remove or hash sensitive fields
        delete anonymized.userAgent;
        delete anonymized.pageUrl;
        delete anonymized.referrer;
        
        return anonymized;
    }
    
    updateSessionMetrics(type, data) {
        switch (type) {
            case 'calculation_completed':
                this.sessionData.calculations++;
                if (data && data > this.sessionData.maxCostDiscovered) {
                    this.sessionData.maxCostDiscovered = data;
                }
                break;
            
            case 'achievement_unlocked':
                this.sessionData.achievements++;
                break;
        }
    }
    
    trackSessionEnd() {
        const sessionDuration = Date.now() - this.sessionData.startTime;
        
        const sessionSummary = {
            sessionId: this.sessionData.sessionId,
            duration: sessionDuration,
            interactions: this.sessionData.interactions,
            calculations: this.sessionData.calculations,
            achievements: this.sessionData.achievements,
            maxCostDiscovered: this.sessionData.maxCostDiscovered,
            performanceMetrics: this.performanceMetrics,
            endTime: Date.now()
        };
        
        // Store session summary
        try {
            const sessions = JSON.parse(localStorage.getItem('session_summaries') || '[]');
            sessions.push(sessionSummary);
            
            // Keep only last 10 sessions
            if (sessions.length > 10) {
                sessions.shift();
            }
            
            localStorage.setItem('session_summaries', JSON.stringify(sessions));
        } catch (e) {
            console.warn('Failed to store session summary:', e);
        }
        
        console.log('Session ended:', sessionSummary);
    }
    
    getEngagementMetrics() {
        const sessionDuration = Date.now() - this.sessionData.startTime;
        const avgTimePerInteraction = this.sessionData.interactions > 0 ? 
            sessionDuration / this.sessionData.interactions : 0;
        
        return {
            sessionDuration: Math.round(sessionDuration / 1000), // seconds
            interactions: this.sessionData.interactions,
            calculations: this.sessionData.calculations,
            achievements: this.sessionData.achievements,
            avgTimePerInteraction: Math.round(avgTimePerInteraction),
            engagementScore: this.calculateEngagementScore()
        };
    }
    
    calculateEngagementScore() {
        const duration = Date.now() - this.sessionData.startTime;
        const durationMinutes = duration / 60000;
        
        let score = 0;
        
        // Base score from duration (max 30 points)
        score += Math.min(30, durationMinutes * 2);
        
        // Points for interactions (max 25 points)
        score += Math.min(25, this.sessionData.interactions);
        
        // Points for calculations (max 25 points)
        score += Math.min(25, this.sessionData.calculations * 5);
        
        // Points for achievements (max 20 points)
        score += Math.min(20, this.sessionData.achievements * 10);
        
        return Math.round(score);
    }
    
    getUsagePatterns() {
        try {
            const patterns = JSON.parse(localStorage.getItem('usage_patterns') || '[]');
            
            // Analyze patterns
            const analysis = {
                totalInteractions: patterns.length,
                uniqueSessions: [...new Set(patterns.map(p => p.sessionId))].length,
                mostCommonInteractions: this.getMostCommon(patterns, 'type'),
                averageSessionDuration: this.getAverageSessionDuration(patterns),
                peakUsageHours: this.getPeakUsageHours(patterns)
            };
            
            return analysis;
        } catch (e) {
            console.warn('Failed to analyze usage patterns:', e);
            return null;
        }
    }
    
    getMostCommon(array, property) {
        const counts = {};
        array.forEach(item => {
            const value = item[property];
            counts[value] = (counts[value] || 0) + 1;
        });
        
        return Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([value, count]) => ({ value, count }));
    }
    
    getAverageSessionDuration(patterns) {
        const sessionDurations = {};
        
        patterns.forEach(pattern => {
            if (!sessionDurations[pattern.sessionId]) {
                sessionDurations[pattern.sessionId] = 0;
            }
            sessionDurations[pattern.sessionId] = Math.max(
                sessionDurations[pattern.sessionId], 
                pattern.sessionTime
            );
        });
        
        const durations = Object.values(sessionDurations);
        return durations.length > 0 ? 
            durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    }
    
    getPeakUsageHours(patterns) {
        const hourCounts = {};
        
        patterns.forEach(pattern => {
            const hour = new Date(pattern.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        
        return Object.entries(hourCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([hour, count]) => ({ hour: parseInt(hour), count }));
    }
    
    getPerformanceReport() {
        return {
            ...this.performanceMetrics,
            sessionId: this.sessionData.sessionId,
            generatedAt: Date.now()
        };
    }
    
    exportAnalytics() {
        const exportData = {
            session: this.sessionData,
            interactions: this.interactionSequence,
            performance: this.performanceMetrics,
            engagement: this.getEngagementMetrics(),
            patterns: this.getUsagePatterns(),
            exportedAt: Date.now()
        };
        
        return exportData;
    }
    
    clearAnalytics() {
        // Clear local storage
        localStorage.removeItem('usage_patterns');
        localStorage.removeItem('session_summaries');
        
        // Reset session data
        this.sessionData = {
            ...this.sessionData,
            interactions: 0,
            calculations: 0,
            achievements: 0,
            maxCostDiscovered: 0
        };
        
        this.interactionSequence = [];
        
        console.log('Analytics data cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalculatorAnalytics;
}