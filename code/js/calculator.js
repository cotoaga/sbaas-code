// Cost of Delay Calculator - Core Logic

// Value mappings for logarithmic sliders
const REVENUE_VALUES = [100000, 500000, 1000000, 5000000, 10000000];
const REVENUE_LABELS = ['€0.1M', '€0.5M', '€1.0M', '€5.0M', '€10M'];

const MARGIN_VALUES = [1, 2, 5, 10, 25];
const MARGIN_LABELS = ['1%', '2%', '5%', '10%', '25%'];

const GROWTH_VALUES = [2, 5, 10, 15, 25, 50];
const GROWTH_LABELS = ['2%', '5%', '10%', '15%', '25%', '50%'];

const DELAY_VALUES = [1, 3, 6, 12, 24];
const DELAY_LABELS = ['1m', '3m', '6m', '1y', '2y'];

class CostCalculator {
    constructor() {
        this.achievementSystem = new AchievementSystem();
        this.analytics = new CalculatorAnalytics();
        this.initializeSliders();
        this.initializeCalculation();
        this.updateCalculation();
    }
    
    initializeSliders() {
        // Revenue slider
        this.setupSlider('revenue', REVENUE_VALUES, REVENUE_LABELS, 2, (value, index) => {
            this.achievementSystem.trackAction('revenue_changes');
            this.achievementSystem.trackAction('max_revenue_tested', value);
            this.analytics.trackInteraction('revenue_change', value);
            this.updateCalculation();
        });
        
        // Margin slider
        this.setupSlider('margin', MARGIN_VALUES, MARGIN_LABELS, 2, (value, index) => {
            this.achievementSystem.trackAction('margin_changes');
            this.analytics.trackInteraction('margin_change', value);
            this.updateCalculation();
        });
        
        // Growth slider
        this.setupSlider('growth', GROWTH_VALUES, GROWTH_LABELS, 2, (value, index) => {
            this.achievementSystem.trackAction('growth_changes');
            this.analytics.trackInteraction('growth_change', value);
            this.updateCalculation();
        });
        
        // Delay slider
        this.setupSlider('delay', DELAY_VALUES, DELAY_LABELS, 2, (value, index) => {
            this.achievementSystem.trackAction('delay_changes');
            this.achievementSystem.trackAction('max_delay_tested', value);
            this.analytics.trackInteraction('delay_change', value);
            this.updateCalculation();
        });
    }
    
    setupSlider(id, values, labels, defaultIndex, onChange) {
        const slider = document.getElementById(`${id}-slider`);
        const valueDisplay = document.getElementById(`${id}-value`);
        
        if (!slider || !valueDisplay) {
            console.error(`Slider elements not found for ${id}`);
            return;
        }
        
        // Set initial value
        slider.value = defaultIndex;
        valueDisplay.textContent = labels[defaultIndex];
        
        // Add event listener
        slider.addEventListener('input', (e) => {
            const index = parseInt(e.target.value);
            const value = values[index];
            const label = labels[index];
            
            // Update display with animation
            valueDisplay.textContent = label;
            valueDisplay.classList.add('updating');
            setTimeout(() => valueDisplay.classList.remove('updating'), 300);
            
            // Add active state to container
            const container = slider.closest('.slider-container');
            container.classList.add('active');
            setTimeout(() => container.classList.remove('active'), 200);
            
            // Call onChange callback
            if (onChange) {
                onChange(value, index);
            }
        });
    }
    
    getSliderValue(id, values) {
        const slider = document.getElementById(`${id}-slider`);
        if (!slider) return values[0];
        
        const index = parseInt(slider.value);
        return values[index];
    }
    
    updateCalculation() {
        const results = this.calculateCostOfDelay();
        this.displayResults(results);
        this.updateImpactStyling(results.totalCost);
    }
    
