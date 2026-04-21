import type { PlayerStateType } from "../state/player.state";
import type { MovePlayerCommand } from "../type/move-player.command.type";
import { resolveMoveDirectionRule } from "../rule/resolve-move-direction.rule";

export class MovePlayerUseCase {
  public execute(state: PlayerStateType, command: MovePlayerCommand): void {
    const direction = resolveMoveDirectionRule(command.input);
    state.position.x += direction.x * state.speed * command.deltaSeconds;
    state.position.y += direction.y * state.speed * command.deltaSeconds;
  }
}
