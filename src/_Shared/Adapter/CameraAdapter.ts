import type Phaser from "phaser";

export function setCameraBoundsAdapter(
  scene: Phaser.Scene,
  width: number,
  height: number,
): void {
  scene.cameras.main.setBounds(0, 0, width, height);
}

export function startCameraFollowAdapter(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  lerpX: number,
  lerpY: number,
): void {
  scene.cameras.main.startFollow(target, true, lerpX, lerpY);
}
