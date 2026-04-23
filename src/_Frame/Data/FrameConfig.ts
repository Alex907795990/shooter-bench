export interface ArenaConfig {
  readonly width: number;
  readonly height: number;
}

export interface ViewConfig {
  readonly width: number;
  readonly height: number;
}

export const ARENA_CONFIG: ArenaConfig = {
  width: 2000,
  height: 1500,
};

export const VIEW_CONFIG: ViewConfig = {
  width: 800,
  height: 600,
};
