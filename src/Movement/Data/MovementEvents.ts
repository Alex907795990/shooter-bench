import type { Vec2 } from "../../_Shared/Data/Vec2";

export interface PlayerMovedEvent {
  type: "playerMoved";
  pos: Vec2;
}

export type MovementEvent = PlayerMovedEvent;
