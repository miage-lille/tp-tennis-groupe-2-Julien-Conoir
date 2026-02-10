export type Player = 'PLAYER_ONE' | 'PLAYER_TWO';

export const stringToPlayer = (str: string): Player => {
  switch (str) {
    case 'PLAYER_ONE':
      return 'PLAYER_ONE';
    case 'PLAYER_TWO':
      return 'PLAYER_TWO';
    default:
      throw new Error(`Invalid player string: ${str}`);
  }
}

export const isSamePlayer = (p1: Player, p2: Player) => p1 === p2;
