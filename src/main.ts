import * as Phaser from "phaser";
import { BattleScene } from "./scenes/battle-scene";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  height: 600,
  backgroundColor: "#111111",
  scene: [BattleScene],
});
