import type { RectangleData, Vector2Data } from "./data";

export interface PlayerInstance {
  id: string;
  position: Vector2Data;
  radius: number;
  moveSpeed: number;
}

export interface CameraInstance {
  id: string;
  targetId: string;
  position: Vector2Data;
}

export interface InstanceContainer {
  worldBounds: RectangleData;
  players: Map<string, PlayerInstance>;
  cameras: Map<string, CameraInstance>;
}

export function createBattleInstanceContainer(): InstanceContainer {
  return {
    worldBounds: {
      x: 0,
      y: 0,
      width: 1600,
      height: 1200,
    },
    players: new Map([
      [
        "player",
        {
          id: "player",
          position: { x: 800, y: 600 },
          radius: 24,
          moveSpeed: 310,
        },
      ],
    ]),
    cameras: new Map([
      [
        "main",
        {
          id: "main",
          targetId: "player",
          position: { x: 800, y: 600 },
        },
      ],
    ]),
  };
}
