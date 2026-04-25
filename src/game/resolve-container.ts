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

  consumeEvents<TType extends BattleEvent["type"]>(
    type: TType,
  ): Extract<BattleEvent, { type: TType }>[] {
    const matched: Extract<BattleEvent, { type: TType }>[] = [];
    const remaining: BattleEvent[] = [];

    for (const event of this.events) {
      if (event.type === type) {
        matched.push(event as Extract<BattleEvent, { type: TType }>);
      } else {
        remaining.push(event);
      }
    }

    this.events = remaining;
    return matched;
  }

  clear(): void {
    //不要在这里清空intent和event
    //不要在这里清空intent和event
    //允许部分intent和event在下一帧处理
    //所有intent和event清理应该依赖时间消费的时点，而不是统一清理
  }
}
