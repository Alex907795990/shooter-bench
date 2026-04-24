import type * as Phaser from "phaser";

export interface PlayerViewInstance {
  id: string;
  object: Phaser.GameObjects.Arc;
}

export interface CameraAnchorViewInstance {
  id: string;
  object: Phaser.GameObjects.Zone;
}

export interface WorldViewInstance {
  id: string;
  ground: Phaser.GameObjects.Rectangle;
  grid: Phaser.GameObjects.Grid;
  border: Phaser.GameObjects.Rectangle;
}

export interface PhaserViewContainer {
  playerViews: Map<string, PlayerViewInstance>;
  cameraAnchorViews: Map<string, CameraAnchorViewInstance>;
  worldViews: Map<string, WorldViewInstance>;
}

export function createPhaserViewContainer(): PhaserViewContainer {
  return {
    playerViews: new Map(),
    cameraAnchorViews: new Map(),
    worldViews: new Map(),
  };
}
