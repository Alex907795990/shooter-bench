import type * as Phaser from "phaser";
import type {
  CameraAnchorViewInstance,
  EnemyViewInstance,
  PhaserViewContainer,
  PlayerViewInstance,
  ProjectileViewInstance,
  WeaponViewInstance,
  WorldViewInstance,
} from "./phaser-view-instances";

export class PlayerViewOps {
  static add(container: PhaserViewContainer, view: PlayerViewInstance): void {
    container.playerViews.set(view.id, view);
  }

  static get(container: PhaserViewContainer, id: string): PlayerViewInstance | undefined {
    return container.playerViews.get(id);
  }

  static setPosition(container: PhaserViewContainer, id: string, x: number, y: number): void {
    const view = container.playerViews.get(id);

    if (!view) {
      return;
    }

    view.object.setPosition(x, y);
  }

  static setHitFlash(container: PhaserViewContainer, id: string, isFlashing: boolean): void {
    const view = container.playerViews.get(id);

    if (!view) {
      return;
    }

    view.object.setFillStyle(isFlashing ? 0xffffff : 0x9ad66f);
    view.object.setStrokeStyle(4, isFlashing ? 0xff5f5f : 0xeaffc8);
  }
}

export class CameraAnchorViewOps {
  static add(container: PhaserViewContainer, view: CameraAnchorViewInstance): void {
    container.cameraAnchorViews.set(view.id, view);
  }

  static get(container: PhaserViewContainer, id: string): CameraAnchorViewInstance | undefined {
    return container.cameraAnchorViews.get(id);
  }

  static setPosition(container: PhaserViewContainer, id: string, x: number, y: number): void {
    const view = container.cameraAnchorViews.get(id);

    if (!view) {
      return;
    }

    view.object.setPosition(x, y);
  }
}

export class WorldViewOps {
  static add(container: PhaserViewContainer, view: WorldViewInstance): void {
    container.worldViews.set(view.id, view);
  }

  static get(container: PhaserViewContainer, id: string): WorldViewInstance | undefined {
    return container.worldViews.get(id);
  }
}

export class WeaponViewOps {
  static add(container: PhaserViewContainer, view: WeaponViewInstance): void {
    container.weaponViews.set(view.id, view);
  }

  static get(container: PhaserViewContainer, id: string): WeaponViewInstance | undefined {
    return container.weaponViews.get(id);
  }

  static setPosition(container: PhaserViewContainer, id: string, x: number, y: number): void {
    const view = container.weaponViews.get(id);

    if (!view) {
      return;
    }

    view.object.setPosition(x, y);
  }

  static setRotation(container: PhaserViewContainer, id: string, rotationRadians: number): void {
    const view = container.weaponViews.get(id);

    if (!view) {
      return;
    }

    view.object.setRotation(rotationRadians);
  }
}

export class ProjectileViewOps {
  static add(container: PhaserViewContainer, view: ProjectileViewInstance): void {
    container.projectileViews.set(view.id, view);
  }

  static get(container: PhaserViewContainer, id: string): ProjectileViewInstance | undefined {
    return container.projectileViews.get(id);
  }

  static listIds(container: PhaserViewContainer): string[] {
    return [...container.projectileViews.keys()];
  }

  static setPosition(container: PhaserViewContainer, id: string, x: number, y: number): void {
    const view = container.projectileViews.get(id);

    if (!view) {
      return;
    }

    view.object.setPosition(x, y);
  }

  static remove(container: PhaserViewContainer, id: string): void {
    const view = container.projectileViews.get(id);

    if (!view) {
      return;
    }

    view.object.destroy();
    container.projectileViews.delete(id);
  }
}

export class EnemyViewOps {
  static add(container: PhaserViewContainer, view: EnemyViewInstance): void {
    container.enemyViews.set(view.id, view);
  }

  static get(container: PhaserViewContainer, id: string): EnemyViewInstance | undefined {
    return container.enemyViews.get(id);
  }

  static listIds(container: PhaserViewContainer): string[] {
    return [...container.enemyViews.keys()];
  }

  static setPosition(container: PhaserViewContainer, id: string, x: number, y: number): void {
    const view = container.enemyViews.get(id);

    if (!view) {
      return;
    }

    view.object.setPosition(x, y);
  }

  static setHitFlash(container: PhaserViewContainer, id: string, isFlashing: boolean): void {
    const view = container.enemyViews.get(id);

    if (!view) {
      return;
    }

    view.object.setFillStyle(isFlashing ? 0xffffff : 0xd65b5b);
    view.object.setStrokeStyle(3, isFlashing ? 0xffe36a : 0x4a1616);
  }

  static remove(container: PhaserViewContainer, id: string): void {
    const view = container.enemyViews.get(id);

    if (!view) {
      return;
    }

    view.object.destroy();
    container.enemyViews.delete(id);
  }
}

export function createPlayerViewInstance(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
  radius: number,
): PlayerViewInstance {
  const object = scene.add.circle(x, y, radius, 0x9ad66f);
  object.setStrokeStyle(4, 0xeaffc8);
  object.setDepth(10);

  return { id, object };
}

export function createCameraAnchorViewInstance(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
): CameraAnchorViewInstance {
  return {
    id,
    object: scene.add.zone(x, y, 1, 1),
  };
}

export function createWorldViewInstance(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
): WorldViewInstance {
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const ground = scene.add.rectangle(centerX, centerY, width, height, 0x1b1f24);
  const grid = scene.add.grid(centerX, centerY, width, height, 80, 80, 0x1b1f24, 0, 0x2f3a42, 0.45);
  grid.setDepth(1);

  const border = scene.add.rectangle(centerX, centerY, width, height);
  border.setStrokeStyle(4, 0x8a9ba8);
  border.setDepth(2);

  return {
    id,
    ground,
    grid,
    border,
  };
}

export function createWeaponViewInstance(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
): WeaponViewInstance {
  const object = scene.add.rectangle(x, y, 34, 12, 0xf0b35a);
  object.setStrokeStyle(2, 0x4a2b14);
  object.setDepth(12);

  return { id, object };
}

export function createProjectileViewInstance(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
  radius: number,
): ProjectileViewInstance {
  const object = scene.add.circle(x, y, radius, 0xfff06a);
  object.setStrokeStyle(2, 0x5c4a00);
  object.setDepth(11);

  return { id, object };
}

export function createEnemyViewInstance(
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
  radius: number,
): EnemyViewInstance {
  const object = scene.add.circle(x, y, radius, 0xd65b5b);
  object.setStrokeStyle(3, 0x4a1616);
  object.setDepth(9);

  return { id, object };
}
