import * as Phaser from "phaser";
import { BattleResolver } from "../game/battle-resolver";
import type { MovementInputData } from "../game/data";
import { createBattleInstanceContainer, type InstanceContainer } from "../game/instances";
import { createPhaserViewContainer, type PhaserViewContainer } from "../phaser/phaser-view-instances";
import { BattleViewInitializeSystem, BattleViewSyncSystem } from "../phaser/phaser-view-systems";

interface WasdKeys {
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
}

export class BattleScene extends Phaser.Scene {
  private instanceContainer!: InstanceContainer;
  private phaserViews!: PhaserViewContainer;
  private resolver!: BattleResolver;
  private viewInitializeSystem = new BattleViewInitializeSystem();
  private viewSyncSystem = new BattleViewSyncSystem();
  private keys!: WasdKeys;

  constructor() {
    super("battle");
  }

  create(): void {
    this.instanceContainer = createBattleInstanceContainer();
    this.phaserViews = createPhaserViewContainer();
    this.resolver = new BattleResolver(this.instanceContainer);
    this.keys = this.createWasdKeys();

    this.viewInitializeSystem.resolve(this, this.instanceContainer, this.phaserViews);
  }

  update(_time: number, delta: number): void {
    this.resolver.resolveFrame(
      {
        movement: this.readMovementInput(),
      },
      delta / 1000,
    );

    this.viewSyncSystem.resolve(this, this.instanceContainer, this.phaserViews);
  }

  private createWasdKeys(): WasdKeys {
    if (!this.input.keyboard) {
      throw new Error("Keyboard input is not available.");
    }

    return {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  private readMovementInput(): MovementInputData {
    return {
      x: Number(this.keys.d.isDown) - Number(this.keys.a.isDown),
      y: Number(this.keys.s.isDown) - Number(this.keys.w.isDown),
    };
  }
}
