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

export interface EnemySpawnMarkerViewInstance {
  id: string;
  object: Phaser.GameObjects.Text;
}

export interface BattleHudViewInstance {
  id: string;
  roundText: Phaser.GameObjects.Text;
  timeText: Phaser.GameObjects.Text;
  healthText: Phaser.GameObjects.Text;
  materialText: Phaser.GameObjects.Text;
  killsText: Phaser.GameObjects.Text;
}

export interface MaterialDropViewInstance {
  id: string;
  object: Phaser.GameObjects.Arc;
}

export interface WaveSummaryOverlayViewInstance {
  id: string;
  panel: Phaser.GameObjects.Rectangle;
  titleText: Phaser.GameObjects.Text;
  bodyText: Phaser.GameObjects.Text;
  continueButton: Phaser.GameObjects.Rectangle;
  continueText: Phaser.GameObjects.Text;
}

export interface ShopOverlayViewInstance {
  id: string;
  panel: Phaser.GameObjects.Rectangle;
  titleText: Phaser.GameObjects.Text;
  bodyText: Phaser.GameObjects.Text;
}

export interface PhaserViewContainer {
  playerViews: Map<string, PlayerViewInstance>;
  cameraAnchorViews: Map<string, CameraAnchorViewInstance>;
  worldViews: Map<string, WorldViewInstance>;
  weaponViews: Map<string, WeaponViewInstance>;
  projectileViews: Map<string, ProjectileViewInstance>;
  enemyViews: Map<string, EnemyViewInstance>;
  enemySpawnMarkerViews: Map<string, EnemySpawnMarkerViewInstance>;
  materialDropViews: Map<string, MaterialDropViewInstance>;
  battleHudViews: Map<string, BattleHudViewInstance>;
  waveSummaryOverlayViews: Map<string, WaveSummaryOverlayViewInstance>;
  shopOverlayViews: Map<string, ShopOverlayViewInstance>;
}

export function createPhaserViewContainer(): PhaserViewContainer {
  return {
    playerViews: new Map(),
    cameraAnchorViews: new Map(),
    worldViews: new Map(),
    weaponViews: new Map(),
    projectileViews: new Map(),
    enemyViews: new Map(),
    enemySpawnMarkerViews: new Map(),
    materialDropViews: new Map(),
    battleHudViews: new Map(),
    waveSummaryOverlayViews: new Map(),
    shopOverlayViews: new Map(),
  };
}