    calculateCostOfDelay() {
        const revenue = this.getSliderValue('revenue', REVENUE_VALUES);
        const margin = this.getSliderValue('margin', MARGIN_VALUES);
        const growth = this.getSliderValue('growth', GROWTH_VALUES);
        const delay = this.getSliderValue('delay', DELAY_VALUES);
        
        // Enhanced calculation with compound effects
        const monthlyRevenue = revenue;
        const monthlyProfit = monthlyRevenue * (margin / 100);
        const potentialGrowthRevenue = monthlyRevenue * (1 + growth / 100);
        const monthlyGrowthImpact = potentialGrowthRevenue - monthlyRevenue;
        const monthlyProfitImpact = monthlyGrowthImpact * (margin / 100);
        
        // Direct loss calculation
        const directRevenueLoss = monthlyGrowthImpact * delay;
        const directProfitLoss = monthlyProfitImpact * delay;
        
        // Compound opportunity cost (exponential growth lost)
        const compoundFactor = Math.pow(1 + growth / 100, delay) - 1;
        const compoundOpportunityCost = monthlyRevenue * compoundFactor;
        
        // Total cost of delay
        const totalCost = directRevenueLoss + compoundOpportunityCost;
        
        // Track for achievements
        this.achievementSystem.trackAction('calculations_completed');
        this.achievementSystem.trackAction('max_cost_discovered', totalCost);
        this.analytics.trackInteraction('calculation_completed', totalCost);
        
        return {
            monthlyProfitImpact,
            directRevenueLoss,
            compoundOpportunityCost,
            totalCost,
            revenue,
            margin,
            growth,
            delay
        };
    }
    
    displayResults(results) {
        const elements = {
            totalCost: document.getElementById('total-cost'),
            monthlyImpact: document.getElementById('monthly-impact'),
            directLoss: document.getElementById('direct-loss'),
            compoundCost: document.getElementById('compound-cost')
        };
        
        // Check if all elements exist
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Result element not found: ${key}`);
                return;
            }
        }
        
        // Format and display values with animation
        this.animateValueUpdate(elements.totalCost, this.formatCurrency(results.totalCost));
        this.animateValueUpdate(elements.monthlyImpact, this.formatCurrency(results.monthlyProfitImpact));
        this.animateValueUpdate(elements.directLoss, this.formatCurrency(results.directRevenueLoss));
        this.animateValueUpdate(elements.compoundCost, this.formatCurrency(results.compoundOpportunityCost));
    }
    
    animateValueUpdate(element, newValue) {
        element.classList.add('pulse');
        element.textContent = newValue;
        setTimeout(() => element.classList.remove('pulse'), 600);
    }
    
    formatCurrency(value) {
        if (value >= 1000000) {
            return `€${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `€${(value / 1000).toFixed(0)}K`;
        } else {
            return `€${value.toFixed(0)}`;
        }
    }
    
    updateImpactStyling(totalCost) {
        const resultsPanel = document.querySelector('.results-panel');
        if (!resultsPanel) return;
        
        // Remove existing impact classes
        resultsPanel.classList.remove('high-impact', 'medium-impact', 'low-impact');
        
        // Add appropriate impact class based on cost
        if (totalCost >= 1000000) {
            resultsPanel.classList.add('high-impact');
        } else if (totalCost >= 100000) {
            resultsPanel.classList.add('medium-impact');
        } else {
            resultsPanel.classList.add('low-impact');
        }
    }
    
    initializeCalculation() {
        // Add any initialization logic here
        console.log('Cost of Delay Calculator initialized');
    }
    
    // Public methods for external access
    getCurrentValues() {
        return {
            revenue: this.getSliderValue('revenue', REVENUE_VALUES),
            margin: this.getSliderValue('margin', MARGIN_VALUES),
            growth: this.getSliderValue('growth', GROWTH_VALUES),
            delay: this.getSliderValue('delay', DELAY_VALUES)
        };
    }
    
    getCalculationResults() {
        return this.calculateCostOfDelay();
    }
    
    exportResults() {
        const results = this.calculateCostOfDelay();
        const values = this.getCurrentValues();
        
        const exportData = {
            timestamp: new Date().toISOString(),
            inputs: {
                monthlyRevenue: this.formatCurrency(values.revenue),
                profitMargin: `${values.margin}%`,
                growthRate: `${values.growth}%`,
                delayPeriod: `${values.delay} months`
            },
            results: {
                totalCostOfDelay: this.formatCurrency(results.totalCost),
                monthlyImpact: this.formatCurrency(results.monthlyProfitImpact),
                directLoss: this.formatCurrency(results.directRevenueLoss),
                compoundCost: this.formatCurrency(results.compoundOpportunityCost)
            }
        };
        
        this.analytics.trackInteraction('export_results', results.totalCost);
        return exportData;
    }
}

// Utility functions
function debounce(func, wait) {
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

function formatNumber(num) {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function formatPercentage(num) {
    return `${num.toFixed(1)}%`;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CostCalculator;
}