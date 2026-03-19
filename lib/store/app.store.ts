import { create } from "zustand";
import { User, Account } from "@/types";

interface AppStore {
  user: User | null;
  account: Account | null;
  isDemoMode: boolean;
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;

  setUser: (user: User | null) => void;
  setAccount: (account: Account | null) => void;
  setDemoMode: (isDemoMode: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  account: null,
  isDemoMode: true, // Start in demo mode for hackathon
  sidebarOpen: true,
  mobileSidebarOpen: false,

  setUser: (user) => set({ user }),
  setAccount: (account) => set({ account }),
  setDemoMode: (isDemoMode) => set({ isDemoMode }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
}));
