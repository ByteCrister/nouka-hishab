import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'sonner';
import { SandDashboardMetrics } from '@/types/sand.types';

const getTTL = () => {
  const ttlStr = process.env.NEXT_PUBLIC_DASHBOARD_TTL;
  const ttl = parseInt(ttlStr || '300000', 10);
  return isNaN(ttl) ? 300000 : ttl; // fallback to 5 minutes
};

export interface SandDashboardStore {
  metrics: SandDashboardMetrics | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;

  fetchDashboard: (force?: boolean) => Promise<void>;
  invalidateDashboard: () => void;
}

export const useSandDashboardStore = create<SandDashboardStore>((set, get) => ({
  metrics: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetched: null,

  fetchDashboard: async (force = false) => {
    const { lastFetched, isLoading, isRefreshing } = get();

    // Prevent overlapping requests
    if (isLoading || isRefreshing) return;

    // Check TTL (cache freshness)
    const now = Date.now();
    if (!force && lastFetched && now - lastFetched < getTTL()) {
      return; // data is still fresh
    }

    const isInitial = !lastFetched;
    set(isInitial ? { isLoading: true, error: null } : { isRefreshing: true, error: null });

    try {
      const response = await axios.get('/api/v1/sand/dashboard');
      set({
        metrics: response.data.data,
        lastFetched: Date.now(),
        isLoading: false,
        isRefreshing: false,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : 'Failed to fetch dashboard metrics';
      set({ isLoading: false, isRefreshing: false, error: message });
      toast.error(message);
    }
  },

  invalidateDashboard: () => set({ lastFetched: null }),
}));
