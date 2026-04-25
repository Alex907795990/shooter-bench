import type { MovementInputData } from "./data";
import { PLAYER_ID } from "./data";
import type { InstanceContainer } from "./instances";
import { ResolveContainer } from "./resolve-container";
import {
  BattleRoundTimerSystem,
  BattleRoundTransitionSystem,
  CameraFollowSystem,
  DamageSystem,
  EnemyChaseSystem,
  EnemyContactDamageSystem,
  EnemyHitFlashSystem,
  EnemySpawnMarkerSystem,
  PlayerMovementSystem,
  PlayerHitFlashSystem,
  ProjectileHitSystem,
  ProjectileMovementSystem,
  WaveTelegraphSystem,
  WeaponAimSystem,
  WeaponFireSystem,
  WeaponFollowSystem,
  type BattleSystem,
} from "./systems";

export interface BattleFrameInput {
  movement: MovementInputData;
}

export class BattleResolver {
  private readonly resolveContainer = new ResolveContainer();
  private readonly systems: BattleSystem[] = [
    new BattleRoundTimerSystem(),
    new PlayerMovementSystem(),
    new WeaponFollowSystem(),
    new EnemySpawnMarkerSystem(),
    new WaveTelegraphSystem(),
    new EnemyChaseSystem(),
    new WeaponAimSystem(),
    new WeaponFireSystem(),
    new ProjectileMovementSystem(),
    new ProjectileHitSystem(),
    new EnemyContactDamageSystem(),
    new DamageSystem(),
    new EnemyHitFlashSystem(),
    new PlayerHitFlashSystem(),
    new CameraFollowSystem(),
    new BattleRoundTransitionSystem(),
  ];

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
