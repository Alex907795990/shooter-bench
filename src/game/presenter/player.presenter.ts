import type * as Phaser from "phaser";
import type { Vector2Type } from "../type/vector2.type";

export class PlayerPresenter {
  public syncToScene(node: Phaser.GameObjects.Image, model: Vector2Type): void {
    node.setPosition(model.x, model.y);
  }
}
