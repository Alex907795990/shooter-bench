import type Phaser from "phaser";
import type { InputCommand } from "../Data/InputCommand";

let keyboard: Phaser.Input.Keyboard.KeyboardPlugin | null = null;

export function bindInputSource(kb: Phaser.Input.Keyboard.KeyboardPlugin): void {
  keyboard = kb;
}

export function collectInputCollector(): readonly InputCommand[] {
  if (!keyboard) return [];
  let dx = 0;
  let dy = 0;
  if (keyboard.addKey("A").isDown) dx -= 1;
  if (keyboard.addKey("D").isDown) dx += 1;
  if (keyboard.addKey("W").isDown) dy -= 1;
  if (keyboard.addKey("S").isDown) dy += 1;
  if (dx === 0 && dy === 0) return [];
  const len = Math.hypot(dx, dy);
  return [{ type: "moveInput", dir: { x: dx / len, y: dy / len } }];
}
