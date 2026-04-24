import type * as Phaser from "phaser";
import { PLAYER_ID } from "../game/data";
import { CameraInstanceOps, PlayerInstanceOps, WorldBoundsOps } from "../game/instance-ops";
import type { InstanceContainer } from "../game/instances";
import type { PhaserViewContainer } from "./phaser-view-instances";
import {
  CameraAnchorViewOps,
  PlayerViewOps,
  WorldViewOps,
  createCameraAnchorViewInstance,
  createPlayerViewInstance,
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
  resolve(instanceContainer: InstanceContainer, phaserViews: PhaserViewContainer): void {
    const player = PlayerInstanceOps.get(instanceContainer, PLAYER_ID);
    const cameraState = CameraInstanceOps.get(instanceContainer, "main");

    if (player) {
      PlayerViewOps.setPosition(phaserViews, player.id, player.position.x, player.position.y);
    }

    if (cameraState) {
      CameraAnchorViewOps.setPosition(phaserViews, cameraState.id, cameraState.position.x, cameraState.position.y);
    }
  }
}
