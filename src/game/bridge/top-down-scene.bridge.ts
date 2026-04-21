import * as Phaser from "phaser";
import { createPlayerState, type PlayerStateType } from "../state/player.state";
import { MovePlayerUseCase } from "../usecase/move-player.usecase";
import { playerRenderQuery } from "../query/player-render.query";
import { PlayerPresenter } from "../presenter/player.presenter";

type TopDownBridgeDeps = {
  playerState: PlayerStateType;
  movePlayerUseCase: MovePlayerUseCase;
  playerPresenter: PlayerPresenter;
};

export class TopDownSceneBridge extends Phaser.Scene {
  private readonly playerState: PlayerStateType;
  private readonly movePlayerUseCase: MovePlayerUseCase;
  private readonly playerPresenter: PlayerPresenter;
  private playerNode!: Phaser.GameObjects.Image;
  private moveKeys!: {
    up: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  constructor(deps: TopDownBridgeDeps) {
    super("top-down-scene");
    this.playerState = deps.playerState;
    this.movePlayerUseCase = deps.movePlayerUseCase;
    this.playerPresenter = deps.playerPresenter;
  }

  public create(): void {
    this.cameras.main.setBackgroundColor("#111111");

    const playerRadius = 16;
    const textureKey = "player-circle";
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(playerRadius, playerRadius, playerRadius);
    graphics.generateTexture(textureKey, playerRadius * 2, playerRadius * 2);
    graphics.destroy();

    this.playerNode = this.add.image(0, 0, textureKey);

    this.moveKeys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as {
      up: Phaser.Input.Keyboard.Key;
      left: Phaser.Input.Keyboard.Key;
      down: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
    };

    this.playerPresenter.syncToScene(this.playerNode, playerRenderQuery(this.playerState));
  }

  public update(_time: number, deltaMs: number): void {
    this.movePlayerUseCase.execute(this.playerState, {
      input: {
        up: this.moveKeys.up.isDown,
        left: this.moveKeys.left.isDown,
        down: this.moveKeys.down.isDown,
        right: this.moveKeys.right.isDown,
      },
      deltaSeconds: deltaMs / 1000,
    });

    this.playerPresenter.syncToScene(this.playerNode, playerRenderQuery(this.playerState));
  }
}

export const createTopDownSceneBridge = (
  width: number,
  height: number,
): TopDownSceneBridge => {
  const playerState = createPlayerState(width / 2, height / 2, 220);
  const movePlayerUseCase = new MovePlayerUseCase();
  const playerPresenter = new PlayerPresenter();

  return new TopDownSceneBridge({
    playerState,
    movePlayerUseCase,
    playerPresenter,
  });
};
