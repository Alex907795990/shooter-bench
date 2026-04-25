import type { RectangleData, Vector2Data } from "./data";
import type {
  CameraInstance,
  EnemyInstance,
  EnemySpawnerInstance,
  InstanceContainer,
  PlayerInstance,
  ProjectileInstance,
  WeaponInstance,
} from "./instances";

export class PlayerInstanceOps {
  static list(container: InstanceContainer): PlayerInstance[] {
    return [...container.players.values()];
  }

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

  static setHealth(container: InstanceContainer, playerId: string, current: number): void {
    const player = container.players.get(playerId);

    if (!player) {
      return;
    }

    player.health = {
      ...player.health,
      current: Math.max(0, Math.min(current, player.health.max)),
    };
  }

  static setHitFlash(container: InstanceContainer, playerId: string, hitFlashSeconds: number): void {
    const player = container.players.get(playerId);

    if (!player) {
      return;
    }

    player.hitFlashSeconds = hitFlashSeconds;
  }
}

export class CameraInstanceOps {
  static list(container: InstanceContainer): CameraInstance[] {
    return [...container.cameras.values()];
  }

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

export class WeaponInstanceOps {
  static list(container: InstanceContainer): WeaponInstance[] {
    return [...container.weapons.values()];
  }

  static setPosition(container: InstanceContainer, weaponId: string, position: Vector2Data): void {
    const weapon = container.weapons.get(weaponId);

    if (!weapon) {
      return;
    }

    weapon.position = position;
  }

  static setFacing(container: InstanceContainer, weaponId: string, facingRadians: number): void {
    const weapon = container.weapons.get(weaponId);

    if (!weapon) {
      return;
    }

    weapon.facingRadians = facingRadians;
  }

  static setCooldown(container: InstanceContainer, weaponId: string, cooldownSeconds: number): void {
    const weapon = container.weapons.get(weaponId);

    if (!weapon) {
      return;
    }

    weapon.cooldownSeconds = cooldownSeconds;
  }
}

export class ProjectileInstanceOps {
  static list(container: InstanceContainer): ProjectileInstance[] {
    return [...container.projectiles.values()];
  }

  static add(container: InstanceContainer, projectile: ProjectileInstance): void {
    container.projectiles.set(projectile.id, projectile);
  }

  static setPosition(container: InstanceContainer, projectileId: string, position: Vector2Data): void {
    const projectile = container.projectiles.get(projectileId);

    if (!projectile) {
      return;
    }

    projectile.position = position;
  }

  static remove(container: InstanceContainer, projectileId: string): void {
    container.projectiles.delete(projectileId);
  }

  static nextId(container: InstanceContainer): string {
    const id = `projectile-${container.nextProjectileIndex}`;
    container.nextProjectileIndex += 1;
    return id;
  }
}

export class EnemyInstanceOps {
  static list(container: InstanceContainer): EnemyInstance[] {
    return [...container.enemies.values()];
  }

  static get(container: InstanceContainer, enemyId: string): EnemyInstance | undefined {
    return container.enemies.get(enemyId);
  }

  static add(container: InstanceContainer, enemy: EnemyInstance): void {
    container.enemies.set(enemy.id, enemy);
  }

  static remove(container: InstanceContainer, enemyId: string): void {
    container.enemies.delete(enemyId);
  }

  static setPosition(container: InstanceContainer, enemyId: string, position: Vector2Data): void {
    const enemy = container.enemies.get(enemyId);

    if (!enemy) {
      return;
    }

    enemy.position = position;
  }

  static setHealth(container: InstanceContainer, enemyId: string, current: number): void {
    const enemy = container.enemies.get(enemyId);

    if (!enemy) {
      return;
    }

    enemy.health = {
      ...enemy.health,
      current: Math.max(0, Math.min(current, enemy.health.max)),
    };
  }

  static nextId(container: InstanceContainer): string {
    const id = `enemy-${container.nextEnemyIndex}`;
    container.nextEnemyIndex += 1;
    return id;
  }

  static setHitFlash(container: InstanceContainer, enemyId: string, hitFlashSeconds: number): void {
    const enemy = container.enemies.get(enemyId);

    if (!enemy) {
      return;
    }

    enemy.hitFlashSeconds = hitFlashSeconds;
  }

  static setContactDamageElapsed(container: InstanceContainer, enemyId: string, elapsedSeconds: number): void {
    const enemy = container.enemies.get(enemyId);

    if (!enemy) {
      return;
    }

    enemy.contactDamageElapsedSeconds = elapsedSeconds;
  }
}

export class EnemySpawnerInstanceOps {
  static list(container: InstanceContainer): EnemySpawnerInstance[] {
    return [...container.enemySpawners.values()];
  }

  static setElapsed(container: InstanceContainer, spawnerId: string, elapsedSeconds: number): void {
    const spawner = container.enemySpawners.get(spawnerId);

    if (!spawner) {
      return;
    }

    spawner.elapsedSeconds = elapsedSeconds;
  }
}

export class RandomStateOps {
  static next(container: InstanceContainer): number {
    container.randomState.seed = (container.randomState.seed * 1664525 + 1013904223) >>> 0;
    return container.randomState.seed / 4294967296;
  }
}
