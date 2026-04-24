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

export interface WeaponViewInstance {
  id: string;
  object: Phaser.GameObjects.Rectangle;
}

export interface ProjectileViewInstance {
  id: string;
  object: Phaser.GameObjects.Arc;
}

export interface EnemyViewInstance {
  id: string;
  object: Phaser.GameObjects.Arc;
}

export interface PhaserViewContainer {
  playerViews: Map<string, PlayerViewInstance>;
  cameraAnchorViews: Map<string, CameraAnchorViewInstance>;
  worldViews: Map<string, WorldViewInstance>;
  weaponViews: Map<string, WeaponViewInstance>;
  projectileViews: Map<string, ProjectileViewInstance>;
  enemyViews: Map<string, EnemyViewInstance>;
}

export function createPhaserViewContainer(): PhaserViewContainer {
  return {
    playerViews: new Map(),
    cameraAnchorViews: new Map(),
    worldViews: new Map(),
    weaponViews: new Map(),
    projectileViews: new Map(),
    enemyViews: new Map(),
  };
}
