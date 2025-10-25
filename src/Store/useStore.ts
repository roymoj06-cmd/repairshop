import { persist } from "zustand/middleware";
import { toast } from "react-toastify";
import { create } from "zustand";

import { token } from "@/service/authentication/authentication.service";
import { getCurrentUserAccesses } from "@/service/userSecurity/userSecurity.service";

interface StoreState {
  // Authentication
  login: (username: string, password: string) => Promise<void>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  hasAccess: (accessGuid: string) => boolean;
  setUser: (user: any) => void;
  isAuthenticated: boolean;
  userAccesses: string[];
  isLoading: boolean;
  isAccessesLoaded: boolean;
  logout: () => void;
  user: any | null;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Authentication
      user: null,
      setUser: (user) => set({ user }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      isAuthenticated: false,
      isLoading: false,
      isAccessesLoaded: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true });
          const userData: any = await token({
            username,
            password,
          });

          if (userData?.isSuccess) {
            set({ isLoading: false });
            set({
              user: userData?.data?.user,
              isAuthenticated: true,
            });

            localStorage.setItem("token", userData.data?.jwt?.access_token);
            const accessData = await getCurrentUserAccesses(
              userData.data?.jwt?.access_token
            );
            set({
              userAccesses: accessData.data || [],
              isAccessesLoaded: true,
            });
          } else {
            set({ isLoading: false });
            toast?.error(userData?.message);
          }
        } catch (error) {
          set({ 
            isLoading: false,
            isAccessesLoaded: false 
          });
          toast?.error("خطا در ورود به سیستم");
        }
      },
      logout: () => {
        // Save theme preference before clearing localStorage
        const savedTheme = localStorage.getItem("theme");

        set({
          user: null,
          isAuthenticated: false,
          userAccesses: [],
          isAccessesLoaded: false,
        });
        localStorage.removeItem("token");
        localStorage.removeItem("auth-storage");

        // Restore theme preference after clearing localStorage
        if (savedTheme) {
          localStorage.setItem("theme", savedTheme);
        }

        window.location.replace("/#/login");
      },
      userAccesses: [],
      clearAuth: () => {
        set({
          userAccesses: [],
          isAccessesLoaded: false,
        });
      },
      hasAccess: (accessGuid: string) => {
        const { userAccesses } = get();
        return userAccesses.includes(accessGuid);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userAccesses: state.userAccesses,
        isAccessesLoaded: state.isAccessesLoaded,
      }),
    }
  )
);
