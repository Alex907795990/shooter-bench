import type * as Phaser from "phaser";
import { PLAYER_ID } from "../game/data";
import {
  BattleRoundInstanceOps,
  BattleSessionInstanceOps,
  CameraInstanceOps,
  EnemyInstanceOps,
  EnemySpawnMarkerInstanceOps,
  MaterialDropInstanceOps,
  PlayerEconomyInstanceOps,
  PlayerInstanceOps,
  ProjectileInstanceOps,
  WaveStatsInstanceOps,
  WeaponInstanceOps,
  WorldBoundsOps,
} from "../game/instance-ops";
import type { InstanceContainer } from "../game/instances";
import type { PhaserViewContainer } from "./phaser-view-instances";
import {
  BattleHudViewOps,
  CameraAnchorViewOps,
  EnemyViewOps,
  EnemySpawnMarkerViewOps,
  MaterialDropViewOps,
  PlayerViewOps,
  ProjectileViewOps,
  ShopOverlayViewOps,
  WaveSummaryOverlayViewOps,
  WeaponViewOps,
  WorldViewOps,
  createBattleHudViewInstance,
  createCameraAnchorViewInstance,
  createEnemyViewInstance,
  createEnemySpawnMarkerViewInstance,
  createMaterialDropViewInstance,
  createPlayerViewInstance,
  createProjectileViewInstance,
  createShopOverlayViewInstance,
  createWaveSummaryOverlayViewInstance,
  createWeaponViewInstance,
  createWorldViewInstance,
} from "./phaser-view-ops";

export class BattleViewInitializeSystem {
  resolve(
    scene: Phaser.Scene,
    instanceContainer: InstanceContainer,
    phaserViews: PhaserViewContainer,
    handlers: { onContinueWaveSummary: () => void },
  ): void {
    this.createWorldView(scene, instanceContainer, phaserViews);
    this.createPlayerView(scene, instanceContainer, phaserViews);
    this.createCameraView(scene, instanceContainer, phaserViews);
    BattleHudViewOps.add(phaserViews, createBattleHudViewInstance(scene, "battle-hud"));
    WaveSummaryOverlayViewOps.add(
      phaserViews,
      createWaveSummaryOverlayViewInstance(scene, "wave-summary", handlers.onContinueWaveSummary),
    );
    WaveSummaryOverlayViewOps.setVisible(phaserViews, "wave-summary", false);
    ShopOverlayViewOps.add(phaserViews, createShopOverlayViewInstance(scene, "shop"));
    ShopOverlayViewOps.setVisible(phaserViews, "shop", false);
  }

  private createWorldView(
    scene: Phaser.Scene,
    instanceContainer: InstanceContainer,
    phaserViews: PhaserViewContainer,
  ): void {
    const bounds = WorldBoundsOps.get(instanceContainer);

    scene.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    WorldViewOps.add(
      phaserViews,
      createWorldViewInstance(scene, "battle-world", bounds.x, bounds.y, bounds.width, bounds.height),
    );
  }

  private createPlayerView(
    scene: Phaser.Scene,
    instanceContainer: InstanceContainer,
    phaserViews: PhaserViewContainer,
  ): void {
    const player = PlayerInstanceOps.get(instanceContainer, PLAYER_ID);

    if (!player) {
      throw new Error("Player instance is missing.");
    }

    PlayerViewOps.add(
      phaserViews,
      createPlayerViewInstance(scene, player.id, player.position.x, player.position.y, player.radius),
    );
  }

  private createCameraView(
    scene: Phaser.Scene,
    instanceContainer: InstanceContainer,
    phaserViews: PhaserViewContainer,
  ): void {
    const cameraState = CameraInstanceOps.get(instanceContainer, "main");

    if (!cameraState) {
      throw new Error("Main camera instance is missing.");
    }

    CameraAnchorViewOps.add(
      phaserViews,
      createCameraAnchorViewInstance(scene, cameraState.id, cameraState.position.x, cameraState.position.y),
    );

    const cameraAnchor = CameraAnchorViewOps.get(phaserViews, cameraState.id);

    if (!cameraAnchor) {
      throw new Error("Main camera anchor view is missing.");
    }

    scene.cameras.main.startFollow(cameraAnchor.object, true, 0.14, 0.14);
  }
}

