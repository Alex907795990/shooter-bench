export interface ArenaConfig {
  readonly width: number;
  readonly height: number;
  readonly boundsColor: number;
}

export interface ViewConfig {
  readonly width: number;
  readonly height: number;
  readonly backgroundColor: string;
}

export interface CameraConfig {
  readonly lerpX: number;
  readonly lerpY: number;
}

export const ARENA_CONFIG: ArenaConfig = {
  width: 2000,
  height: 1500,
  boundsColor: 0x66ccff,
};

export const VIEW_CONFIG: ViewConfig = {
  width: 800,
  height: 600,
  backgroundColor: "#111111",
};

export const CAMERA_CONFIG: CameraConfig = {
  lerpX: 0.15,
  lerpY: 0.15,
};
