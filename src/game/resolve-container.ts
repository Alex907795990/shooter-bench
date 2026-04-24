import type { BattleEvent } from "./events";
import type { BattleIntent } from "./intents";

export class ResolveContainer {
  private intents: BattleIntent[] = [];
  private events: BattleEvent[] = [];

  addIntent(intent: BattleIntent): void {
    this.intents.push(intent);
  }

  consumeIntents<TType extends BattleIntent["type"]>(
    type: TType,
  ): Extract<BattleIntent, { type: TType }>[] {
    const matched: Extract<BattleIntent, { type: TType }>[] = [];
    const remaining: BattleIntent[] = [];

    for (const intent of this.intents) {
      if (intent.type === type) {
        matched.push(intent as Extract<BattleIntent, { type: TType }>);
      } else {
        remaining.push(intent);
      }
    }

    this.intents = remaining;
    return matched;
  }

  addEvent(event: BattleEvent): void {
    this.events.push(event);
  }

  readEvents<TType extends BattleEvent["type"]>(
    type: TType,
  ): Extract<BattleEvent, { type: TType }>[] {
    return this.events.filter(
      (event): event is Extract<BattleEvent, { type: TType }> => event.type === type,
    );
  }

  clear(): void {
    this.intents = [];
    this.events = [];
  }
}
