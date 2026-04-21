export type MovePlayerCommand = {
  input: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  deltaSeconds: number;
};
