import type { MovementInputData } from "./data";
import { PLAYER_ID } from "./data";
import type { InstanceContainer } from "./instances";
import { ResolveContainer } from "./resolve-container";
import { CameraFollowSystem, PlayerMovementSystem, type BattleSystem } from "./systems";

export interface BattleFrameInput {
  movement: MovementInputData;
}

export class BattleResolver {
  private readonly resolveContainer = new ResolveContainer();
  private readonly systems: BattleSystem[] = [new PlayerMovementSystem(), new CameraFollowSystem()];

  constructor(private readonly instanceContainer: InstanceContainer) {}

  resolveFrame(input: BattleFrameInput, deltaSeconds: number): void {
    this.resolveContainer.clear();
    this.importExternalSignals(input);

    for (const system of this.systems) {
      system.resolve(this.instanceContainer, this.resolveContainer, deltaSeconds);
    }

    this.resolveContainer.clear();
  }

  private importExternalSignals(input: BattleFrameInput): void {
    if (input.movement.x === 0 && input.movement.y === 0) {
      return;
    }

    this.resolveContainer.addIntent({
      type: "move-player",
      playerId: PLAYER_ID,
      input: input.movement,
    });
  }
}
