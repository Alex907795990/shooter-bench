import type { World } from "./Data/World";
import { createWorldPure } from "./Pure/WorldInitPure";

export function startupPipeline(arenaWidth: number, arenaHeight: number): World {
  return createWorldPure(arenaWidth, arenaHeight);
}
