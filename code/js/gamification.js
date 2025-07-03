// Gamification System - Achievement tracking and rewards

class AchievementSystem {
    constructor() {
        this.achievements = {
            'first_calculation': {
                id: 'first_calculation',
                title: 'Strategic Thinker',
                description: 'Completed your first cost analysis',
                icon: '🎯',
                color: 'var(--blue-primary)',
                unlocked: false,
                requirement: 'calculations_completed_1'
            },
            'scenario_explorer': {
                id: 'scenario_explorer', 
                title: 'Scenario Explorer',
                description: 'Tested different revenue scenarios',
                icon: '🔍',
                color: 'var(--blue-light)',
                unlocked: false,
                requirement: 'revenue_changes_3'
            },
            'high_stakes_analyst': {
                id: 'high_stakes_analyst',
                title: 'High Stakes Analyst', 
                description: 'Analyzed enterprise-scale scenarios (€5M+)',
                icon: '💼',
                color: 'var(--green-primary)',
                unlocked: false,
                requirement: 'revenue_above_5m'
            },
            'time_master': {
                id: 'time_master',
                title: 'Time Value Master',
                description: 'Explored impact of extended delays',
                icon: '⏰',
                color: 'var(--blue-dark)',
                unlocked: false,
                requirement: 'delay_above_12m'
            },
            'cost_awareness_expert': {
                id: 'cost_awareness_expert',
                title: 'Cost Awareness Expert',
                description: 'Discovered costs exceeding €1M',
                icon: '💰',
                color: 'var(--orange-warning)',
                unlocked: false,
                requirement: 'total_cost_above_1m'
            },
            'optimization_guru': {
                id: 'optimization_guru',
                title: 'Optimization Guru',
                description: 'Explored multiple parameter combinations',
                icon: '⚡',
                color: 'var(--green-primary)',
                unlocked: false,
                requirement: 'total_changes_15'
            },
            'margin_master': {
                id: 'margin_master',
                title: 'Margin Master',
                description: 'Analyzed high-margin scenarios (20%+)',
                icon: '📈',
                color: 'var(--blue-primary)',
                unlocked: false,
                requirement: 'margin_above_20'
            },
            'growth_visionary': {
                id: 'growth_visionary',
                title: 'Growth Visionary',
                description: 'Explored aggressive growth scenarios (25%+)',
                icon: '🚀',
                color: 'var(--blue-light)',
                unlocked: false,
                requirement: 'growth_above_25'
            }
        };
        
        this.userStats = {
            calculations_completed: 0,
            revenue_changes: 0,
            margin_changes: 0,
            growth_changes: 0,
            delay_changes: 0,
            max_revenue_tested: 0,
            max_cost_discovered: 0,
            max_delay_tested: 0,
            max_margin_tested: 0,
            max_growth_tested: 0,
            session_start: Date.now(),
            total_interactions: 0
        };
        
        this.loadProgress();
        this.initializeAchievementDisplay();
    }
    
    trackAction(action, value = 0) {
        // Increment counter
        if (this.userStats[action] !== undefined) {
            this.userStats[action]++;
        }
        
        // Update max values
        if (action.includes('max_') && value > this.userStats[action]) {
            this.userStats[action] = value;
        }
        
        // Update total interactions
        this.userStats.total_interactions++;
        
        // Check achievements
        this.checkAchievements();
        
        // Save progress
        this.saveProgress();
    }
    
    checkAchievements() {
        Object.values(this.achievements).forEach(achievement => {
            if (!achievement.unlocked && this.meetsRequirement(achievement)) {
                this.unlockAchievement(achievement);
            }
        });
    }
    
    meetsRequirement(achievement) {
        const requirement = achievement.requirement;
        
        switch (requirement) {
            case 'calculations_completed_1':
                return this.userStats.calculations_completed >= 1;
            
            case 'revenue_changes_3':
                return this.userStats.revenue_changes >= 3;
            
            case 'revenue_above_5m':
                return this.userStats.max_revenue_tested >= 5000000;
            
            case 'delay_above_12m':
                return this.userStats.max_delay_tested >= 12;
            
            case 'total_cost_above_1m':
                return this.userStats.max_cost_discovered >= 1000000;
            
            case 'total_changes_15':
                return (this.userStats.revenue_changes + 
                       this.userStats.margin_changes + 
                       this.userStats.growth_changes + 
                       this.userStats.delay_changes) >= 15;
            
            case 'margin_above_20':
                return this.userStats.max_margin_tested >= 20;
            
            case 'growth_above_25':
                return this.userStats.max_growth_tested >= 25;
            
            default:
                return false;
        }
    }
    
    unlockAchievement(achievement) {
        achievement.unlocked = true;
        this.showAchievementNotification(achievement);
        this.updateAchievementDisplay();
        this.saveProgress();
        
        // Track achievement unlock
        console.log(`Achievement unlocked: ${achievement.title}`);
    }
    
    showAchievementNotification(achievement) {
        const notification = this.createNotificationElement(achievement);
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
        
        // Add sound effect (optional)
        this.playAchievementSound();
    }
    
