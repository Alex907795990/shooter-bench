import type Phaser from "phaser";
import type { Vec2 } from "../../_Shared/Data/Vec2";

let scene: Phaser.Scene | null = null;
const sprites = new Map<number, Phaser.GameObjects.Rectangle>();

export function bindWeaponScene(s: Phaser.Scene): void {
  scene = s;
}

export function ensureWeaponSpriteAdapter(id: number, pos: Vec2): void {
  if (!scene) return;
  if (sprites.has(id)) return;
  const r = scene.add.rectangle(pos.x, pos.y, 10, 10, 0xff9966);
  sprites.set(id, r);
}

export function setWeaponPositionAdapter(id: number, pos: Vec2): void {
  const r = sprites.get(id);
  if (!r) return;
  r.setPosition(pos.x, pos.y);
}

export function destroyWeaponSpriteAdapter(id: number): void {
  const r = sprites.get(id);
  if (!r) return;
  r.destroy();
  sprites.delete(id);
}
