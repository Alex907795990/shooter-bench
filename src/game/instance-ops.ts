import type { RectangleData, Vector2Data } from "./data";
import type { CameraInstance, InstanceContainer, PlayerInstance } from "./instances";

export class PlayerInstanceOps {
  static get(container: InstanceContainer, playerId: string): PlayerInstance | undefined {
    return container.players.get(playerId);
  }

  static setPosition(container: InstanceContainer, playerId: string, position: Vector2Data): void {
    const player = container.players.get(playerId);

    if (!player) {
      return;
    }

    player.position = position;
  }
}

export class CameraInstanceOps {
  static get(container: InstanceContainer, cameraId: string): CameraInstance | undefined {
    return container.cameras.get(cameraId);
  }

  static setPosition(container: InstanceContainer, cameraId: string, position: Vector2Data): void {
    const camera = container.cameras.get(cameraId);

    if (!camera) {
      return;
    }

    camera.position = position;
  }
}

export class WorldBoundsOps {
  static get(container: InstanceContainer): RectangleData {
    return container.worldBounds;
  }
}
