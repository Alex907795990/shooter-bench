import * as Phaser from "phaser";
import type { World } from "./_Frame/Data/World";
import { ARENA_CONFIG, VIEW_CONFIG } from "./_Frame/Data/FrameConfig";
import { startupPipeline } from "./_Frame/StartupPipeline";
import { framePipeline } from "./_Frame/FramePipeline";
import { bindInputSource } from "./_Shared/Collector/InputCollector";
import { setTick } from "./_Shared/Collector/TimeCollector";
import { drawArenaBoundsAdapter } from "./_Shared/Adapter/ArenaAdapter";
import {
  setCameraBoundsAdapter,
  startCameraFollowAdapter,
} from "./_Shared/Adapter/CameraAdapter";
import { createPlayerSpriteAdapter } from "./Movement/Adapter/PlayerSpriteAdapter";
import { bindEnemyScene } from "./Enemy/Adapter/EnemySpriteAdapter";
import { bindSpawnMarkerScene } from "./Enemy/Adapter/SpawnMarkerSpriteAdapter";
import { bindProjectileScene } from "./Weapon/Adapter/ProjectileSpriteAdapter";
import { bindWeaponScene } from "./Weapon/Adapter/WeaponSpriteAdapter";

class BattleScene extends Phaser.Scene {
  private state!: World;

  constructor() {
    super("battle");
  }

  create(): void {
    this.state = startupPipeline(ARENA_CONFIG.width, ARENA_CONFIG.height);
    bindInputSource(this.input.keyboard!);

    drawArenaBoundsAdapter(this, ARENA_CONFIG.width, ARENA_CONFIG.height, 0x66ccff);
    bindEnemyScene(this);
    bindSpawnMarkerScene(this);
    bindProjectileScene(this);
    bindWeaponScene(this);
    const playerSprite = createPlayerSpriteAdapter(
      this,
      this.state.movement.player.pos,
      24,
      0x66ccff,
    );

    setCameraBoundsAdapter(this, ARENA_CONFIG.width, ARENA_CONFIG.height);
    startCameraFollowAdapter(this, playerSprite, 0.15, 0.15);
  }

  update(_time: number, delta: number): void {
    setTick(delta);
    framePipeline(this.state);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: VIEW_CONFIG.width,
  height: VIEW_CONFIG.height,
  backgroundColor: "#111111",
  scene: [BattleScene],
});
