import { create } from 'zustand';

export type CameraMode = 'M' | 'Av' | 'Tv' | 'P' | 'ISO' | 'REC';

interface CameraState {
  currentMode: CameraMode;
  isTransitioning: boolean;
  isFocused: boolean;
  focusTarget: string | null;
  shutterOpen: boolean;
  dialRotation: number;
  cursorPosition: { x: number; y: number };
  audioEnabled: boolean;
  
  setMode: (mode: CameraMode) => void;
  setTransitioning: (transitioning: boolean) => void;
  setFocused: (focused: boolean, target?: string | null) => void;
  setShutterOpen: (open: boolean) => void;
  setDialRotation: (rotation: number) => void;
  setCursorPosition: (x: number, y: number) => void;
  toggleAudio: () => void;
}

export const MODES: CameraMode[] = ['M', 'Av', 'Tv', 'P', 'ISO', 'REC'];

export const MODE_LABELS: Record<CameraMode, string> = {
  'M': 'HOME',
  'Av': 'PORTFOLIO',
  'Tv': 'FILMS',
  'P': 'SERVICES',
  'ISO': 'ABOUT',
  'REC': 'CONTACT'
};

export const useCameraStore = create<CameraState>((set) => ({
  currentMode: 'M',
  isTransitioning: false,
  isFocused: false,
  focusTarget: null,
  shutterOpen: true,
  dialRotation: 0,
  cursorPosition: { x: 0, y: 0 },
  audioEnabled: true,
  
  setMode: (mode) => set({ currentMode: mode }),
  setTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  setFocused: (focused, target = null) => set({ isFocused: focused, focusTarget: target }),
  setShutterOpen: (open) => set({ shutterOpen: open }),
  setDialRotation: (rotation) => set({ dialRotation: rotation }),
  setCursorPosition: (x, y) => set({ cursorPosition: { x, y } }),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
}));
