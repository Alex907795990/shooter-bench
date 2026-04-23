import type Phaser from "phaser";
import type { Vec2 } from "../../_Shared/Data/Vec2";

let scene: Phaser.Scene | null = null;
const sprites = new Map<number, Phaser.GameObjects.Arc>();

export function bindProjectileScene(s: Phaser.Scene): void {
  scene = s;
}

export function ensureProjectileSpriteAdapter(id: number, pos: Vec2): void {
  if (!scene) return;
  if (sprites.has(id)) return;
  const c = scene.add.circle(pos.x, pos.y, 4, 0xffee66);
  sprites.set(id, c);
}

export function setProjectilePositionAdapter(id: number, pos: Vec2): void {
  const c = sprites.get(id);
  if (!c) return;
  c.setPosition(pos.x, pos.y);
}

export function destroyProjectileSpriteAdapter(id: number): void {
  const c = sprites.get(id);
  if (!c) return;
  c.destroy();
  sprites.delete(id);
}
