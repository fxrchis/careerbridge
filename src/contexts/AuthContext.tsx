// Import required dependencies and types
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, ROLES, UserDocument } from '../config/firebase';
import { createUser, getUser } from '../utils/firebase';

// Define auth context type
interface AuthContextType {
  // Current authenticated user
  currentUser: User | null;
  // Role of the current user
  userRole: string;
  // Check if user is admin
  isAdmin: boolean;
  // Check if user is employer
  isEmployer: boolean;
  // Check if user is student
  isStudent: boolean;
  // Sign up method
  signup: (email: string, password: string, name: string, phone: string, role: string, company?: string) => Promise<void>;
  // Login method
  login: (email: string, password: string) => Promise<void>;
  // Logout method
  logout: () => Promise<void>;
  // Loading state
  loading: boolean;
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // State for user and role
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Handle user authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Get user role from database
        const userData = await getUser(user.uid);
        setUserRole(userData?.role || '');
      } else {
        setUserRole('');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up method
  async function signup(email: string, password: string, name: string, phone: string, role: string, company?: string) {
    // Create user and set role
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    const userData: Omit<UserDocument, 'uid'> = {
      email,
      name,
      phone,
      role: role as UserDocument['role'],
      createdAt: new Date().toISOString(),
      ...(company ? { company } : {}),
    };

    await createUser(userCredential.user.uid, userData);
    setUserRole(role);
  }

  // Login method
  async function login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userData = await getUser(userCredential.user.uid);
    setUserRole(userData?.role || '');
  }

  // Logout method
  async function logout() {
    await signOut(auth);
    setUserRole('');
  }

  const value = {
    currentUser,
    userRole,
    isAdmin: userRole === ROLES.ADMIN,
    isEmployer: userRole === ROLES.EMPLOYER,
    isStudent: userRole === ROLES.STUDENT,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
