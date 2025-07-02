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
        
        this.initializeEventListeners();
        this.updateCalculation();
    }
    
    initializeEventListeners() {
        const sliders = ['revenue', 'margin', 'growth', 'delay'];
        
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            slider.addEventListener('input', () => {
                this.updateDisplay(sliderId);
                this.updateCalculation();
            });
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

document.addEventListener('DOMContentLoaded', () => {
    const calculator = new CostOfDelayCalculator();
    calculator.initializeDisplays();
    
    console.log('Cost of Delay Calculator initialized');
    console.log('Calculation methodology: Conservative approach using linear growth assumptions');
    console.log('Formula: Direct Loss + Opportunity Cost (compound growth)');
});