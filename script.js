class AchievementTracker {
    constructor() {
        this.userActions = {
            calculations_completed: 0,
            sliders_changed: { revenue: 0, margin: 0, growth: 0, delay: 0 },
            scenarios_explored: 0,
            insights_viewed: 0,
            exports_generated: 0
        };
        
        this.unlockedAchievements = new Set();
        this.scenarios = [];
        
        this.achievements = {
            strategic_thinker: {
                title: "Strategic Thinker",
                description: "Completed your first cost analysis",
                icon: "🎯",
                trigger: "first_calculation_complete",
                color: "var(--blue-primary)"
            },
            scenario_explorer: {
                title: "Scenario Explorer",
                description: "Tested different revenue scenarios",
                icon: "🔍",
                trigger: "revenue_slider_changed_3_times",
                color: "var(--blue-light)"
            },
            time_strategist: {
                title: "Time Strategist",
                description: "Analyzed multiple delay periods",
                icon: "⏰",
                trigger: "delay_slider_changed_3_times",
                color: "var(--green-primary)"
            },
            growth_analyst: {
                title: "Growth Analyst",
                description: "Explored high-growth scenarios (25%+)",
                icon: "📈",
                trigger: "growth_rate_above_25_percent",
                color: "var(--blue-dark)"
            },
            scenario_master: {
                title: "Scenario Master",
                description: "Compared 5+ different calculations",
                icon: "🧮",
                trigger: "scenario_comparisons_5_plus",
                color: "var(--green-primary)",
                unlocks: "comparison_mode"
            },
            board_ready: {
                title: "Board Ready",
                description: "Generated executive summary",
                icon: "📊",
                trigger: "export_summary_clicked",
                color: "var(--blue-primary)",
                unlocks: "advanced_export"
            }
        };
        
        this.businessInsights = {
            revenue_high: {
                trigger: revenue => revenue > 5000000,
                message: "💡 Enterprise Insight: At this revenue scale, even 1% delays can impact quarterly results significantly.",
                type: "education"
            },
            growth_aggressive: {
                trigger: growth => growth > 20,
                message: "🚀 Growth Insight: High-growth scenarios compound delay costs exponentially - time becomes your most valuable resource.",
                type: "strategic"
            },
            delay_extended: {
                trigger: delay => delay > 12,
                message: "⚠️ Strategic Warning: Extended delays often indicate deeper organizational challenges beyond just timing.",
                type: "warning"
            }
        };
    }
    
    trackAction(action, details = {}) {
        switch(action) {
            case 'slider_changed':
                this.userActions.sliders_changed[details.slider]++;
                break;
            case 'calculation_completed':
                this.userActions.calculations_completed++;
                this.scenarios.push(details.results);
                break;
            case 'export_clicked':
                this.userActions.exports_generated++;
                break;
        }
        
        this.checkAchievements();
        this.updateConfidenceMeter();
    }
    
    checkAchievements() {
        Object.entries(this.achievements).forEach(([key, achievement]) => {
            if (!this.unlockedAchievements.has(key)) {
                if (this.meetsRequirement(achievement.trigger)) {
                    this.unlockAchievement(key, achievement);
                }
            }
        });
    }
    
    meetsRequirement(trigger) {
        switch(trigger) {
            case 'first_calculation_complete':
                return this.userActions.calculations_completed >= 1;
            case 'revenue_slider_changed_3_times':
                return this.userActions.sliders_changed.revenue >= 3;
            case 'delay_slider_changed_3_times':
                return this.userActions.sliders_changed.delay >= 3;
            case 'growth_rate_above_25_percent':
                return calculator && calculator.getCurrentValues().growth >= 0.25;
            case 'scenario_comparisons_5_plus':
                return this.scenarios.length >= 5;
            case 'export_summary_clicked':
                return this.userActions.exports_generated >= 1;
            default:
                return false;
        }
    }
    
    unlockAchievement(key, achievement) {
        this.unlockedAchievements.add(key);
        this.showAchievementNotification(achievement);
        
        if (achievement.unlocks) {
            this.unlockFeature(achievement.unlocks);
        }
    }
    
    showAchievementNotification(achievement) {
        const notification = document.getElementById('achievementNotification');
        const icon = document.getElementById('achievementIcon');
        const title = document.getElementById('achievementTitle');
        const description = document.getElementById('achievementDescription');
        
        icon.textContent = achievement.icon;
        title.textContent = achievement.title;
        description.textContent = achievement.description;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
    
    unlockFeature(featureName) {
        switch(featureName) {
            case 'comparison_mode':
                document.getElementById('comparisonMode').classList.remove('hidden');
                document.getElementById('comparisonMode').classList.add('animate-slide-up');
                this.updateScenarioComparison();
                break;
            case 'advanced_export':
                document.getElementById('advancedExport').classList.remove('hidden');
                document.getElementById('advancedExport').classList.add('animate-slide-up');
                break;
        }
    }
    
    updateScenarioComparison() {
        if (this.scenarios.length >= 3) {
            const sorted = [...this.scenarios].sort((a, b) => a.totalCost - b.totalCost);
            
            document.getElementById('conservative-value').textContent = calculator.formatCurrency(sorted[0].totalCost);
            document.getElementById('current-value').textContent = calculator.formatCurrency(sorted[Math.floor(sorted.length / 2)].totalCost);
            document.getElementById('aggressive-value').textContent = calculator.formatCurrency(sorted[sorted.length - 1].totalCost);
        }
    }
    
    updateConfidenceMeter() {
        let confidence = 40;
        
        if (this.userActions.sliders_changed.revenue >= 2) confidence += 15;
        if (this.userActions.sliders_changed.growth >= 2) confidence += 15;
        if (this.scenarios.length >= 3) confidence += 15;
        if (this.userActions.insights_viewed >= 2) confidence += 15;
        
        confidence = Math.min(confidence, 100);
        
        const valueElement = document.getElementById('confidenceValue');
        const fillElement = document.getElementById('confidenceFill');
        
        valueElement.textContent = `${confidence}%`;
        fillElement.style.width = `${confidence}%`;
        
        this.updateConfidenceFactors(confidence);
    }
    
    updateConfidenceFactors(confidence) {
        const factors = {
            'factor-revenue': this.userActions.sliders_changed.revenue >= 2,
            'factor-growth': this.userActions.sliders_changed.growth >= 2,
            'factor-comparison': this.scenarios.length >= 3,
            'factor-insights': this.userActions.insights_viewed >= 2
        };
        
        Object.entries(factors).forEach(([id, completed]) => {
            const element = document.getElementById(id);
            element.className = completed ? 'factor completed' : 'factor pending';
            element.textContent = (completed ? '✓ ' : '○ ') + element.textContent.substring(2);
        });
    }
    
    showBusinessInsight(values) {
        Object.entries(this.businessInsights).forEach(([key, insight]) => {
            if (insight.trigger(values.revenue) || insight.trigger(values.growth * 100) || insight.trigger(values.delayMonths)) {
                this.displayInsightTooltip(insight);
                this.userActions.insights_viewed++;
            }
        });
    }
    
    displayInsightTooltip(insight) {
        const tooltip = document.createElement('div');
        tooltip.className = `business-insight show ${insight.type}`;
        tooltip.textContent = insight.message;
        
        const activeSlider = document.querySelector('.slider-container.active');
        if (activeSlider) {
            activeSlider.appendChild(tooltip);
            
            setTimeout(() => {
                tooltip.classList.remove('show');
                setTimeout(() => tooltip.remove(), 300);
            }, 3000);
        }
    }
}

class CostOfDelayCalculator {
    constructor() {
        this.revenueValues = [100000, 500000, 1000000, 5000000, 10000000];
        this.revenueLabels = ['€100,000', '€500,000', '€1,000,000', '€5,000,000', '€10,000,000'];
        
        this.marginValues = [1, 2, 5, 10, 25];
        this.marginLabels = ['1%', '2%', '5%', '10%', '25%'];
        
        this.growthValues = [2, 5, 10, 15, 25, 50];
        this.growthLabels = ['2%', '5%', '10%', '15%', '25%', '50%'];
        
        this.delayValues = [1, 3, 6, 12, 24];
        this.delayLabels = ['1 month', '3 months', '6 months', '1 year', '2 years'];
        
        this.achievementTracker = new AchievementTracker();
        
        this.initializeEventListeners();
        this.updateCalculation();
    }
    
    initializeEventListeners() {
        const sliders = ['revenue', 'margin', 'growth', 'delay'];
        
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const container = slider.closest('.slider-container');
            
            slider.addEventListener('input', () => {
                this.updateDisplay(sliderId);
                this.calculateWithAnimation();
                this.achievementTracker.trackAction('slider_changed', { slider: sliderId });
            });
            
            slider.addEventListener('focus', () => {
                container.classList.add('active');
            });
            
            slider.addEventListener('blur', () => {
                container.classList.remove('active');
            });
            
            slider.addEventListener('mouseenter', () => {
                container.classList.add('active');
            });
            
            slider.addEventListener('mouseleave', () => {
                container.classList.remove('active');
            });
        });
        
        // Export button listeners
        document.getElementById('board-presentation-btn')?.addEventListener('click', () => {
            this.achievementTracker.trackAction('export_clicked');
            this.generateBoardPresentation();
        });
        
        document.getElementById('roi-analysis-btn')?.addEventListener('click', () => {
            this.achievementTracker.trackAction('export_clicked');
            this.generateROIAnalysis();
        });
        
        document.getElementById('executive-summary-btn')?.addEventListener('click', () => {
            this.achievementTracker.trackAction('export_clicked');
            this.generateExecutiveSummary();
        });
    }
    
    updateDisplay(sliderId) {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(`${sliderId}-display`);
        const value = parseInt(slider.value);
        
        switch(sliderId) {
            case 'revenue':
                display.textContent = this.revenueLabels[value];
                break;
            case 'margin':
                display.textContent = this.marginLabels[value];
                break;
            case 'growth':
                display.textContent = this.growthLabels[value];
                break;
            case 'delay':
                display.textContent = this.delayLabels[value];
                break;
        }
    }
    
    getCurrentValues() {
        return {
            revenue: this.revenueValues[parseInt(document.getElementById('revenue').value)],
            margin: this.marginValues[parseInt(document.getElementById('margin').value)] / 100,
            growth: this.growthValues[parseInt(document.getElementById('growth').value)] / 100,
            delayMonths: this.delayValues[parseInt(document.getElementById('delay').value)]
        };
    }
    
    calculateCostOfDelay() {
        const { revenue, margin, growth, delayMonths } = this.getCurrentValues();
        
        const monthlyProfit = revenue * margin;
        
        const directLoss = monthlyProfit * delayMonths;
        
        let opportunityCost = 0;
        for (let month = 1; month <= delayMonths; month++) {
            const growthFactor = Math.pow(1 + growth, month - 1);
            opportunityCost += monthlyProfit * growthFactor;
        }
        
        opportunityCost -= directLoss;
        
        const totalCost = directLoss + opportunityCost;
        
        return {
            monthlyProfit,
            directLoss,
            opportunityCost,
            totalCost
        };
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
    }
    
    updateCalculation() {
        const results = this.calculateCostOfDelay();
        
        document.getElementById('monthly-profit').textContent = this.formatCurrency(results.monthlyProfit);
        document.getElementById('direct-loss').textContent = this.formatCurrency(results.directLoss);
        document.getElementById('opportunity-cost').textContent = this.formatCurrency(results.opportunityCost);
        document.getElementById('total-cost').textContent = this.formatCurrency(results.totalCost);
        
        this.animateValue('total-cost', results.totalCost);
        
        this.achievementTracker.trackAction('calculation_completed', { results });
        this.achievementTracker.showBusinessInsight(this.getCurrentValues());
        
        this.updateProgressSteps();
    }
    
    calculateWithAnimation() {
        this.highlightActiveInputs();
        
        setTimeout(() => this.revealCalculation('monthly-profit'), 200);
        setTimeout(() => this.revealCalculation('direct-loss'), 400);
        setTimeout(() => this.revealCalculation('opportunity-cost'), 600);
        setTimeout(() => {
            this.revealCalculation('total-cost');
            this.updateCalculation();
        }, 800);
    }
    
    highlightActiveInputs() {
        document.querySelectorAll('.current-value').forEach(el => {
            el.classList.add('animate-pulse');
            setTimeout(() => el.classList.remove('animate-pulse'), 1000);
        });
    }
    
    revealCalculation(elementId) {
        const element = document.getElementById(elementId);
        element.classList.add('animate-highlight');
        setTimeout(() => element.classList.remove('animate-highlight'), 600);
    }
    
    updateProgressSteps() {
        const steps = ['step-inputs', 'step-analysis', 'step-insights', 'step-action'];
        
        steps.forEach((stepId, index) => {
            const step = document.getElementById(stepId);
            step.classList.remove('active', 'completed');
            
            if (index === 0) step.classList.add('completed');
            if (index === 1 && this.achievementTracker.userActions.calculations_completed > 0) step.classList.add('completed');
            if (index === 2 && this.achievementTracker.userActions.insights_viewed > 0) step.classList.add('completed');
            if (index === 3 && this.achievementTracker.scenarios.length >= 3) step.classList.add('completed');
            
            if (index === Math.min(this.achievementTracker.userActions.calculations_completed + 1, 3)) {
                step.classList.add('active');
            }
        });
    }
    
    generateBoardPresentation() {
        const results = this.calculateCostOfDelay();
        const values = this.getCurrentValues();
        
        const content = `
# Executive Board Presentation: Cost of Delay Analysis

## Key Findings
- **Monthly Revenue Impact**: ${this.formatCurrency(values.revenue)}
- **Net Profit Margin**: ${(values.margin * 100).toFixed(1)}%
- **Expected Growth Rate**: ${(values.growth * 100).toFixed(1)}%
- **Delay Period**: ${values.delayMonths} months

## Financial Impact
- **Monthly Profit Loss**: ${this.formatCurrency(results.monthlyProfit)}
- **Direct Revenue Loss**: ${this.formatCurrency(results.directLoss)}
- **Opportunity Cost**: ${this.formatCurrency(results.opportunityCost)}
- **Total Cost of Delay**: ${this.formatCurrency(results.totalCost)}

## Strategic Recommendation
The analysis indicates a significant financial impact from project delays. Consider prioritizing resource allocation to minimize time-to-market.
`;
        
        this.downloadTextFile(content, 'board-presentation.md');
    }
    
    generateROIAnalysis() {
        const results = this.calculateCostOfDelay();
        const values = this.getCurrentValues();
        
        const content = `
# ROI Analysis: Cost of Delay

Generated: ${new Date().toLocaleDateString()}

## Investment Scenario
- Monthly Revenue Potential: ${this.formatCurrency(values.revenue)}
- Profit Margin: ${(values.margin * 100).toFixed(1)}%
- Growth Assumptions: ${(values.growth * 100).toFixed(1)}% monthly

## Cost Analysis
1. Direct Loss: ${this.formatCurrency(results.directLoss)}
2. Opportunity Cost: ${this.formatCurrency(results.opportunityCost)}
3. Total Impact: ${this.formatCurrency(results.totalCost)}

## ROI Calculation
Break-even timeline: ${Math.ceil(results.totalCost / results.monthlyProfit)} months
Recommended action: Accelerate development to minimize delay costs
`;
        
        this.downloadTextFile(content, 'roi-analysis.md');
    }
    
    generateExecutiveSummary() {
        const results = this.calculateCostOfDelay();
        const values = this.getCurrentValues();
        
        const content = `
# Executive Summary: Cost of Delay

**Bottom Line**: Delaying this ${values.delayMonths}-month project costs ${this.formatCurrency(results.totalCost)}

**Key Numbers**:
- Monthly profit impact: ${this.formatCurrency(results.monthlyProfit)}
- Total delay cost: ${this.formatCurrency(results.totalCost)}
- Break-even period: ${Math.ceil(results.totalCost / results.monthlyProfit)} months

**Recommendation**: Prioritize immediate action to minimize financial impact.
`;
        
        this.downloadTextFile(content, 'executive-summary.md');
    }
    
    downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    animateValue(elementId, targetValue) {
        const element = document.getElementById(elementId);
        
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.2s ease-out';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
    
    initializeDisplays() {
        this.updateDisplay('revenue');
        this.updateDisplay('margin');
        this.updateDisplay('growth');
        this.updateDisplay('delay');
    }
}

let calculator;

document.addEventListener('DOMContentLoaded', () => {
    calculator = new CostOfDelayCalculator();
    calculator.initializeDisplays();
    
    console.log('Cost of Delay Calculator with Gamification initialized');
    console.log('Features: Achievement system, Progress tracking, Business insights');
    console.log('Calculation methodology: Conservative approach using linear growth assumptions');
    console.log('Formula: Direct Loss + Opportunity Cost (compound growth)');
});