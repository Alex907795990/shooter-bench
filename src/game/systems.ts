import type { RectangleData, Vector2Data } from "./data";
import { CameraInstanceOps, PlayerInstanceOps, WorldBoundsOps } from "./instance-ops";
import type { InstanceContainer } from "./instances";
import type { ResolveContainer } from "./resolve-container";

export interface BattleSystem {
  resolve(container: InstanceContainer, resolveContainer: ResolveContainer, deltaSeconds: number): void;
}

export class PlayerMovementSystem implements BattleSystem {
  resolve(container: InstanceContainer, resolveContainer: ResolveContainer, deltaSeconds: number): void {
    const moveIntents = resolveContainer.consumeIntents("move-player");
    const bounds = WorldBoundsOps.get(container);

    for (const intent of moveIntents) {
      const player = PlayerInstanceOps.get(container, intent.playerId);

      if (!player) {
        continue;
      }

      const direction = normalizeInput(intent.input);
      const fromPosition = { ...player.position };
      const targetPosition = {
        x: player.position.x + direction.x * player.moveSpeed * deltaSeconds,
        y: player.position.y + direction.y * player.moveSpeed * deltaSeconds,
      };
      const toPosition = clampCircleToBounds(targetPosition, player.radius, bounds);

      PlayerInstanceOps.setPosition(container, player.id, toPosition);

      if (fromPosition.x !== toPosition.x || fromPosition.y !== toPosition.y) {
        resolveContainer.addEvent({
          type: "player-moved",
          playerId: player.id,
          fromPosition,
          toPosition,
        });
      }
    }
  }
}

export class CameraFollowSystem implements BattleSystem {
  resolve(container: InstanceContainer, resolveContainer: ResolveContainer): void {
    for (const camera of container.cameras.values()) {
      const target = PlayerInstanceOps.get(container, camera.targetId);

      if (!target) {
        continue;
      }

      const position = { ...target.position };
      CameraInstanceOps.setPosition(container, camera.id, position);
      resolveContainer.addEvent({
        type: "camera-moved",
        cameraId: camera.id,
        targetId: target.id,
        position,
      });
    }
  }
}

function normalizeInput(input: Vector2Data): Vector2Data {
  const length = Math.hypot(input.x, input.y);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: input.x / length,
    y: input.y / length,
  };
}

function clampCircleToBounds(position: Vector2Data, radius: number, bounds: RectangleData): Vector2Data {
  return {
    x: clamp(position.x, bounds.x + radius, bounds.x + bounds.width - radius),
    y: clamp(position.y, bounds.y + radius, bounds.y + bounds.height - radius),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
