import type Phaser from "phaser";

export function drawArenaBoundsAdapter(
  scene: Phaser.Scene,
  width: number,
  height: number,
  color: number,
): void {
  const g = scene.add.graphics();
  g.lineStyle(4, color, 1);
  g.strokeRect(0, 0, width, height);

  const grid = scene.add.graphics();
  grid.lineStyle(1, color, 0.15);
  const step = 100;
  for (let x = step; x < width; x += step) {
    grid.lineBetween(x, 0, x, height);
  }
  for (let y = step; y < height; y += step) {
    grid.lineBetween(0, y, width, y);
  }
}
