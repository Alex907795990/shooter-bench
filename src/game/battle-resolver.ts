import type { MovementInputData } from "./data";
import { PLAYER_ID } from "./data";
import type { InstanceContainer } from "./instances";
import { ResolveContainer } from "./resolve-container";
import {
  BattleRoundTimerSystem,
  CameraFollowSystem,
  DamageSystem,
  EnemyChaseSystem,
  EnemyContactDamageSystem,
  EnemyHitFlashSystem,
  EnemyKillRewardsSystem,
  EnemySpawnMarkerSystem,
  MaterialPickupSystem,
  PlayerMovementSystem,
  PlayerHitFlashSystem,
  ProjectileHitSystem,
  ProjectileMovementSystem,
  WaveSummaryConfirmSystem,
  WaveTelegraphSystem,
  WeaponAimSystem,
  WeaponFireSystem,
  WeaponFollowSystem,
  type BattleSystem,
} from "./systems";

export interface BattleFrameInput {
  movement: MovementInputData;
  confirmWaveSummary: boolean;
}

export class BattleResolver {
  private readonly resolveContainer = new ResolveContainer();
  private readonly systems: BattleSystem[] = [
    new BattleRoundTimerSystem(),
    new WaveSummaryConfirmSystem(),
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
    new EnemyKillRewardsSystem(),
    new MaterialPickupSystem(),
    new EnemyHitFlashSystem(),
    new PlayerHitFlashSystem(),
    new CameraFollowSystem(),
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
    if (input.movement.x !== 0 || input.movement.y !== 0) {
      this.resolveContainer.addIntent({
        type: "move-player",
        playerId: PLAYER_ID,
        input: input.movement,
      });
    }

    if (input.confirmWaveSummary) {
      this.resolveContainer.addIntent({
        type: "confirm-wave-summary",
      });
    }
  }
}
