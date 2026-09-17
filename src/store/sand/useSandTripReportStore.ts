// src/store/sand/useSandTripReportStore.ts
// ─── PDF Report UI State ──────────────────────────────────────────────────────
// Manages client-side state for the PDF export modal/panel.
// Intentionally NOT persisted (no `persist` middleware) so filters always
// reset to empty on page reload — users should consciously choose their export
// range each time.

import { create } from 'zustand';
import type { SandTripsReportFilters } from '@/types/sand/sand-report.types';

// ── State shape ───────────────────────────────────────────────────────────────

interface ReportFiltersState {
  boatPublicId: string | null;
  fromDate: string | null;
  toDate: string | null;
}

interface SandTripReportState {
  // ── UI state ──────────────────────────────────────────────────────────────
  isFiltersPanelOpen: boolean;
  isPreviewOpen: boolean;
  isGenerating: boolean;
  error: string | null;

  // ── Report filters (list-page export only) ────────────────────────────────
  reportFilters: ReportFiltersState;

  // ── Derived: is the filter form valid enough to trigger a query? ──────────
  isFiltersValid: boolean;

  // ── Actions ───────────────────────────────────────────────────────────────
  openFiltersPanel: () => void;
  closeFiltersPanel: () => void;
  openPreview: () => void;
  closePreview: () => void;
  setReportFilter: <K extends keyof ReportFiltersState>(
    key: K,
    value: ReportFiltersState[K]
  ) => void;
  resetReportFilters: () => void;
  setGenerating: (v: boolean) => void;
  setError: (msg: string | null) => void;

  /** Convenience: returns filters cast to SandTripsReportFilters if valid, else null */
  getValidFilters: () => SandTripsReportFilters | null;
}

// ── Initial state ─────────────────────────────────────────────────────────────

const initialFilters: ReportFiltersState = {
  boatPublicId: null,
  fromDate: null,
  toDate: null,
};

function computeIsValid(f: ReportFiltersState): boolean {
  return !!f.boatPublicId && !!f.fromDate && !!f.toDate;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useSandTripReportStore = create<SandTripReportState>()((set, get) => ({
  isFiltersPanelOpen: false,
  isPreviewOpen: false,
  isGenerating: false,
  error: null,
  reportFilters: initialFilters,
  isFiltersValid: false,

  openFiltersPanel: () => set({ isFiltersPanelOpen: true }),
  closeFiltersPanel: () =>
    set({ isFiltersPanelOpen: false, isPreviewOpen: false, error: null }),

  openPreview: () => set({ isPreviewOpen: true }),
  closePreview: () => set({ isPreviewOpen: false }),

  setReportFilter: (key, value) =>
    set((state) => {
      const updated = { ...state.reportFilters, [key]: value };
      return { reportFilters: updated, isFiltersValid: computeIsValid(updated) };
    }),

  resetReportFilters: () =>
    set({
      reportFilters: initialFilters,
      isFiltersValid: false,
      error: null,
    }),

  setGenerating: (v) => set({ isGenerating: v }),
  setError: (msg) => set({ error: msg }),

  getValidFilters: () => {
    const { reportFilters } = get();
    if (!computeIsValid(reportFilters)) return null;
    return {
      boatPublicId: reportFilters.boatPublicId!,
      fromDate: reportFilters.fromDate!,
      toDate: reportFilters.toDate!,
    };
  },
}));
