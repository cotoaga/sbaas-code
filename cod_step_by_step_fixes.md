/* STEP-BY-STEP CSS FIXES - Add to bottom of code/css/main.css */

/* STEP 1: Fix red color for values like €1.4M */
.result-value {
  color: var(--red-loss) !important; /* #dc2626 - Red from style guide */
}

/* STEP 2: Add red border to "Total Cost of Delay" small box */
.result-card.primary {
  border: 2px solid var(--red-loss) !important; /* Same red as outer box */
}

/* STEP 3: Fix "Understanding Cost of Delay" layout issue */
.educational-content {
  display: block !important; /* Remove any grid/flex that's causing float */
}

.educational-content h3 {
  margin-bottom: var(--space-lg) !important;
  clear: both !important; /* Ensure nothing floats next to it */
}

.educational-content p {
  width: 100% !important;
  float: none !important;
  clear: both !important;
  margin-bottom: var(--space-lg) !important;
}

/* STEP 4: Fix grey text readability in Calculation Method */
.formula-explanation li {
  color: var(--grey-dark) !important; /* #333333 - Dark grey for readability */
  background: rgba(47, 110, 186, 0.1) !important; /* Lighter blue background */
}

.formula-explanation strong {
  color: var(--blue-primary) !important; /* #2F6EBA - Keep blue for emphasis */
}

/* Alternative if above doesn't work - make text black */
.formula-explanation li {
  color: #000000 !important; /* Pure black for maximum contrast */
}

/* STEP 5: Debug achievement triggering for Margin Master and Growth Visionary */
/* Add this to code/js/calculator.js or code/js/gamification.js */

/*
// In your slider event handlers, add these specific tracking calls:

// For margin slider:
if (marginValue >= 20) {
    this.achievementSystem.trackAction('max_margin_tested', marginValue);
}

// For growth slider:
if (growthValue >= 25) {
    this.achievementSystem.trackAction('max_growth_tested', growthValue);
}
*/