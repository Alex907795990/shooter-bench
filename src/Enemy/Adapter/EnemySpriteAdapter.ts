import type Phaser from "phaser";
import type { Vec2 } from "../../_Shared/Data/Vec2";

let scene: Phaser.Scene | null = null;
const sprites = new Map<number, Phaser.GameObjects.Rectangle>();

export function bindEnemyScene(s: Phaser.Scene): void {
  scene = s;
}

export function ensureEnemySpriteAdapter(id: number, pos: Vec2): void {
  if (!scene) return;
  if (sprites.has(id)) return;
  const r = scene.add.rectangle(pos.x, pos.y, 22, 22, 0xff5566);
  sprites.set(id, r);
}

export function setEnemyPositionAdapter(id: number, pos: Vec2): void {
  const r = sprites.get(id);
  if (!r) return;
  r.setPosition(pos.x, pos.y);
}

export function destroyEnemySpriteAdapter(id: number): void {
  const r = sprites.get(id);
  if (!r) return;
  r.destroy();
  sprites.delete(id);
}
