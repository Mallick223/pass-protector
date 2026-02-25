import CryptoJS from 'crypto-js';

/**
 * Breach Detection Service
 * Uses Have I Been Pwned API to check if passwords have been compromised
 */

/**
 * Validates if an email is a proper/real email (not demo/example)
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid for breach checking
 */
export const isProperEmail = (email) => {
  if (!email) return false;
  
  // Reject demo/example emails
  const demoPatterns = [
    /^test@/i,
    /@example\./i,
    /@test\./i,
    /@demo\./i,
    /^alex@email\.com$/i,
    /@email\.com$/i,
    /^@/,  // Social media handles
  ];
  
  for (const pattern of demoPatterns) {
    if (pattern.test(email)) return false;
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if a password has been found in known breaches
 * Using k-anonymity: only sending first 5 characters of SHA-1 hash
 * Only works with proper email addresses, not demo emails
 * @param {string} password - Password to check
 * @param {string} email - Email address associated with password
 * @returns {Promise<Object>} - { isBreached: boolean, count: number, breachNames: string[] }
 */
export const checkPasswordBreach = async (password, email = null) => {
  try {
    // Only check breach for proper email addresses
    if (email && !isProperEmail(email)) {
      return { isBreached: false, count: 0, breachNames: [] };
    }
    
    // Hash password using SHA-1
    const sha1Hash = CryptoJS.SHA1(password).toString().toUpperCase();
    
    // Use first 5 characters for k-anonymity
    const hashPrefix = sha1Hash.substring(0, 5);
    const hashSuffix = sha1Hash.substring(5);
    
    // Call Have I Been Pwned API
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${hashPrefix}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      console.error('HIBP API error:', response.status);
      return { isBreached: false, count: 0, breachNames: [] };
    }
    
    const data = await response.text();
    const hashes = data.split('\r\n');
    
    // Check if our hash suffix is in the response
    for (const hash of hashes) {
      const [hashSuf, count] = hash.split(':');
      if (hashSuf === hashSuffix) {
        return { 
          isBreached: true, 
          count: parseInt(count, 10),
          breachNames: ['Password found in public breaches']
        };
      }
    }
    
    return { isBreached: false, count: 0, breachNames: [] };
  } catch (error) {
    console.error('Breach detection error:', error);
    return { isBreached: false, count: 0, breachNames: [] };
  }
};

/**
 * Checks multiple passwords for breaches
 * @param {Array} passwordEntries - Array of password objects with password and email fields
 * @returns {Promise<Array>} - Updated array with breach status
 */
export const checkPasswordsBatch = async (passwordEntries) => {
  try {
    const results = await Promise.all(
      passwordEntries.map(async (entry) => {
        const breachStatus = await checkPasswordBreach(entry.password || 'demo', entry.email || entry.user);
        return {
          ...entry,
          breachStatus: {
            isBreached: breachStatus.isBreached,
            count: breachStatus.count,
            lastChecked: new Date().toISOString()
          }
        };
      })
    );
    return results;
  } catch (error) {
    console.error('Batch breach detection error:', error);
    return passwordEntries;
  }
};

/**
 * Monitors password breaches in real-time
 * Only works with proper email addresses, not demo emails
 * @param {string} password - Password to monitor
 * @param {string} email - Email address associated with password
 * @param {Function} callback - Callback function when breach is detected
 * @returns {Function} - Cleanup function to stop monitoring
 */
export const monitorPasswordBreach = (password, email, callback) => {
  // Skip monitoring for demo emails
  if (!isProperEmail(email)) {
    return () => {};
  }
  
  // Check immediately
  checkPasswordBreach(password, email).then(result => {
    if (result.isBreached) {
      callback({
        type: 'BREACH_DETECTED',
        password: password,
        count: result.count,
        message: `⚠️ This password has been found in ${result.count} breaches. Please change it immediately.`,
        severity: 'high'
      });
    }
  });
  
  // Check every 24 hours
  const intervalId = setInterval(() => {
    checkPasswordBreach(password, email).then(result => {
      if (result.isBreached) {
        callback({
          type: 'BREACH_DETECTED',
          password: password,
          count: result.count,
          message: `⚠️ This password has been found in ${result.count} breaches. Please change it immediately.`,
          severity: 'high'
        });
      }
    });
  }, 24 * 60 * 60 * 1000); // 24 hours
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

/**
 * Gets breach severity level
 * @param {boolean} isBreached - Whether password is breached
 * @param {number} count - Number of breaches
 * @returns {string} - Severity level: 'critical', 'high', 'medium', 'low', 'safe'
 */
export const getBreachSeverity = (isBreached, count) => {
  if (!isBreached) return 'safe';
  if (count > 100) return 'critical';
  if (count > 50) return 'high';
  if (count > 10) return 'medium';
  return 'low';
};

/**
 * Simulates breach detection for demo purposes
 * Returns mock breach data based on password strength
 * Only works with proper email addresses, not demo emails
 * @param {string} password - Password to simulate
 * @param {string} email - Email address associated with password
 * @returns {Object} - Simulated breach status
 */
export const simulateBreachDetection = (password, email = null) => {
  // Skip simulation for demo emails
  if (email && !isProperEmail(email)) {
    return {
      isBreached: false,
      count: 0,
      breachNames: [],
      severity: 'safe'
    };
  }
  
  // Demo: Weak passwords are "breached", strong passwords are safe
  if (!password || password.length < 8) {
    return {
      isBreached: true,
      count: Math.floor(Math.random() * 500) + 50,
      breachNames: ['RockYou 2021', 'Compilation of Various Breaches'],
      severity: 'critical'
    };
  }
  
  if (password.length < 12) {
    return {
      isBreached: Math.random() > 0.7,
      count: Math.floor(Math.random() * 20),
      breachNames: ['Found in 1 breach'],
      severity: 'medium'
    };
  }
  
  // Strong passwords generally safe
  return {
    isBreached: Math.random() > 0.95,
    count: 0,
    breachNames: [],
    severity: 'safe'
  };
};

export default {
  checkPasswordBreach,
  checkPasswordsBatch,
  monitorPasswordBreach,
  getBreachSeverity,
  simulateBreachDetection
};
