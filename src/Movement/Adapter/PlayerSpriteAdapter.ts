import type Phaser from "phaser";
import type { Vec2 } from "../../_Shared/Data/Vec2";

let playerSprite: Phaser.GameObjects.Rectangle | null = null;

export function createPlayerSpriteAdapter(
  scene: Phaser.Scene,
  pos: Vec2,
  size: number,
  color: number,
): Phaser.GameObjects.Rectangle {
  playerSprite = scene.add.rectangle(pos.x, pos.y, size, size, color);
  return playerSprite;
}

export function setPlayerPositionAdapter(pos: Vec2): void {
  if (!playerSprite) return;
  playerSprite.setPosition(pos.x, pos.y);
}
