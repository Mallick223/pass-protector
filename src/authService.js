// Firebase Authentication Service
//import {
  //createUserWithEmailAndPassword,
  //signInWithEmailAndPassword,
  //signOut,
  //onAuthStateChanged,
  //updateProfile
//} from 'firebase/auth';
//import { auth, db } from './firebase.config';
//import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User's full name
 * @returns {Promise<Object>} User object with UID
 */
//export const registerUser = async (email, password, name) => {
  //try {
    // Create user account
    //const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //const user = userCredential.user;

    // Update profile with display name
    //await updateProfile(user, {
      //displayName: name
    //});

    // Store user data in Firestore
    //await setDoc(doc(db, 'users', user.uid), {
      //uid: user.uid,
      //email: email,
      //name: name,
      //createdAt: new Date().toISOString(),
      //updatedAt: new Date().toISOString(),
      //passwordStrengthCheckHistory: [] // For tracking analyzer usage
    //});

    //return {
      //uid: user.uid,
      //email: user.email,
      //name: user.displayName
    //};
  //} catch (error) {
    //throw new Error(error.message);
  //}
//};

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object with UID
 */
//export const loginUser = async (email, password) => {
 // try {
   // const userCredential = await signInWithEmailAndPassword(auth, email, password);
    //const user = userCredential.user;

    // Get user data from Firestore
    //const userDoc = await getDoc(doc(db, 'users', user.uid));

    //return {
      //uid: user.uid,
      //email: user.email,
      //name: user.displayName || userDoc.data()?.name || 'User'
    //};
  //} catch (error) {
    //throw new Error(error.message);
 // }
//};

/**
 * Logout current user
 * @returns {Promise<void>}
 */
//export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
//};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
//export const onAuthChange = (callback) => {
  //return onAuthStateChanged(auth, async (user) => {
    //if (user) {
      // Get user data from Firestore
      //const userDoc = await getDoc(doc(db, 'users', user.uid));
      //const userData = userDoc.data();
      
      //callback({
        //uid: user.uid,
        //email: user.email,
        //name: user.displayName || userData?.name || 'User',
        //isLoggedIn: true
      //});
    //} else {
     // callback({
      //  uid: null,
        //email: null,
        //name: null,
        //isLoggedIn: false
      //});
    //}
 // });
//};

/**
 * Save password strength analysis to user history
 *@param {string} userId - User UID
 * @param {Object} analysis - Password analysis data
 * @returns {Promise<void>}
 */
//export const savePasswordAnalysis = async (userId, analysis) => {
  //try {
    //const userDoc = await getDoc(doc(db, 'users', userId));
    //const userData = userDoc.data();
    
    //const history = userData?.passwordStrengthCheckHistory || [];
    //history.push({
      //timestamp: new Date().toISOString(),
      //category: analysis.category,
      //entropy: analysis.entropy,
      //length: analysis.length,
      //strength: analysis.emoji
    //});

    // Keep only last 50 entries
   // if (history.length > 50) {
      //history.shift();
    //}

    //await setDoc(doc(db, 'users', userId), {
     // ...userData,
     // passwordStrengthCheckHistory: history,
      //updatedAt: new Date().toISOString()
    //}, { merge: true });
  //} catch (error) {
  //  console.error('Error saving analysis:', error);
  //}
//};