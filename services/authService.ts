
import { User } from '../types';
import { db } from './database';

const CURRENT_USER_KEY = 'kisan_current_user_session';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find user in "Database"
    const user = await db.users.findOne({ email });
    
    // Simple password check (In real app, use hashing)
    if (user && (user as any).password === password) {
      const { password, ...safeUser } = user as any;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
      return safeUser;
    }
    throw new Error('Invalid credentials');
  },

  signup: async (name: string, email: string, password: string, location: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser = { name, email, password, location };
    await db.users.insertOne(newUser);
    
    const { password: p, ...safeUser } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    return safeUser;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  resetPassword: async (email: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = await db.users.findOne({ email });
    if (!user) throw new Error('User not found');
    return true;
  }
};
