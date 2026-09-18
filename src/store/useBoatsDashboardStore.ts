import { create } from 'zustand';
import api, { extractErrorMessage } from '@/utils/axios';
import { toast } from 'sonner';
import { BoatsDashboardMetrics } from '@/types/boats.types';

const getTTL = () => {
  const ttlStr = process.env.NEXT_PUBLIC_TTL;
  const ttl = parseInt(ttlStr || '300000', 10);
  return isNaN(ttl) ? 300000 : ttl;
};

export interface BoatsDashboardStore {
  metrics: BoatsDashboardMetrics | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;

  fetchDashboard: (force?: boolean) => Promise<void>;
  invalidateDashboard: () => void;
}

export const useBoatsDashboardStore = create<BoatsDashboardStore>((set, get) => ({
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
      const response = await api.get('/boats/dashboard');
      set({
        metrics: response.data.data,
        lastFetched: Date.now(),
        isLoading: false,
        isRefreshing: false,
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      set({ isLoading: false, isRefreshing: false, error: message });
      toast.error(message);
    }
  },

  invalidateDashboard: () => set({ lastFetched: null }),
}));


