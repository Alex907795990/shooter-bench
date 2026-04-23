import type Phaser from "phaser";
import type { Vec2 } from "../../_Shared/Data/Vec2";

let scene: Phaser.Scene | null = null;
const sprites = new Map<number, Phaser.GameObjects.Arc>();

export function bindSpawnMarkerScene(s: Phaser.Scene): void {
  scene = s;
}

export function ensureSpawnMarkerSpriteAdapter(id: number, pos: Vec2): void {
  if (!scene) return;
  if (sprites.has(id)) return;
  const c = scene.add.circle(pos.x, pos.y, 12, 0xff3333, 0.4);
  c.setStrokeStyle(2, 0xff3333, 0.9);
  sprites.set(id, c);
}

export function destroySpawnMarkerSpriteAdapter(id: number): void {
  const c = sprites.get(id);
  if (!c) return;
  c.destroy();
  sprites.delete(id);
}
