import { create } from "zustand";
import type { User, UserCredits } from "@/types";
import { api } from "@/lib/api";
import { removeToken, setToken, getToken } from "@/lib/auth";

interface AuthState {
  user: User | null;
  credits: UserCredits | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  fetchCredits: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateCredits: (credits: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  credits: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    set({ user: res.user, isAuthenticated: true });
  },

  logout: () => {
    removeToken();
    set({ user: null, credits: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    const token = getToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const user = await api.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      removeToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  fetchCredits: async () => {
    try {
      const credits = await api.getCredits();
      set({ credits });
    } catch {
      // ignore
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  updateCredits: (credits) => {
    const current = get().credits;
    if (current) {
      set({ credits: { ...current, credits } });
    }
  },
}));
