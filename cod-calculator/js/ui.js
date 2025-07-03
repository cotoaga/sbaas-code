// UI Interactions and Enhancements

class UIManager {
    constructor() {
        this.initializeUI();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupTooltips();
    }
    
    initializeUI() {
        // Add loading state management
        this.isLoading = false;
        
        // Initialize progress indicators
        this.initializeProgressIndicators();
        
        // Setup animation observers
        this.setupAnimationObservers();
        
        // Initialize accessibility features
        this.setupAccessibility();
        
        console.log('UI Manager initialized');
    }
    
    setupEventListeners() {
        // Window resize handler
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
        
        // Scroll handlers for parallax and animations
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
        
        // Focus management
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        document.addEventListener('focusout', this.handleFocusOut.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Mouse interactions
        document.addEventListener('mousemove', this.throttle(this.handleMouseMove.bind(this), 16));
        
        // Touch gestures for mobile
        this.setupTouchGestures();
    }
    
    setupKeyboardNavigation() {
        // Add keyboard navigation for sliders
        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
            slider.addEventListener('keydown', (e) => {
                let step = 1;
                if (e.shiftKey) step = 1; // Fine control
                if (e.ctrlKey || e.metaKey) step = 1; // Coarse control
                
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'ArrowDown':
                        e.preventDefault();
                        this.adjustSlider(slider, -step);
                        break;
                    case 'ArrowRight':
                    case 'ArrowUp':
                        e.preventDefault();
                        this.adjustSlider(slider, step);
                        break;
                    case 'Home':
                        e.preventDefault();
                        slider.value = slider.min;
                        slider.dispatchEvent(new Event('input'));
                        break;
                    case 'End':
                        e.preventDefault();
                        slider.value = slider.max;
                        slider.dispatchEvent(new Event('input'));
                        break;
                }
            });
        });
    }
    
    adjustSlider(slider, delta) {
        const current = parseInt(slider.value);
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const newValue = Math.max(min, Math.min(max, current + delta));
        
        slider.value = newValue;
        slider.dispatchEvent(new Event('input'));
    }
    
    setupTooltips() {
        // Add tooltips for complex elements
        const tooltipData = {
            'revenue-slider': 'Monthly revenue represents your current business income per month',
            'margin-slider': 'Profit margin is the percentage of revenue that becomes profit',
            'growth-slider': 'Growth rate represents the monthly growth percentage you expect',
            'delay-slider': 'Project delay is how long the project will be postponed'
        };
        
        Object.entries(tooltipData).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                this.addTooltip(element, text);
            }
        });
    }
    
    addTooltip(element, text) {
        const container = element.closest('.slider-container');
        if (!container) return;
        
        const label = container.querySelector('label');
        if (!label) return;
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
            <span class="tooltip-icon">?</span>
            <span class="tooltiptext">${text}</span>
        `;
        
        // Add CSS for tooltip icon
        const style = document.createElement('style');
        style.textContent = `
            .tooltip-icon {
                display: inline-block;
                width: 16px;
                height: 16px;
                background: var(--blue-light);
                color: var(--white);
                border-radius: 50%;
                text-align: center;
                line-height: 16px;
                font-size: 12px;
                margin-left: 8px;
                cursor: help;
            }
        `;
        
        if (!document.head.querySelector('style[data-tooltip]')) {
            style.setAttribute('data-tooltip', 'true');
            document.head.appendChild(style);
        }
        
        label.appendChild(tooltip);
    }
    
    setupAnimationObservers() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '50px'
        };
        
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);
        
        // Observe elements that should animate in
        const animatedElements = document.querySelectorAll('.slider-container, .result-card, .achievement-item');
        animatedElements.forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }
    
    setupAccessibility() {
        // Add ARIA labels and descriptions
        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
            const container = slider.closest('.slider-container');
            const label = container.querySelector('label');
            const valueDisplay = container.querySelector('.slider-value');
            
            if (label) {
                slider.setAttribute('aria-labelledby', label.textContent);
            }
            
            if (valueDisplay) {
                slider.setAttribute('aria-describedby', valueDisplay.textContent);
            }
            
            // Add live region for value updates
            slider.setAttribute('aria-live', 'polite');
        });
        
        // Add skip navigation link
        this.addSkipNavigation();
    }
    
    addSkipNavigation() {
        const skipLink = document.createElement('a');
        skipLink.href = '#calculator-form';
        skipLink.textContent = 'Skip to calculator';
        skipLink.className = 'skip-navigation';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--blue-primary);
            color: var(--white);
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    setupTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;
            
            const deltaX = touchStartX - touchEndX;
            const deltaY = touchStartY - touchEndY;
            
            // Prevent default scroll behavior for horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault();
            }
        });
    }
    
    handleResize() {
        // Update layout calculations
        this.updateLayoutCalculations();
        
        // Recalculate tooltip positions
        this.updateTooltipPositions();
        
        // Emit resize event for other components
        this.emit('resize');
    }
    
    handleScroll() {
        // Update scroll-based animations
        this.updateScrollAnimations();
        
        // Update navigation state
        this.updateNavigationState();
    }
    
    handleFocusIn(e) {
        // Add focus styles
        const container = e.target.closest('.slider-container');
        if (container) {
            container.classList.add('focused');
        }
    }
    
    handleFocusOut(e) {
        // Remove focus styles
        const container = e.target.closest('.slider-container');
        if (container) {
            container.classList.remove('focused');
        }
    }
    
    handleKeydown(e) {
        // Handle global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    this.resetCalculator();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportResults();
                    break;
                case 'h':
                    e.preventDefault();
                    this.showHelp();
                    break;
            }
        }
        
        // Handle Escape key
        if (e.key === 'Escape') {
            this.closeModals();
        }
    }
    
    handleMouseMove(e) {
        // Update cursor effects
        this.updateCursorEffects(e);
    }
    
    updateLayoutCalculations() {
        // Recalculate dynamic layouts
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Update CSS custom properties
        document.documentElement.style.setProperty('--viewport-width', `${viewport.width}px`);
        document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`);
    }
    
    updateTooltipPositions() {
        // Recalculate tooltip positions to prevent overflow
        const tooltips = document.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => {
            const rect = tooltip.getBoundingClientRect();
            const tooltipText = tooltip.querySelector('.tooltiptext');
            
            if (rect.left < 0) {
                tooltipText.style.left = '0';
                tooltipText.style.marginLeft = '0';
            } else if (rect.right > window.innerWidth) {
                tooltipText.style.right = '0';
                tooltipText.style.left = 'auto';
                tooltipText.style.marginLeft = '0';
            }
        });
    }
    
    updateScrollAnimations() {
        // Implement parallax or other scroll-based animations
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        
        // Update progress indicators based on scroll
        this.updateScrollProgress(scrollY, viewportHeight);
    }
    
    updateScrollProgress(scrollY, viewportHeight) {
        const documentHeight = document.documentElement.scrollHeight;
        const progress = scrollY / (documentHeight - viewportHeight);
        
        // Update progress bar or indicator
        this.emit('scroll-progress', progress);
    }
    
    updateNavigationState() {
        // Update navigation based on scroll position
        const scrollY = window.scrollY;
        const threshold = 100;
        
        if (scrollY > threshold) {
            document.body.classList.add('scrolled');
        } else {
            document.body.classList.remove('scrolled');
        }
    }
    
    updateCursorEffects(e) {
        // Implement cursor-following effects
        const cursor = document.querySelector('.cursor-follower');
        if (cursor) {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        }
    }
    
    initializeProgressIndicators() {
        // Add progress indicators for multi-step processes
        const progressContainer = document.querySelector('.progress-container');
        if (!progressContainer) return;
        
        const steps = ['Input', 'Calculate', 'Analyze', 'Export'];
        const progressHTML = steps.map((step, index) => `
            <div class="progress-step ${index === 0 ? 'active' : ''}" data-step="${index}">
                <span class="step-number">${index + 1}</span>
                <span class="step-label">${step}</span>
            </div>
        `).join('');
        
        progressContainer.innerHTML = progressHTML;
    }
    
    resetCalculator() {
        // Reset all sliders to default values
        const sliders = document.querySelectorAll('.slider');
        sliders.forEach(slider => {
            const defaultValue = Math.floor((parseInt(slider.min) + parseInt(slider.max)) / 2);
            slider.value = defaultValue;
            slider.dispatchEvent(new Event('input'));
        });
        
        this.emit('calculator-reset');
    }
    
    exportResults() {
        // Trigger results export
        this.emit('export-requested');
    }
    
    showHelp() {
        // Show help modal or guide
        this.emit('help-requested');
    }
    
    closeModals() {
        // Close any open modals
        const modals = document.querySelectorAll('.modal.open');
        modals.forEach(modal => {
            modal.classList.remove('open');
        });
    }
    
    // Event system for component communication
    emit(eventName, data = null) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
    
    // Utility functions
    debounce(func, wait) {
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
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Public API
    updateProgress(step) {
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach((stepEl, index) => {
            stepEl.classList.toggle('active', index === step);
            stepEl.classList.toggle('completed', index < step);
        });
    }
    
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }
    
    setLoading(isLoading) {
        this.isLoading = isLoading;
        document.body.classList.toggle('loading', isLoading);
    }
}

// Initialize UI Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}