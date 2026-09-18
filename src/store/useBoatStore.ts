import { create } from 'zustand';
import api, { extractErrorMessage } from '@/utils/axios';

import type { PaginationMeta, SortOrder } from '@/types/api.types';
import type {
    BoatListItem,
    BoatListKpis,
    BoatDetail,
    BoatDetailKpis,
    BoatListFilters,
    BoatTripsFilters,
    BoatSortField,
    BoatTripSortField,
    BoatTripListItem,
    CreateBoatPayload,
    UpdateBoatPayload,
    BoatDetailResponse,
    BoatTripsResponse,
    BoatListResponse,
    AddBoatDocumentPayload,
} from '@/types/boats.types';
import {
    BOAT_LIST_DEFAULT_FILTERS,
    BOAT_TRIPS_DEFAULT_FILTERS,
} from '@/constants/boats.const';
import type { BoatStatus } from '@/constants/boats.const';
import type { SandTripStatus } from '@/constants/db/sand.const';
import type { SectorName } from '@/constants/db/app.const';


// Strip empty values before sending to the API
function compact<T extends object>(obj: T): Partial<T> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === '' || v === null || v === undefined) continue;
        out[k] = v;
    }
    return out as Partial<T>;
}

// ─── Cache helpers ───────────────────────────────────────────────────────────
type CacheEntry<T> = {
    data: T;
    timestamp: number;
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const API_URL = '/boats';

// ─── Race-condition guard (per store) ──────────────────────────────────────
let listFetchSeq = 0;
let detailFetchSeq = 0;
let tripsFetchSeq = 0;

// ═══════════════════════════════════════════════════════════════════════════
// LIST STORE
// ═══════════════════════════════════════════════════════════════════════════
interface BoatsListState {
    // data
    boats: BoatListItem[];
    kpis: BoatListKpis | null;
    meta: PaginationMeta | null;
    listCache: Record<string, CacheEntry<BoatListResponse>>;

    // ui
    filters: BoatListFilters;
    isLoading: boolean;
    isRefreshing: boolean;
    isDeleting: boolean;
    error: string | null;
    lastFetchedAt: number | null;

    // filter setters — all reset page to 1 unless page is being set
    setSearch: (v: string) => void;
    setSector: (v: SectorName | 'all') => void;
    setStatus: (v: BoatStatus | 'all') => void;
    setSort: (by: BoatSortField, order?: SortOrder) => void;
    setPage: (p: number) => void;
    setLimit: (l: number) => void;
    resetFilters: () => void;

    // actions
    fetchBoats: (opts?: { silent?: boolean }) => Promise<void>;
    deleteBoat: (publicId: string) => Promise<boolean>;
    reset: () => void;
}

export const useBoatsListStore = create<BoatsListState>((set, get) => ({
    boats: [],
    kpis: null,
    meta: null,
    listCache: {},

    filters: { ...BOAT_LIST_DEFAULT_FILTERS },
    isLoading: false,
    isRefreshing: false,
    isDeleting: false,
    error: null,
    lastFetchedAt: null,

    // ── filter setters ─────────────────────────────────────────────────────
    setSearch: (v) =>
        set((s) => ({ filters: { ...s.filters, search: v, page: 1 } })),
    setSector: (v) =>
        set((s) => ({ filters: { ...s.filters, sector: v, page: 1 } })),
    setStatus: (v) =>
        set((s) => ({ filters: { ...s.filters, status: v, page: 1 } })),
    setSort: (by, order) =>
        set((s) => ({
            filters: {
                ...s.filters,
                sortBy: by,
                sortOrder: order ?? s.filters.sortOrder,
                page: 1,
            },
        })),
    setPage: (p) => set((s) => ({ filters: { ...s.filters, page: p } })),
    setLimit: (l) =>
        set((s) => ({ filters: { ...s.filters, limit: l, page: 1 } })),
    resetFilters: () =>
        set({ filters: { ...BOAT_LIST_DEFAULT_FILTERS } }),

    // ── fetch ──────────────────────────────────────────────────────────────
    fetchBoats: async (opts) => {
        const silent = opts?.silent ?? false;
        const { filters, listCache } = get();
        const seq = ++listFetchSeq;

        const params = compact({
            search: filters.search.trim() || undefined,
            sector: filters.sector !== 'all' ? filters.sector : undefined,
            status: filters.status !== 'all' ? filters.status : undefined,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
            page: filters.page,
            limit: filters.limit,
        });

        const cacheKey = JSON.stringify(params);
        const cached = listCache[cacheKey];

        if (!silent && cached && Date.now() - cached.timestamp < CACHE_TTL) {
            set({
                boats: cached.data.items ?? [],
                meta: cached.data.meta ?? null,
                kpis: cached.data.kpis ?? null,
                isLoading: false,
                isRefreshing: false,
                error: null,
                lastFetchedAt: cached.timestamp,
            });
            return;
        }

        set({
            isLoading: !silent,
            isRefreshing: silent,
            error: null,
        });

        try {
            const { data } = await api.get<{ data: BoatListResponse }>(
                API_URL,
                { params },
            );

            // Guard: a newer request already landed
            if (seq !== listFetchSeq) return;

            const payload = data.data;
            set((s) => ({
                boats: payload.items ?? [],
                meta: payload.meta ?? null,
                kpis: payload.kpis ?? null,
                isLoading: false,
                isRefreshing: false,
                lastFetchedAt: Date.now(),
                listCache: {
                    ...s.listCache,
                    [cacheKey]: { data: payload, timestamp: Date.now() },
                },
            }));
        } catch (err) {
            if (seq !== listFetchSeq) return;
            set({
                error: extractErrorMessage(err),
                isLoading: false,
                isRefreshing: false,
            });
        }
    },

    // ── delete ─────────────────────────────────────────────────────────────
    deleteBoat: async (publicId) => {
        set({ isDeleting: true, error: null });
        try {
            await api.delete(`${API_URL}/${publicId}`);
            set({ isDeleting: false, listCache: {} });
            // Silent refresh keeps KPIs and pagination in sync
            await get().fetchBoats({ silent: true });
            return true;
        } catch (err) {
            set({ isDeleting: false, error: extractErrorMessage(err) });
            return false;
        }
    },

    reset: () => {
        listFetchSeq++;
        set({
            boats: [],
            kpis: null,
            meta: null,
            listCache: {},
            filters: { ...BOAT_LIST_DEFAULT_FILTERS },
            isLoading: false,
            isRefreshing: false,
            isDeleting: false,
            error: null,
            lastFetchedAt: null,
        });
    },
}));

// ═══════════════════════════════════════════════════════════════════════════
// DETAIL STORE
// ═══════════════════════════════════════════════════════════════════════════
interface BoatDetailState {
    // data
    boat: BoatDetail | null;
    kpis: BoatDetailKpis | null;
    trips: BoatTripListItem[];
    tripsMeta: PaginationMeta | null;
    detailCache: Record<string, CacheEntry<BoatDetailResponse>>;
    tripsCache: Record<string, CacheEntry<BoatTripsResponse>>;

    // ui
    isLoading: boolean;
    isTripsLoading: boolean;
    isSubmitting: boolean;
    isDeleting: boolean;
    error: string | null;
    tripsError: string | null;
    lastFetchedAt: number | null;

    // trips filters (kept inside this store — it belongs to this page)
    tripsFilters: BoatTripsFilters;
    setTripsStatus: (v: SandTripStatus | 'all') => void;
    setTripsSearch: (v: string) => void;
    setTripsDateRange: (from: string | null, to: string | null) => void;
    setTripsSort: (by: BoatTripSortField, order?: SortOrder) => void;
    setTripsPage: (p: number) => void;
    setTripsLimit: (l: number) => void;
    resetTripsFilters: () => void;

    // actions
    fetchBoat: (publicId: string, opts?: { silent?: boolean }) => Promise<void>;
    fetchTrips: (
        publicId: string,
        opts?: { silent?: boolean },
    ) => Promise<void>;
    createBoat: (payload: CreateBoatPayload) => Promise<BoatDetail | null>;
    updateBoat: (
        publicId: string,
        payload: UpdateBoatPayload,
    ) => Promise<BoatDetail | null>;
    deleteBoat: (publicId: string) => Promise<boolean>;

    // image helpers (JSON payload matching profile workflow)
    uploadBoatImage: (
        publicId: string,
        fileId: number,
        isPrimary?: boolean,
    ) => Promise<boolean>;
    deleteBoatImage: (publicId: string, fileId: number) => Promise<boolean>;

    // document helpers
    uploadBoatDocument: (
        publicId: string,
        payload: AddBoatDocumentPayload,
    ) => Promise<boolean>;
    deleteBoatDocument: (publicId: string, documentId: number) => Promise<boolean>;

    reset: () => void;
}

export const useBoatStore = create<BoatDetailState>((set, get) => ({
    boat: null,
    kpis: null,
    trips: [],
    tripsMeta: null,
    detailCache: {},
    tripsCache: {},

    isLoading: false,
    isTripsLoading: false,
    isSubmitting: false,
    isDeleting: false,
    error: null,
    tripsError: null,
    lastFetchedAt: null,

    tripsFilters: { ...BOAT_TRIPS_DEFAULT_FILTERS },

    // ── trips filter setters ───────────────────────────────────────────────
    setTripsStatus: (v) =>
        set((s) => ({
            tripsFilters: { ...s.tripsFilters, status: v, page: 1 },
        })),
    setTripsSearch: (v) =>
        set((s) => ({
            tripsFilters: { ...s.tripsFilters, search: v, page: 1 },
        })),
    setTripsDateRange: (from, to) =>
        set((s) => ({
            tripsFilters: { ...s.tripsFilters, fromDate: from, toDate: to, page: 1 },
        })),
    setTripsSort: (by, order) =>
        set((s) => ({
            tripsFilters: {
                ...s.tripsFilters,
                sortBy: by,
                sortOrder: order ?? s.tripsFilters.sortOrder,
                page: 1,
            },
        })),
    setTripsPage: (p) =>
        set((s) => ({ tripsFilters: { ...s.tripsFilters, page: p } })),
    setTripsLimit: (l) =>
        set((s) => ({ tripsFilters: { ...s.tripsFilters, limit: l, page: 1 } })),
    resetTripsFilters: () =>
        set({ tripsFilters: { ...BOAT_TRIPS_DEFAULT_FILTERS } }),

    // ── fetch boat + KPIs ──────────────────────────────────────────────────
    fetchBoat: async (publicId, opts) => {
        const silent = opts?.silent ?? false;
        const { detailCache } = get();
        const seq = ++detailFetchSeq;

        const cacheKey = publicId;
        const cached = detailCache[cacheKey];

        if (!silent && cached && Date.now() - cached.timestamp < CACHE_TTL) {
            set({
                boat: cached.data.boat,
                kpis: cached.data.kpis,
                isLoading: false,
                error: null,
                lastFetchedAt: cached.timestamp,
            });
            return;
        }

        set({ isLoading: !silent, error: null });

        try {
            const { data } = await api.get<{ data: BoatDetailResponse }>(
                `${API_URL}/${publicId}`,
            );
            if (seq !== detailFetchSeq) return;

            const payload = data.data;
            set((s) => ({
                boat: payload.boat,
                kpis: payload.kpis,
                isLoading: false,
                lastFetchedAt: Date.now(),
                detailCache: {
                    ...s.detailCache,
                    [cacheKey]: { data: payload, timestamp: Date.now() },
                },
            }));
        } catch (err) {
            if (seq !== detailFetchSeq) return;
            set({ error: extractErrorMessage(err), isLoading: false });
        }
    },

    // ── fetch trips ────────────────────────────────────────────────────────
    fetchTrips: async (publicId, opts) => {
        const silent = opts?.silent ?? false;
        const { tripsFilters, tripsCache } = get();
        const seq = ++tripsFetchSeq;

        const params = compact({
            search: tripsFilters.search.trim() || undefined,
            status: tripsFilters.status !== 'all' ? tripsFilters.status : undefined,
            fromDate: tripsFilters.fromDate ?? undefined,
            toDate: tripsFilters.toDate ?? undefined,
            sortBy: tripsFilters.sortBy,
            sortOrder: tripsFilters.sortOrder,
            page: tripsFilters.page,
            limit: tripsFilters.limit,
        });

        const cacheKey = `${publicId}-${JSON.stringify(params)}`;
        const cached = tripsCache[cacheKey];

        if (!silent && cached && Date.now() - cached.timestamp < CACHE_TTL) {
            set({
                trips: cached.data.items ?? [],
                tripsMeta: cached.data.meta ?? null,
                isTripsLoading: false,
                tripsError: null,
            });
            return;
        }

        set({ isTripsLoading: !silent, tripsError: null });

        try {
            const { data } = await api.get<{ data: BoatTripsResponse }>(
                `${API_URL}/${publicId}/trips`,
                { params },
            );
            if (seq !== tripsFetchSeq) return;

            const payload = data.data;
            set((s) => ({
                trips: payload.items ?? [],
                tripsMeta: payload.meta ?? null,
                isTripsLoading: false,
                tripsCache: {
                    ...s.tripsCache,
                    [cacheKey]: { data: payload, timestamp: Date.now() },
                },
            }));
        } catch (err) {
            if (seq !== tripsFetchSeq) return;
            set({
                tripsError: extractErrorMessage(err),
                isTripsLoading: false,
            });
        }
    },

    // ── create ─────────────────────────────────────────────────────────────
    createBoat: async (payload) => {
        set({ isSubmitting: true, error: null });
        try {
            const { data } = await api.post<{ data: BoatDetail }>(
                API_URL,
                compact(payload),
            );
            set({ isSubmitting: false, boat: data.data, detailCache: {} });
            useBoatsListStore.setState({ listCache: {} });
            return data.data;
        } catch (err) {
            set({ isSubmitting: false, error: extractErrorMessage(err) });
            return null;
        }
    },

    // ── update ─────────────────────────────────────────────────────────────
    updateBoat: async (publicId, payload) => {
        set({ isSubmitting: true, error: null });
        try {
            const { data } = await api.patch<{ data: BoatDetail }>(
                `${API_URL}/${publicId}`,
                compact(payload),
            );
            set({ isSubmitting: false, boat: data.data, detailCache: {} });
            useBoatsListStore.setState({ listCache: {} });
            return data.data;
        } catch (err) {
            set({ isSubmitting: false, error: extractErrorMessage(err) });
            return null;
        }
    },

    // ── delete ─────────────────────────────────────────────────────────────
    deleteBoat: async (publicId) => {
        set({ isDeleting: true, error: null });
        try {
            await api.delete(`${API_URL}/${publicId}`);
            set({ isDeleting: false, detailCache: {}, tripsCache: {} });
            useBoatsListStore.setState({ listCache: {} });
            return true;
        } catch (err) {
            set({ isDeleting: false, error: extractErrorMessage(err) });
            return false;
        }
    },

    // ── images (JSON) ──────────────────────────────────────────────────────
    uploadBoatImage: async (publicId, fileId, isPrimary = false) => {
        set({ isSubmitting: true, error: null });
        try {
            await api.post(`${API_URL}/${publicId}/images`, {
                fileId,
                isPrimary,
            });
            set({ isSubmitting: false, detailCache: {} });
            useBoatsListStore.setState({ listCache: {} });
            await get().fetchBoat(publicId, { silent: true });
            return true;
        } catch (err) {
            set({ isSubmitting: false, error: extractErrorMessage(err) });
            return false;
        }
    },

    deleteBoatImage: async (publicId, fileId) => {
        set({ isSubmitting: true, error: null });
        try {
            await api.delete(`${API_URL}/${publicId}/images/${fileId}`);
            set({ isSubmitting: false, detailCache: {} });
            useBoatsListStore.setState({ listCache: {} });
            await get().fetchBoat(publicId, { silent: true });
            return true;
        } catch (err) {
            set({ isSubmitting: false, error: extractErrorMessage(err) });
            return false;
        }
    },

    // ── documents ──────────────────────────────────────────────────────────
    uploadBoatDocument: async (publicId, payload) => {
        set({ isSubmitting: true, error: null });
        try {
            await api.post(`${API_URL}/${publicId}/documents`, compact(payload));
            set({ isSubmitting: false, detailCache: {} });
            await get().fetchBoat(publicId, { silent: true });
            return true;
        } catch (err) {
            set({ isSubmitting: false, error: extractErrorMessage(err) });
            return false;
        }
    },

    deleteBoatDocument: async (publicId, documentId) => {
        set({ isSubmitting: true, error: null });
        try {
            await api.delete(`${API_URL}/${publicId}/documents/${documentId}`);
            set({ isSubmitting: false, detailCache: {} });
            await get().fetchBoat(publicId, { silent: true });
            return true;
        } catch (err) {
            set({ isSubmitting: false, error: extractErrorMessage(err) });
            return false;
        }
    },

    reset: () => {
        detailFetchSeq++;
        tripsFetchSeq++;
        set({
            boat: null,
            kpis: null,
            trips: [],
            tripsMeta: null,
            detailCache: {},
            tripsCache: {},
            isLoading: false,
            isTripsLoading: false,
            isSubmitting: false,
            isDeleting: false,
            error: null,
            tripsError: null,
            lastFetchedAt: null,
            tripsFilters: { ...BOAT_TRIPS_DEFAULT_FILTERS },
        });
    },
}));

