import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  fbSignOut, 
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from '../firebase/config';

const AuthContext = createContext(null);

const STORAGE_KEY = 'syncora_user_session';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser({
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || user.phoneNumber || 'Member',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            avatar: user.photoURL || '',
            isAnonymous: false
          });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local Auth Storage Fallback
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setLoading(false);
    }
  }, []);

  const saveLocalUser = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  // Setup reCAPTCHA for Phone Sign-In
  const setupRecaptcha = (containerId) => {
    if (isFirebaseConfigured && auth) {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          // ignore clear error
        }
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          console.warn('[reCAPTCHA] expired, reset needed');
        }
      });
      return window.recaptchaVerifier;
    }
    return null;
  };

  // Phone Sign In / Send OTP
  const sendPhoneOtp = async (phoneNumber, appVerifier) => {
    if (isFirebaseConfigured && auth) {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      return confirmationResult;
    } else {
      // Local demo mode fallback
      return {
        confirm: async (otp) => {
          if (otp && (otp === '123456' || otp.length === 6)) {
            const user = {
              id: 'phone_' + Date.now().toString(36),
              name: `User (${phoneNumber.slice(-4)})`,
              email: '',
              phoneNumber,
              avatar: '',
              isAnonymous: false
            };
            saveLocalUser(user);
            return { user };
          }
          throw new Error('Invalid OTP code. In demo mode, use 123456.');
        }
      };
    }
  };

  // Email Sign In
  const loginWithEmail = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res.user;
    } else {
      // Mock Local Auth Login
      const name = email.split('@')[0];
      const user = {
        id: 'usr_' + btoa(email).replace(/=/g, '').slice(0, 10),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        avatar: '',
        isAnonymous: false
      };
      saveLocalUser(user);
      return user;
    }
  };

  // Email Sign Up
  const signupWithEmail = async (email, password, displayName) => {
    if (isFirebaseConfigured && auth) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && res.user) {
        await updateProfile(res.user, { displayName });
      }
      return res.user;
    } else {
      const user = {
        id: 'usr_' + Date.now().toString(36),
        name: displayName || email.split('@')[0],
        email,
        avatar: '',
        isAnonymous: false
      };
      saveLocalUser(user);
      return user;
    }
  };

  // Google Sign In
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } else {
      const googleUser = {
        id: 'google_usr_' + Math.random().toString(36).substr(2, 9),
        name: 'Alex Vance',
        email: 'alex.vance@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        isAnonymous: false
      };
      saveLocalUser(googleUser);
      return googleUser;
    }
  };

  // Guest / Anonymous Quick Login
  const loginAsGuest = (displayName) => {
    // Check if a valid session already exists
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          if (displayName && displayName.trim() && parsed.name !== displayName.trim()) {
            parsed.name = displayName.trim();
            saveLocalUser(parsed);
          } else {
            setCurrentUser(parsed);
          }
          return parsed;
        }
      } catch {
        // Continue to create new
      }
    }

    const guestUser = {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      name: displayName?.trim() || `Guest_${Math.floor(1000 + Math.random() * 9000)}`,
      email: null,
      avatar: '',
      isAnonymous: true
    };
    saveLocalUser(guestUser);
    return guestUser;
  };

  // Profile update
  const updateUserProfile = async (updates) => {
    if (isFirebaseConfigured && auth && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updates.name,
        photoURL: updates.avatar
      });
    }
    const updated = {
      ...currentUser,
      ...updates
    };
    saveLocalUser(updated);
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    isConfigured: isFirebaseConfigured,
    setupRecaptcha,
    sendPhoneOtp,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    loginAsGuest,
    updateUserProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
