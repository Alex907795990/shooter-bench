import type { World } from "../../_Frame/Data/World";
import type { EnemyEvent } from "../Data/EnemyEvents";

export function applyEnemyApplier(world: World, events: readonly EnemyEvent[]): void {
  const state = world.enemy;
  for (const e of events) {
    switch (e.type) {
      case "enemyMoved": {
        const t = state.list.find((x) => x.id === e.id);
        if (!t) break;
        t.pos = e.pos;
        break;
      }
      case "enemyDied": {
        const idx = state.list.findIndex((x) => x.id === e.id);
        if (idx < 0) break;
        state.list.splice(idx, 1);
        break;
      }
      case "enemySpawnCooldownTicked": {
        state.spawnCooldownMs = e.cooldownMs;
        break;
      }
      case "enemySpawnMarkerCreated": {
        state.pendingSpawns.push({ id: e.id, pos: e.pos, remainMs: e.remainMs });
        state.nextMarkerId = e.id + 1;
        break;
      }
      case "enemySpawnMarkerTicked": {
        const m = state.pendingSpawns.find((x) => x.id === e.id);
        if (!m) break;
        m.remainMs = e.remainMs;
        break;
      }
      case "enemySpawnMarkerExpired": {
        const idx = state.pendingSpawns.findIndex((x) => x.id === e.id);
        if (idx < 0) break;
        state.pendingSpawns.splice(idx, 1);
        break;
      }
      case "enemySpawned": {
        state.list.push({ id: e.enemyId, pos: e.pos, speed: e.speed });
        state.nextId = e.enemyId + 1;
        break;
      }
    }
  }
}
