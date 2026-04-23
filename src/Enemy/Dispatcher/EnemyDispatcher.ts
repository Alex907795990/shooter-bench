import type { EnemyEvent } from "../Data/EnemyEvents";
import {
  ensureEnemySpriteAdapter,
  setEnemyPositionAdapter,
  destroyEnemySpriteAdapter,
} from "../Adapter/EnemySpriteAdapter";
import {
  ensureSpawnMarkerSpriteAdapter,
  destroySpawnMarkerSpriteAdapter,
} from "../Adapter/SpawnMarkerSpriteAdapter";

export function dispatchEnemyDispatcher(events: readonly EnemyEvent[]): void {
  for (const e of events) {
    switch (e.type) {
      case "enemyMoved":
        ensureEnemySpriteAdapter(e.id, e.pos);
        setEnemyPositionAdapter(e.id, e.pos);
        break;
      case "enemyDied":
        destroyEnemySpriteAdapter(e.id);
        break;
      case "enemySpawnMarkerCreated":
        ensureSpawnMarkerSpriteAdapter(e.id, e.pos);
        break;
      case "enemySpawnMarkerExpired":
        destroySpawnMarkerSpriteAdapter(e.id);
        break;
      case "enemySpawned":
        ensureEnemySpriteAdapter(e.enemyId, e.pos);
        break;
      case "enemySpawnCooldownTicked":
      case "enemySpawnMarkerTicked":
        break;
    }
  }
}