export class BattleViewSyncSystem {
  resolve(scene: Phaser.Scene, instanceContainer: InstanceContainer, phaserViews: PhaserViewContainer): void {
    const player = PlayerInstanceOps.get(instanceContainer, PLAYER_ID);
    const cameraState = CameraInstanceOps.get(instanceContainer, "main");

    if (player) {
      PlayerViewOps.setPosition(phaserViews, player.id, player.position.x, player.position.y);
      PlayerViewOps.setHitFlash(phaserViews, player.id, player.hitFlashSeconds > 0);
    }

    if (cameraState) {
      CameraAnchorViewOps.setPosition(phaserViews, cameraState.id, cameraState.position.x, cameraState.position.y);
    }

    this.syncWeaponViews(scene, instanceContainer, phaserViews);
    this.syncBattleHud(instanceContainer, phaserViews);
    this.syncEnemySpawnMarkerViews(scene, instanceContainer, phaserViews);
    this.syncEnemyViews(scene, instanceContainer, phaserViews);
    this.syncProjectileViews(scene, instanceContainer, phaserViews);
    this.syncMaterialDropViews(scene, instanceContainer, phaserViews);
    this.syncOverlays(instanceContainer, phaserViews);
  }

  private syncMaterialDropViews(
    scene: Phaser.Scene,
    instanceContainer: InstanceContainer,
    phaserViews: PhaserViewContainer,
  ): void {
    const activeIds = new Set<string>();

    for (const drop of MaterialDropInstanceOps.list(instanceContainer)) {
      activeIds.add(drop.id);

      if (!MaterialDropViewOps.get(phaserViews, drop.id)) {
        MaterialDropViewOps.add(
          phaserViews,
          createMaterialDropViewInstance(scene, drop.id, drop.position.x, drop.position.y),
        );
      }

      MaterialDropViewOps.setPosition(phaserViews, drop.id, drop.position.x, drop.position.y);
    }

    for (const dropViewId of MaterialDropViewOps.listIds(phaserViews)) {
      if (!activeIds.has(dropViewId)) {
        MaterialDropViewOps.remove(phaserViews, dropViewId);
      }
    }
  }

  private syncOverlays(instanceContainer: InstanceContainer, phaserViews: PhaserViewContainer): void {
    const session = BattleSessionInstanceOps.get(instanceContainer);
    const battleRound = BattleRoundInstanceOps.get(instanceContainer);
    const economy = PlayerEconomyInstanceOps.get(instanceContainer);
    const stats = WaveStatsInstanceOps.get(instanceContainer);
    const player = PlayerInstanceOps.get(instanceContainer, PLAYER_ID);

    const showSummary = session.phase === "wave-summary";
    WaveSummaryOverlayViewOps.setVisible(phaserViews, "wave-summary", showSummary);

    if (showSummary) {
      WaveSummaryOverlayViewOps.setBody(
        phaserViews,
        "wave-summary",
        [
          `Round ${battleRound.roundNumber}/${battleRound.totalRounds}`,
          `Wave material: ${economy.waveMaterial}`,
          `Total material: ${economy.totalMaterial}`,
          `Kills: ${stats.killCount}`,
          `HP remaining: ${player ? player.health.current : 0}/${player ? player.health.max : 0}`,
        ].join("\n"),
      );
    }

    const showShop = session.phase === "shop";
    ShopOverlayViewOps.setVisible(phaserViews, "shop", showShop);

    if (showShop) {
      ShopOverlayViewOps.setBody(
        phaserViews,
        "shop",
        [`Total material: ${economy.totalMaterial}`, "", "Shop coming soon"].join("\n"),
      );
    }
  }

  private syncBattleHud(instanceContainer: InstanceContainer, phaserViews: PhaserViewContainer): void {
    const battleRound = BattleRoundInstanceOps.get(instanceContainer);
    const economy = PlayerEconomyInstanceOps.get(instanceContainer);
    const stats = WaveStatsInstanceOps.get(instanceContainer);
    const player = PlayerInstanceOps.get(instanceContainer, PLAYER_ID);
    const session = BattleSessionInstanceOps.get(instanceContainer);
    const secondsRemaining = Math.ceil(battleRound.remainingSeconds);
    const timeText =
      session.phase === "battle" && battleRound.status === "running"
        ? `${secondsRemaining}s`
        : "Round clear";

    BattleHudViewOps.setText(phaserViews, "battle-hud", {
      round: `Round ${battleRound.roundNumber}/${battleRound.totalRounds}`,
      time: timeText,
      health: `HP ${player ? player.health.current : 0}/${player ? player.health.max : 0}`,
      material: `Material ${economy.totalMaterial}`,
      kills: `Kills ${stats.killCount}`,
    });
  }

