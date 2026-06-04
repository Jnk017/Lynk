import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../services/api";
import { API_ENDPOINTS } from "../constants/api";
import { trackFrontendEvent } from "../services/observability";
import { SubscriptionTier } from "../types/api";

interface User {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  isFounder: boolean;
  founderRank?: number;
  isRevenueSharingActive: boolean;
  verificationStatus: string;
  subscriptionPlan?: {
    name: SubscriptionTier;
    displayName: string;
    tierColor: string;
  };
  trustScore: number;
  piBalance: number;
  fiatBalance: number;
  isProfileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPi: (accessToken: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  displayName: string;
  referralCode?: string;
  gender?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const hasTokens = await api.hasTokens();
      if (hasTokens) {
        const userData = await api.get<User>(API_ENDPOINTS.auth.me);
        setUser(userData);
      }
    } catch {
      await api.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>(API_ENDPOINTS.auth.login, { email, password });
    await api.saveTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  };

  const loginWithPi = async (accessToken: string) => {
    const response = await api.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>(API_ENDPOINTS.auth.loginPi, { accessToken });
    await api.saveTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  };

  const register = async (data: RegisterData) => {
    const response = await api.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>(API_ENDPOINTS.auth.register, data);
    await api.saveTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
    void trackFrontendEvent("user_registered", response.user.id, {
      method: data.email ? "email" : "phone",
      hasReferral: Boolean(data.referralCode),
    });
  };

  const logout = async () => {
    await api.clearTokens();
    setUser(null);
  };

  const refreshUser = async () => {
    const userData = await api.get<User>(API_ENDPOINTS.auth.me);
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithPi,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