    createNotificationElement(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `;
        
        // Add click to dismiss
        notification.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        });
        
        return notification;
    }
    
    initializeAchievementDisplay() {
        const grid = document.getElementById('achievement-grid');
        if (!grid) return;
        
        // Clear existing content
        grid.innerHTML = '';
        
        // Add achievement items
        Object.values(this.achievements).forEach(achievement => {
            const item = this.createAchievementItem(achievement);
            grid.appendChild(item);
        });
        
        // Update count
        this.updateAchievementCount();
    }
    
    createAchievementItem(achievement) {
        const item = document.createElement('div');
        item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
        item.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-description">${achievement.description}</div>
        `;
        
        // Add color styling for unlocked achievements
        if (achievement.unlocked) {
            item.style.borderColor = achievement.color;
        }
        
        return item;
    }
    
    updateAchievementDisplay() {
        const grid = document.getElementById('achievement-grid');
        if (!grid) return;
        
        const items = grid.querySelectorAll('.achievement-item');
        const achievements = Object.values(this.achievements);
        
        items.forEach((item, index) => {
            const achievement = achievements[index];
            if (achievement && achievement.unlocked) {
                item.classList.add('unlocked');
                item.style.borderColor = achievement.color;
            }
        });
        
        this.updateAchievementCount();
    }
    
    updateAchievementCount() {
        const countElement = document.getElementById('achievement-count');
        if (!countElement) return;
        
        const unlockedCount = Object.values(this.achievements).filter(a => a.unlocked).length;
        const totalCount = Object.values(this.achievements).length;
        
        countElement.textContent = `${unlockedCount}/${totalCount}`;
    }
    
    playAchievementSound() {
        // Optional: Add sound effect for achievement unlocks
        // This would require audio files in the assets/sounds directory
        try {
            const audio = new Audio('assets/sounds/achievement.mp3');
            audio.volume = 0.3;
            audio.play().catch(e => {
                // Silently fail if audio can't play
                console.log('Audio playback failed:', e.message);
            });
        } catch (e) {
            // Silently fail if audio file doesn't exist
        }
    }
    
    saveProgress() {
        try {
            const data = {
                achievements: this.achievements,
                userStats: this.userStats,
                lastUpdated: Date.now()
            };
            localStorage.setItem('cod_achievements', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save achievement progress:', e);
        }
    }
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('cod_achievements');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Merge saved achievements with current structure
                Object.keys(data.achievements).forEach(id => {
                    if (this.achievements[id]) {
                        this.achievements[id].unlocked = data.achievements[id].unlocked;
                    }
                });
                
                // Merge saved stats
                Object.keys(data.userStats).forEach(stat => {
                    if (this.userStats[stat] !== undefined) {
                        this.userStats[stat] = data.userStats[stat];
                    }
                });
                
                console.log('Achievement progress loaded');
            }
        } catch (e) {
            console.warn('Failed to load achievement progress:', e);
        }
    }
    
    resetProgress() {
        // Reset all achievements
        Object.values(this.achievements).forEach(achievement => {
            achievement.unlocked = false;
        });
        
        // Reset stats
        Object.keys(this.userStats).forEach(stat => {
            if (stat === 'session_start') {
                this.userStats[stat] = Date.now();
            } else {
                this.userStats[stat] = 0;
            }
        });
        
        // Clear localStorage
        localStorage.removeItem('cod_achievements');
        
        // Update display
        this.initializeAchievementDisplay();
        
        console.log('Achievement progress reset');
    }
    
    getProgress() {
        const unlockedCount = Object.values(this.achievements).filter(a => a.unlocked).length;
        const totalCount = Object.values(this.achievements).length;
        const progressPercentage = (unlockedCount / totalCount) * 100;
        
        return {
            unlocked: unlockedCount,
            total: totalCount,
            percentage: progressPercentage,
            userStats: { ...this.userStats },
            sessionDuration: Date.now() - this.userStats.session_start
        };
    }
    
    getUnlockedAchievements() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    }
    
    getNextAchievements() {
        return Object.values(this.achievements)
            .filter(a => !a.unlocked)
            .map(a => ({
                title: a.title,
                description: a.description,
                icon: a.icon,
                requirement: a.requirement,
                progress: this.getRequirementProgress(a.requirement)
            }));
    }
    
    getRequirementProgress(requirement) {
        switch (requirement) {
            case 'calculations_completed_1':
                return Math.min(this.userStats.calculations_completed / 1, 1);
            
            case 'revenue_changes_3':
                return Math.min(this.userStats.revenue_changes / 3, 1);
            
            case 'revenue_above_5m':
                return Math.min(this.userStats.max_revenue_tested / 5000000, 1);
            
            case 'delay_above_12m':
                return Math.min(this.userStats.max_delay_tested / 12, 1);
            
            case 'total_cost_above_1m':
                return Math.min(this.userStats.max_cost_discovered / 1000000, 1);
            
            case 'total_changes_15':
                const totalChanges = this.userStats.revenue_changes + 
                                   this.userStats.margin_changes + 
                                   this.userStats.growth_changes + 
                                   this.userStats.delay_changes;
                return Math.min(totalChanges / 15, 1);
            
            case 'margin_above_20':
                return Math.min(this.userStats.max_margin_tested / 20, 1);
            
            case 'growth_above_25':
                return Math.min(this.userStats.max_growth_tested / 25, 1);
            
            default:
                return 0;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementSystem;
}