import { useState, useEffect, useCallback } from 'react';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  limit,
  serverTimestamp,
  type User
} from '@/lib/firebase';

// Hash password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Session storage key
const SESSION_KEY = 'lambda_user_session';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session on mount
  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const parsedUser = JSON.parse(session);
        setUser(parsedUser);
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    try {
      const hashedPassword = await hashPassword(password);
      const q = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase()),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setError('Aucun compte trouvé avec cet email');
        setLoading(false);
        return false;
      }
      
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data() as User;
      
      if (userData.password !== hashedPassword) {
        setError('Mot de passe incorrect');
        setLoading(false);
        return false;
      }
      
      // Remove password from session data
      const { password: _, ...sessionUser } = userData;
      const userWithId = { ...sessionUser, uid: userDoc.id };
      
      // Save to session storage
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userWithId));
      setUser(userWithId);
      setLoading(false);
      return true;
      
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
      setLoading(false);
      return false;
    }
  }, []);

  // Register function
  const register = useCallback(async (userData: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    contact?: string;
    departement?: string;
    poste?: string;
    photoURL?: string;
  }): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    try {
      // Check if email already exists
      const q = query(
        collection(db, 'users'),
        where('email', '==', userData.email.toLowerCase()),
        limit(1)
      );
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        setError('Un compte avec cet email existe déjà');
        setLoading(false);
        return false;
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Generate unique ID
      const uid = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      
      // Create user document
      const newUser: User = {
        uid,
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email.toLowerCase(),
        contact: userData.contact || '',
        departement: userData.departement || '',
        poste: userData.poste || '',
        photoURL: userData.photoURL || '',
        password: hashedPassword,
        role: 'employee',
        isOnline: true,
        lastSeen: { seconds: Date.now() / 1000, nanoseconds: 0 }
      };
      
      await setDoc(doc(db, 'users', uid), {
        ...newUser,
        createdAt: serverTimestamp()
      });
      
      // Save to session (without password)
      const { password: _, ...sessionUser } = newUser;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
      setLoading(false);
      return true;
      
    } catch (err) {
      setError('Erreur lors de la création du compte');
      setLoading(false);
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    if (user?.uid) {
      // Update online status
      try {
        await setDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Error updating online status:', err);
      }
    }
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, [user]);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!user?.uid) return false;
    
    try {
      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      const updatedUser = { ...user, ...updates };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
      return false;
    }
  }, [user]);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    isManager,
    isAuthenticated: !!user
  };
}
