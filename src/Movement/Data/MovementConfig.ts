export interface MovementConfig {
  readonly playerSpeed: number;
  readonly playerSize: number;
  readonly playerColor: number;
}

export const MOVEMENT_CONFIG: MovementConfig = {
  playerSpeed: 240,
  playerSize: 24,
  playerColor: 0x66ccff,
};
