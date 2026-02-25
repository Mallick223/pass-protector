
// ============================================================================
// React Component
// ============================================================================

import { useState, useEffect } from 'react';

// ============================================================================
// Constants (same as original, with minor tweaks for adaptability)
// ============================================================================

// Character set sizes
const LOWER = 26;      // Lowercase letters (a-z)
const UPPER = 26;      // Uppercase letters (A-Z)
const DIGITS = 10;     // Digits (0-9)
const SYMBOLS = 32;    // Common symbols (!@#$%^&*()_+-=[]{}|;:'",.<>?/)

// Attack speeds in guesses per second (made adaptable with labels for UI)
const ATTACK_SPEEDS = [
  { speed: 1e3, label: 'Slow online (1k guesses/s)' },
  { speed: 1e4, label: 'Typical online (10k guesses/s)' },
  { speed: 1e8, label: 'Single GPU (100M guesses/s)' },
  { speed: 1e10, label: 'Cluster/offline (10B guesses/s)' },
  { speed: 1e12, label: 'Very large cluster (1T guesses/s)' }
];

// ============================================================================
// Main React Component
// ============================================================================

export default function PasswordStrengthAnalyzer() {
  // State management
  const [password, setPassword] = useState('');      // Password input
  const [showPassword, setShowPassword] = useState(false); // Added: Toggle to show/hide password
  const [inputEnabled, setInputEnabled] = useState(false); // Toggle to enable/disable input (as in original)
  const [analysis, setAnalysis] = useState({         // All analysis results
    category: 'Unknown',
    emoji: '⚪',
    entropy: 0,
    length: 0,
    classes: [],
    charset: 0,
    guesses: 0,
    crackTimes: Array(5).fill('—'),
    suggestions: ['Enter a password to analyze'],
    color: '#bbc3d6',
    frac: 0
  });

  // Run analysis on password change
  useEffect(() => {
    if (inputEnabled && password) {
      const result = analyze(password);
      setAnalysis(result);
    } else {
      // Reset when disabled or empty
      setAnalysis({
        category: 'Unknown',
        emoji: '⚪',
        entropy: 0,
        length: 0,
        classes: [],
        charset: 0,
        guesses: 0,
        crackTimes: Array(5).fill('—'),
        suggestions: ['Enter a password to analyze'],
        color: '#bbc3d6',
        frac: 0
      });
    }
  }, [password, inputEnabled]);

  // Toggle input enable/reload (adapted from original)
  const handleToggle = () => {
    if (!inputEnabled) {
      setInputEnabled(true);
    } else {
      // Simulate reload: reset states
      setPassword('');
      setInputEnabled(false);
      setShowPassword(false);
    }
  };

  return (
    <div className="password-analyzer-container">
      {/* Toggle Button */}
      <button id="btnToggle" onClick={handleToggle}>
        {inputEnabled ? 'Reset Analyzer' : 'Start Analyzing'}
      </button>

      {/* Password Input Section */}
      <div className="input-section">
        <input
          id="pw"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!inputEnabled}
          placeholder="Type your password here..."
          autoFocus
        />
        {inputEnabled && (
          <button onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {/* Typed Password Display */}
      <div id="typedPw" className="password-display">
        {password || 'Your password will appear here'}
      </div>

      {/* Strength Bar */}
      <div className="strength-bar">
        <div
          id="strengthFill"
          style={{
            width: `${analysis.frac}%`,
            background: `linear-gradient(90deg, ${analysis.color}, ${shadeColor(analysis.color, -10)})`,
          }}
        >
          <span id="strengthPercent">{Math.round(analysis.frac)}%</span>
        </div>
        <span id="strengthEmoji" style={{ left: `calc(${Math.min(Math.max(analysis.frac, 5), 95)}%)` }}>
          {analysis.emoji}
        </span>
      </div>

      {/* Analysis Cards */}
      <div id="cardCategory" className="analysis-card" style={{ background: shadeColor(analysis.color, 20) }}>
        <h3>Strength Category</h3>
        <p id="cat">{analysis.category} {analysis.emoji}</p>
        <p id="ent">Entropy: {analysis.entropy.toFixed(2)} bits</p>
        <p id="len">Length: {analysis.length}</p>
      </div>

      <div id="cardBasic" className="analysis-card" style={{ background: shadeColor(analysis.color, 10) }}>
        <h3>Basic Info</h3>
        <p id="classes">Classes: {analysis.classes.join(', ') || 'none'}</p>
        <p id="charset">Charset Size: {analysis.charset}</p>
        <p id="guesses">Guesses Needed: {humanNumber(analysis.guesses)}</p>
      </div>

      <div id="cardCrack" className="analysis-card" style={{ background: shadeColor(analysis.color, 0) }}>
        <h3>Crack Times</h3>
        {analysis.crackTimes.map((time, i) => (
          <p key={i} id={`ct${i+1}`}>
            {ATTACK_SPEEDS[i].label}: {time}
          </p>
        ))}
      </div>

      <div id="cardSuggest" className="analysis-card" style={{ background: shadeColor(analysis.color, -10) }}>
        <h3>Suggestions</h3>
        <ul id="suggestions">
          {analysis.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      {/* Optional: Add custom CSS in a separate file or inline */}
      <style>{`
        /* Basic styles - adapt to your app's theme */
        .password-analyzer-container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
        .input-section { display: flex; margin-bottom: 20px; }
        .input-section input { flex: 1; padding: 10px; font-size: 16px; }
        .input-section button { margin-left: 10px; padding: 10px; }
        .password-display { font-size: 18px; text-align: center; margin-bottom: 20px; color: #666; }
        .strength-bar { position: relative; height: 30px; background: #eee; border-radius: 15px; overflow: hidden; margin-bottom: 20px; }
        #strengthEmoji { position: absolute; top: 50%; transform: translate(-50%, -50%); font-size: 24px; }
        .analysis-card { padding: 15px; border-radius: 8px; margin-bottom: 20px; color: white; }
        .analysis-card h3 { margin-bottom: 10px; }
        ul { list-style-type: disc; padding-left: 20px; }
        /* Add media queries for mobile adaptability */
        @media (max-width: 600px) {
          .password-analyzer-container { padding: 10px; }
          .input-section { flex-direction: column; }
          .input-section button { margin-left: 0; margin-top: 10px; }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Analysis Function (adapted to return object instead of updating DOM)
// ============================================================================

/**
 * Analyze password strength using entropy and character set analysis
 * Returns object with all metrics for React state
 * 
 * @param {string} pw - The password to analyze
 * @returns {object} Analysis results
 */
function analyze(pw) {
  // Character Class Detection
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);

  // Charset Calculation
  let charset = 0;
  if (hasLower) charset += LOWER;
  if (hasUpper) charset += UPPER;
  if (hasDigit) charset += DIGITS;
  if (hasSymbol) charset += SYMBOLS;
  charset = charset || 1;

  // Entropy & Length
  const length = pw.length;
  const entropy = length * Math.log2(charset);

  // Guesses Needed
  const guesses = Math.pow(charset, length) / 2;

  // Strength Categorization (added more nuanced thresholds for adaptability)
  let category = 'Unknown', color = '#bbc3d6', emoji = '⚪';
  if (entropy < 28) {
    category = 'Very Weak'; color = '#e74c3c'; emoji = '🔴';
  } else if (entropy < 36) {
    category = 'Weak'; color = '#f39c12'; emoji = '🟠';
  } else if (entropy < 60) {
    category = 'Reasonable'; color = '#f1c40f'; emoji = '🟡';
  } else if (entropy < 128) {
    category = 'Strong'; color = '#2ecc71'; emoji = '🟢';
  } else {
    category = 'Very Strong'; color = '#18a689'; emoji = '💪';
  }

  // Strength Fraction (for bar: cap at 128 bits = 100%)
  const frac = Math.min(entropy / 128, 1) * 100;

  // Crack Times
  const crackTimes = ATTACK_SPEEDS.map(({ speed }) => formatTime(guesses / speed));

  // Suggestions (improved with more adaptive tips)
  const suggestions = [];
  if (length < 12) suggestions.push('Increase length — aim for 12+ characters for better security.');
  if (!hasLower) suggestions.push('Include lowercase letters (a-z).');
  if (!hasUpper) suggestions.push('Include uppercase letters (A-Z).');
  if (!hasDigit) suggestions.push('Include digits (0-9).');
  if (!hasSymbol) suggestions.push('Include symbols (!@#$%^&*).');
  if (pw.length > 0 && pw.toLowerCase() === pw) suggestions.push('Mix case: Avoid all-lowercase for better entropy.');
  suggestions.push("Try a passphrase: Combine unrelated words like 'coffee-wagon-silver'.");
  suggestions.push('Avoid common patterns: No dictionary words or simple substitutions (e.g., p@ssw0rd).');
  suggestions.push('Use a password manager: Generate and store unique, long passwords per site.');

  return {
    category,
    emoji,
    entropy,
    length,
    classes: [
      hasLower && 'lowercase',
      hasUpper && 'uppercase',
      hasDigit && 'digits',
      hasSymbol && 'symbols'
    ].filter(Boolean),
    charset,
    guesses,
    crackTimes,
    suggestions,
    color,
    frac
  };
}

// ============================================================================
// Utility Functions (same as original)
// ============================================================================

function humanNumber(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return Math.round(n).toString();
  const units = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
  let i = 0;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  return n.toFixed(2) + units[i];
}

function formatTime(sec) {
  if (!isFinite(sec) || sec > 1e30) return '∞';
  if (sec < 1) return (sec * 1000).toFixed(1) + ' ms';
  const minute = 60, hour = 3600, day = 86400, year = 31557600;
  if (sec < minute) return sec.toFixed(1) + ' s';
  if (sec < hour) return (sec / minute).toFixed(1) + ' min';
  if (sec < day) return (sec / hour).toFixed(1) + ' h';
  if (sec < year) return (sec / day).toFixed(1) + ' d';
  if (sec < 1000 * year) return (sec / year).toFixed(1) + ' y';
  return (sec / year).toExponential(2) + ' y';
}

function shadeColor(hex, percent) {
  const c = hex.replace('#', '');
  const num = parseInt(c, 16);
  let r = (num >> 16) + Math.round(255 * percent / 100);
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100);
  let b = (num & 0x0000FF) + Math.round(255 * percent / 100);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}