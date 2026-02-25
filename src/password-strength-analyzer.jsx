// src/components/PasswordStrengthAnalyzer.jsx
import { useState, useEffect } from 'react';
import './password-strength-analyzer.css';

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
  const [showPassword, setShowPassword] = useState(false); // Toggle to show/hide password
  const [inputEnabled, setInputEnabled] = useState(false); // Toggle to enable/disable input
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
      <button className="btn-toggle" onClick={handleToggle}>
        {inputEnabled ? '🔄 Reset Analyzer' : '▶️ Start Analyzing'}
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
          <button className="btn-show-hide" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? '👁️ Hide' : '👀 Show'}
          </button>
        )}
      </div>

      {/* Typed Password Display */}
      <div className="password-display">
        {password || 'Your password will appear here'}
      </div>

      {/* Strength Bar */}
      <div className="strength-bar">
        <div
          className="strength-fill"
          style={{
            width: `${analysis.frac}%`,
            background: `linear-gradient(90deg, ${analysis.color}, var(--lime))`,
          }}
        >
          <span className="strength-percent">{Math.round(analysis.frac)}%</span>
        </div>
        <span className="strength-emoji" style={{ left: `calc(${Math.min(Math.max(analysis.frac, 5), 95)}%)` }}>
          {analysis.emoji}
        </span>
      </div>

      {/* Analysis Cards */}
      <div className="analysis-cards">
        <div className="analysis-card card-category">
          <h3>💪 Strength Category</h3>
          <p className="category-name">{analysis.category} {analysis.emoji}</p>
          <p className="entropy-info">Entropy: <strong>{analysis.entropy.toFixed(2)} bits</strong></p>
          <p className="length-info">Length: <strong>{analysis.length}</strong></p>
        </div>

        <div className="analysis-card card-basic">
          <h3>📊 Basic Info</h3>
          <p>Classes: <strong>{analysis.classes.join(', ') || 'none'}</strong></p>
          <p>Charset Size: <strong>{analysis.charset}</strong></p>
          <p>Guesses Needed: <strong>{humanNumber(analysis.guesses)}</strong></p>
        </div>

        <div className="analysis-card card-crack">
          <h3>⏱️ Crack Times</h3>
          {analysis.crackTimes.map((time, i) => (
            <p key={i}>
              <small>{ATTACK_SPEEDS[i].label}:</small> <strong>{time}</strong>
            </p>
          ))}
        </div>

        <div className="analysis-card card-suggest">
          <h3>💡 Suggestions</h3>
          <ul>
            {analysis.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
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