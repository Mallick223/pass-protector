import CryptoJS from 'crypto-js';

// Secret key for encryption (in production, this should be from environment variables or user's master password)
// For demo purposes, using a hardcoded key
const SECRET_KEY = 'PassProtector2026!SecurityFirst#AES256';

/**
 * Encrypts plaintext using AES-256
 * @param {string} plainText - Text to encrypt
 * @returns {string} Encrypted and encoded text
 */
export const encryptPassword = (plainText) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return plainText;
  }
};

/**
 * Decrypts AES-256 encrypted text
 * @param {string} encryptedText - Encrypted text to decrypt
 * @returns {string} Decrypted plaintext
 */
export const decryptPassword = (encryptedText) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
  }
};

/**
 * Encrypts an object (password entry)
 * @param {object} passwordEntry - Object with website, username, password
 * @returns {object} Object with encrypted password field
 */
export const encryptPasswordEntry = (passwordEntry) => {
  return {
    ...passwordEntry,
    password: encryptPassword(passwordEntry.password),
    timestamp: new Date().toISOString()
  };
};

/**
 * Decrypts an object (password entry)
 * @param {object} encryptedEntry - Object with encrypted password field
 * @returns {object} Object with decrypted password field
 */
export const decryptPasswordEntry = (encryptedEntry) => {
  return {
    ...encryptedEntry,
    password: decryptPassword(encryptedEntry.password)
  };
};

/**
 * Generates a secure random password
 * @param {number} length - Length of password (default: 16)
 * @returns {string} Random secure password
 */
export const generateSecurePassword = (length = 16) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
};

export default {
  encryptPassword,
  decryptPassword,
  encryptPasswordEntry,
  decryptPasswordEntry,
  generateSecurePassword
};
