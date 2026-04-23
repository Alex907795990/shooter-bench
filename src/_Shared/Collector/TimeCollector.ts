import type { TickCommand } from "../Data/TickCommand";

let lastDeltaMs = 0;

export function setTick(deltaMs: number): void {
  lastDeltaMs = deltaMs;
}

export function collectTimeCollector(): TickCommand {
  return { type: "tick", deltaMs: lastDeltaMs };
}
