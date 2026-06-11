import { create } from 'zustand';

interface GlucoseReading { id: string; valueMgDl: number; measuredAt: string; context: string; }

interface GlucoseState {
  latestReading: GlucoseReading | null;
  recentReadings: GlucoseReading[];
  alertMessage: string | null;
  setLatestReading: (r: GlucoseReading) => void;
  addReading: (r: GlucoseReading) => void;
  setAlert: (msg: string | null) => void;
}

export const useGlucoseStore = create<GlucoseState>((set) => ({
  latestReading: null,
  recentReadings: [],
  alertMessage: null,
  setLatestReading: (r) => set({ latestReading: r }),
  addReading: (r) => set((s) => ({ recentReadings: [r, ...s.recentReadings].slice(0, 100), latestReading: r })),
  setAlert: (alertMessage) => set({ alertMessage }),
}));
