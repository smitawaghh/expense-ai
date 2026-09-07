import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from './firebase-config';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  emailVerified: boolean;
  refreshVerification: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setEmailVerified(currentUser?.emailVerified ?? false);

      if (currentUser) {
        const freshToken = await currentUser.getIdToken(true); // 🔁 Force refresh
        setToken(freshToken);
      } else {
        setToken(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Firebase doesn't push emailVerified updates automatically — call after the
  // user follows the verification link and returns to the app.
  const refreshVerification = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const verified = auth.currentUser.emailVerified;
    setEmailVerified(verified);
    return verified;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    setEmailVerified(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, emailVerified, refreshVerification, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
