import type * as Phaser from "phaser";
import type {
  CameraAnchorViewInstance,
  PhaserViewContainer,
  PlayerViewInstance,
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
