import { PLAYER_ID, type RectangleData, type Vector2Data } from "./data";
import {
  CameraInstanceOps,
  EnemyInstanceOps,
  EnemySpawnerInstanceOps,
  PlayerInstanceOps,
  ProjectileInstanceOps,
  RandomStateOps,
  WeaponInstanceOps,
  WorldBoundsOps,
} from "./instance-ops";
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
    for (const camera of CameraInstanceOps.list(container)) {
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

export class WeaponFollowSystem implements BattleSystem {
  resolve(container: InstanceContainer): void {
    for (const weapon of WeaponInstanceOps.list(container)) {
      const owner = PlayerInstanceOps.get(container, weapon.ownerId);

      if (!owner) {
        continue;
      }

      const side = weapon.slotIndex % 2 === 0 ? -1 : 1;
      const row = Math.floor(weapon.slotIndex / 2);

      WeaponInstanceOps.setPosition(container, weapon.id, {
        x: owner.position.x + side * (owner.radius + 22),
        y: owner.position.y - 4 + row * 20,
      });
    }
  }
}

export class EnemySpawnSystem implements BattleSystem {
  resolve(container: InstanceContainer, resolveContainer: ResolveContainer, deltaSeconds: number): void {
    const bounds = WorldBoundsOps.get(container);

    for (const spawner of EnemySpawnerInstanceOps.list(container)) {
      let elapsedSeconds = spawner.elapsedSeconds + deltaSeconds;

      while (elapsedSeconds >= spawner.spawnIntervalSeconds) {
        elapsedSeconds -= spawner.spawnIntervalSeconds;

        const enemy = {
          id: EnemyInstanceOps.nextId(container),
          position: randomSpawnPosition(container, bounds),
          radius: 18,
          health: { current: 3, max: 3 },
          moveSpeed: 120,
          contactDamage: 1,
          contactDamageCooldownSeconds: 0.7,
          contactDamageElapsedSeconds: 0.7,
          hitFlashSeconds: 0,
        };

        EnemyInstanceOps.add(container, enemy);
        resolveContainer.addEvent({
          type: "enemy-spawned",
          enemyId: enemy.id,
          position: { ...enemy.position },
        });
      }

      EnemySpawnerInstanceOps.setElapsed(container, spawner.id, elapsedSeconds);
    }
  }
}

export class EnemyChaseSystem implements BattleSystem {
  resolve(container: InstanceContainer, _resolveContainer: ResolveContainer, deltaSeconds: number): void {
    const player = PlayerInstanceOps.get(container, PLAYER_ID);

    if (!player) {
      return;
    }

    const bounds = WorldBoundsOps.get(container);

    for (const enemy of EnemyInstanceOps.list(container)) {
      const direction = normalizeInput({
        x: player.position.x - enemy.position.x,
        y: player.position.y - enemy.position.y,
      });
      const targetPosition = {
        x: enemy.position.x + direction.x * enemy.moveSpeed * deltaSeconds,
        y: enemy.position.y + direction.y * enemy.moveSpeed * deltaSeconds,
      };

      EnemyInstanceOps.setPosition(container, enemy.id, clampCircleToBounds(targetPosition, enemy.radius, bounds));
    }
  }
}

export class WeaponAimSystem implements BattleSystem {
  resolve(container: InstanceContainer): void {
    const enemies = EnemyInstanceOps.list(container);

    for (const weapon of WeaponInstanceOps.list(container)) {
      const target = findNearestEnemyInRange(weapon.position, enemies, weapon.attackRange);

      if (!target) {
        continue;
      }

      WeaponInstanceOps.setFacing(
        container,
        weapon.id,
        Math.atan2(target.position.y - weapon.position.y, target.position.x - weapon.position.x),
      );
    }
  }
}

export class WeaponFireSystem implements BattleSystem {
  resolve(container: InstanceContainer, resolveContainer: ResolveContainer, deltaSeconds: number): void {
    const enemies = EnemyInstanceOps.list(container);

    for (const weapon of WeaponInstanceOps.list(container)) {
      const cooldownSeconds = Math.max(0, weapon.cooldownSeconds - deltaSeconds);
      const target = findNearestEnemyInRange(weapon.position, enemies, weapon.attackRange);

      if (!target || cooldownSeconds > 0) {
        WeaponInstanceOps.setCooldown(container, weapon.id, cooldownSeconds);
        continue;
      }

      const direction = normalizeInput({
        x: target.position.x - weapon.position.x,
        y: target.position.y - weapon.position.y,
      });
      const projectileId = ProjectileInstanceOps.nextId(container);

      ProjectileInstanceOps.add(container, {
        id: projectileId,
        ownerWeaponId: weapon.id,
        position: { ...weapon.position },
        velocity: {
          x: direction.x * weapon.projectileSpeed,
          y: direction.y * weapon.projectileSpeed,
        },
        radius: weapon.projectileRadius,
        damage: weapon.projectileDamage,
      });
      WeaponInstanceOps.setCooldown(container, weapon.id, weapon.fireIntervalSeconds);
      resolveContainer.addEvent({
        type: "weapon-fired",
        weaponId: weapon.id,
        projectileId,
        targetEnemyId: target.id,
      });
    }
  }
}

export class ProjectileMovementSystem implements BattleSystem {
  resolve(container: InstanceContainer, _resolveContainer: ResolveContainer, deltaSeconds: number): void {
    const bounds = WorldBoundsOps.get(container);

    for (const projectile of ProjectileInstanceOps.list(container)) {
      const position = {
        x: projectile.position.x + projectile.velocity.x * deltaSeconds,
        y: projectile.position.y + projectile.velocity.y * deltaSeconds,
      };

      if (isCircleOutsideBounds(position, projectile.radius, bounds)) {
        ProjectileInstanceOps.remove(container, projectile.id);
      } else {
        ProjectileInstanceOps.setPosition(container, projectile.id, position);
      }
    }
  }
}

export class ProjectileHitSystem implements BattleSystem {
  resolve(container: InstanceContainer, resolveContainer: ResolveContainer): void {
    const enemies = EnemyInstanceOps.list(container);
    const hitProjectileIds = new Set<string>();

    for (const projectile of ProjectileInstanceOps.list(container)) {
      if (hitProjectileIds.has(projectile.id)) {
        continue;
      }

      for (const enemy of enemies) {
        if (!areCirclesOverlapping(projectile.position, projectile.radius, enemy.position, enemy.radius)) {
          continue;
        }

        hitProjectileIds.add(projectile.id);
        ProjectileInstanceOps.remove(container, projectile.id);
        resolveContainer.addIntent({
          type: "apply-damage",
          sourceId: projectile.id,
          targetKind: "enemy",
          targetId: enemy.id,
          amount: projectile.damage,
        });
        resolveContainer.addEvent({
          type: "projectile-hit-enemy",
          projectileId: projectile.id,
          enemyId: enemy.id,
          position: { ...enemy.position },
        });
        break;
      }
    }
  }
}

export class EnemyContactDamageSystem implements BattleSystem {
  resolve(container: InstanceContainer, resolveContainer: ResolveContainer, deltaSeconds: number): void {
    const players = PlayerInstanceOps.list(container);

    for (const enemy of EnemyInstanceOps.list(container)) {
      const elapsedSeconds = enemy.contactDamageElapsedSeconds + deltaSeconds;
      let nextElapsedSeconds = elapsedSeconds;

      for (const player of players) {
        if (!areCirclesOverlapping(enemy.position, enemy.radius, player.position, player.radius)) {
          continue;
        }

        if (elapsedSeconds < enemy.contactDamageCooldownSeconds) {
          continue;
        }

        nextElapsedSeconds = 0;
        resolveContainer.addIntent({
          type: "apply-damage",
          sourceId: enemy.id,
          targetKind: "player",
          targetId: player.id,
          amount: enemy.contactDamage,
        });
        break;
      }

      EnemyInstanceOps.setContactDamageElapsed(container, enemy.id, nextElapsedSeconds);
    }
  }
}

export class DamageSystem implements BattleSystem {
  resolve(container: InstanceContainer, resolveContainer: ResolveContainer): void {
    for (const intent of resolveContainer.consumeIntents("apply-damage")) {
      if (intent.amount <= 0) {
        continue;
      }

      if (intent.targetKind === "enemy") {
        this.applyEnemyDamage(container, resolveContainer, intent.targetId, intent.sourceId, intent.amount);
      } else {
        this.applyPlayerDamage(container, resolveContainer, intent.targetId, intent.sourceId, intent.amount);
      }
    }
  }

  private applyEnemyDamage(
    container: InstanceContainer,
    resolveContainer: ResolveContainer,
    enemyId: string,
    sourceId: string,
    amount: number,
  ): void {
    const enemy = EnemyInstanceOps.get(container, enemyId);

    if (!enemy) {
      return;
    }

    const healthRemaining = Math.max(0, enemy.health.current - amount);
    EnemyInstanceOps.setHealth(container, enemy.id, healthRemaining);
    EnemyInstanceOps.setHitFlash(container, enemy.id, 0.18);
    resolveContainer.addEvent({
      type: "enemy-damaged",
      enemyId: enemy.id,
      sourceId,
      damage: amount,
      healthRemaining,
    });

    if (healthRemaining > 0) {
      return;
    }

    EnemyInstanceOps.remove(container, enemy.id);
    resolveContainer.addEvent({
      type: "enemy-died",
      enemyId: enemy.id,
      sourceId,
    });
  }

  private applyPlayerDamage(
    container: InstanceContainer,
    resolveContainer: ResolveContainer,
    playerId: string,
    sourceId: string,
    amount: number,
  ): void {
    const player = PlayerInstanceOps.get(container, playerId);

    if (!player) {
      return;
    }

    const healthRemaining = Math.max(0, player.health.current - amount);
    PlayerInstanceOps.setHealth(container, player.id, healthRemaining);
    PlayerInstanceOps.setHitFlash(container, player.id, 0.16);
    resolveContainer.addEvent({
      type: "player-damaged",
      playerId: player.id,
      sourceId,
      damage: amount,
      healthRemaining,
    });
  }
}

export class EnemyHitFlashSystem implements BattleSystem {
  resolve(container: InstanceContainer, _resolveContainer: ResolveContainer, deltaSeconds: number): void {
    for (const enemy of EnemyInstanceOps.list(container)) {
      if (enemy.hitFlashSeconds <= 0) {
        continue;
      }

      EnemyInstanceOps.setHitFlash(container, enemy.id, Math.max(0, enemy.hitFlashSeconds - deltaSeconds));
    }
  }
}

export class PlayerHitFlashSystem implements BattleSystem {
  resolve(container: InstanceContainer, _resolveContainer: ResolveContainer, deltaSeconds: number): void {
    for (const player of PlayerInstanceOps.list(container)) {
      if (player.hitFlashSeconds <= 0) {
        continue;
      }

      PlayerInstanceOps.setHitFlash(container, player.id, Math.max(0, player.hitFlashSeconds - deltaSeconds));
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

function randomSpawnPosition(container: InstanceContainer, bounds: RectangleData): Vector2Data {
  const side = Math.floor(RandomStateOps.next(container) * 4);
  const padding = 48;

  if (side === 0) {
    return {
      x: bounds.x + RandomStateOps.next(container) * bounds.width,
      y: bounds.y + padding,
    };
  }

  if (side === 1) {
    return {
      x: bounds.x + bounds.width - padding,
      y: bounds.y + RandomStateOps.next(container) * bounds.height,
    };
  }

  if (side === 2) {
    return {
      x: bounds.x + RandomStateOps.next(container) * bounds.width,
      y: bounds.y + bounds.height - padding,
    };
  }

  return {
    x: bounds.x + padding,
    y: bounds.y + RandomStateOps.next(container) * bounds.height,
  };
}

function findNearestEnemyInRange(
  position: Vector2Data,
  enemies: { id: string; position: Vector2Data }[],
  range: number,
) {
  let nearest: { id: string; position: Vector2Data } | undefined;
  let nearestDistanceSquared = range * range;

  for (const enemy of enemies) {
    const dx = enemy.position.x - position.x;
    const dy = enemy.position.y - position.y;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared <= nearestDistanceSquared) {
      nearest = enemy;
      nearestDistanceSquared = distanceSquared;
    }
  }

  return nearest;
}

function isCircleOutsideBounds(position: Vector2Data, radius: number, bounds: RectangleData): boolean {
  return (
    position.x + radius < bounds.x ||
    position.x - radius > bounds.x + bounds.width ||
    position.y + radius < bounds.y ||
    position.y - radius > bounds.y + bounds.height
  );
}

function areCirclesOverlapping(
  firstPosition: Vector2Data,
  firstRadius: number,
  secondPosition: Vector2Data,
  secondRadius: number,
): boolean {
  const dx = firstPosition.x - secondPosition.x;
  const dy = firstPosition.y - secondPosition.y;
  const radius = firstRadius + secondRadius;

  return dx * dx + dy * dy <= radius * radius;
}
