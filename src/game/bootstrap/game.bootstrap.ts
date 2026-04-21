import * as Phaser from "phaser";
import { createTopDownSceneBridge } from "../bridge/top-down-scene.bridge";

export const bootstrapGame = (): Phaser.Game => {
  const width = 800;
  const height = 600;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "game",
    width,
    height,
    backgroundColor: "#111111",
    scene: [createTopDownSceneBridge(width, height)],
  };

  return new Phaser.Game(config);
};
