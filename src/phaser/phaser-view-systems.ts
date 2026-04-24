import type * as Phaser from "phaser";
import { PLAYER_ID } from "../game/data";
import {
  CameraInstanceOps,
  EnemyInstanceOps,
  PlayerInstanceOps,
  ProjectileInstanceOps,
  WeaponInstanceOps,
  WorldBoundsOps,
} from "../game/instance-ops";
import type { InstanceContainer } from "../game/instances";
import type { PhaserViewContainer } from "./phaser-view-instances";
import {
  CameraAnchorViewOps,
  EnemyViewOps,
  PlayerViewOps,
  ProjectileViewOps,
  WeaponViewOps,
  WorldViewOps,
  createCameraAnchorViewInstance,
  createEnemyViewInstance,
  createPlayerViewInstance,
  createProjectileViewInstance,
  createWeaponViewInstance,
  createWorldViewInstance,
} from "./phaser-view-ops";

export class BattleViewInitializeSystem {
  resolve(scene: Phaser.Scene, instanceContainer: InstanceContainer, phaserViews: PhaserViewContainer): void {
    this.createWorldView(scene, instanceContainer, phaserViews);
    this.createPlayerView(scene, instanceContainer, phaserViews);
    this.createCameraView(scene, instanceContainer, phaserViews);
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
    }

    if (cameraState) {
      CameraAnchorViewOps.setPosition(phaserViews, cameraState.id, cameraState.position.x, cameraState.position.y);
    }

    this.syncWeaponViews(scene, instanceContainer, phaserViews);
    this.syncEnemyViews(scene, instanceContainer, phaserViews);
    this.syncProjectileViews(scene, instanceContainer, phaserViews);
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
    for (const enemy of EnemyInstanceOps.list(instanceContainer)) {
      if (!EnemyViewOps.get(phaserViews, enemy.id)) {
        EnemyViewOps.add(
          phaserViews,
          createEnemyViewInstance(scene, enemy.id, enemy.position.x, enemy.position.y, enemy.radius),
        );
      }

      EnemyViewOps.setPosition(phaserViews, enemy.id, enemy.position.x, enemy.position.y);
      EnemyViewOps.setHitFlash(phaserViews, enemy.id, enemy.hitFlashSeconds > 0);
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

    for (const projectileViewId of [...phaserViews.projectileViews.keys()]) {
      if (!activeProjectileIds.has(projectileViewId)) {
        ProjectileViewOps.remove(phaserViews, projectileViewId);
      }
    }
  }
}
