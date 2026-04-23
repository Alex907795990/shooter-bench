import * as Phaser from "phaser";

class BlankScene extends Phaser.Scene {
  constructor() {
    super("blank");
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  height: 600,
  backgroundColor: "#111111",
  scene: [BlankScene],
});