  private syncWeaponViews(
    scene: Phaser.Scene,
    instanceContainer: InstanceContainer,
    phaserViews: PhaserViewContainer,
  ): void {
    for (const weapon of WeaponInstanceOps.list(instanceContainer)) {
      if (!WeaponViewOps.get(phaserViews, weapon.id)) {
        WeaponViewOps.add(
          phaserViews,
          createWeaponViewInstance(scene, weapon.id, weapon.position.x, weapon.position.y),
        );
      }

      WeaponViewOps.setPosition(phaserViews, weapon.id, weapon.position.x, weapon.position.y);
      WeaponViewOps.setRotation(phaserViews, weapon.id, weapon.facingRadians);
    }
  }

  private syncEnemyViews(
    scene: Phaser.Scene,
    instanceContainer: InstanceContainer,
    phaserViews: PhaserViewContainer,
  ): void {
    const activeEnemyIds = new Set<string>();

    for (const enemy of EnemyInstanceOps.list(instanceContainer)) {
      activeEnemyIds.add(enemy.id);

      if (!EnemyViewOps.get(phaserViews, enemy.id)) {
        EnemyViewOps.add(
          phaserViews,
          createEnemyViewInstance(scene, enemy.id, enemy.position.x, enemy.position.y, enemy.radius),
        );
      }

      EnemyViewOps.setPosition(phaserViews, enemy.id, enemy.position.x, enemy.position.y);
      EnemyViewOps.setHitFlash(phaserViews, enemy.id, enemy.hitFlashSeconds > 0);
    }

    for (const enemyViewId of EnemyViewOps.listIds(phaserViews)) {
      if (!activeEnemyIds.has(enemyViewId)) {
        EnemyViewOps.remove(phaserViews, enemyViewId);
      }
    }
  }

  private syncEnemySpawnMarkerViews(
    scene: Phaser.Scene,
    instanceContainer: InstanceContainer,
    phaserViews: PhaserViewContainer,
  ): void {
    const activeMarkerIds = new Set<string>();

    for (const marker of EnemySpawnMarkerInstanceOps.list(instanceContainer)) {
      activeMarkerIds.add(marker.id);

      if (!EnemySpawnMarkerViewOps.get(phaserViews, marker.id)) {
        EnemySpawnMarkerViewOps.add(
          phaserViews,
          createEnemySpawnMarkerViewInstance(scene, marker.id, marker.position.x, marker.position.y),
        );
      }

      EnemySpawnMarkerViewOps.setPosition(phaserViews, marker.id, marker.position.x, marker.position.y);
      EnemySpawnMarkerViewOps.setWarningRatio(
        phaserViews,
        marker.id,
        Math.max(0, Math.min(1, marker.spawnDelayRemainingSeconds)),
      );
    }

    for (const markerViewId of EnemySpawnMarkerViewOps.listIds(phaserViews)) {
      if (!activeMarkerIds.has(markerViewId)) {
        EnemySpawnMarkerViewOps.remove(phaserViews, markerViewId);
      }
    }
  }

  private syncProjectileViews(
    scene: Phaser.Scene,
    instanceContainer: InstanceContainer,
    phaserViews: PhaserViewContainer,
  ): void {
    const activeProjectileIds = new Set<string>();

    for (const projectile of ProjectileInstanceOps.list(instanceContainer)) {
      activeProjectileIds.add(projectile.id);

      if (!ProjectileViewOps.get(phaserViews, projectile.id)) {
        ProjectileViewOps.add(
          phaserViews,
          createProjectileViewInstance(
            scene,
            projectile.id,
            projectile.position.x,
            projectile.position.y,
            projectile.radius,
          ),
        );
      }

      ProjectileViewOps.setPosition(phaserViews, projectile.id, projectile.position.x, projectile.position.y);
    }

    for (const projectileViewId of ProjectileViewOps.listIds(phaserViews)) {
      if (!activeProjectileIds.has(projectileViewId)) {
        ProjectileViewOps.remove(phaserViews, projectileViewId);
      }
    }
  }
}
