import { Player, stringToPlayer, isSamePlayer } from './types/player';
import { Point, PointsData, Score, FortyData, advantage, deuce, forty, game } from './types/score';
import { pipe, Option } from 'effect'

// -------- Tooling functions --------- //

export const playerToString = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return 'Player 1';
    case 'PLAYER_TWO':
      return 'Player 2';
  }
};
export const otherPlayer = (player: Player) => {
  switch (player) {
    case 'PLAYER_ONE':
      return stringToPlayer('PLAYER_TWO');
    case 'PLAYER_TWO':
      return stringToPlayer('PLAYER_ONE');
  }
};
// Exercice 1 :
export const pointToString = (point: Point): string => {
  switch (point) {
    case 0:
      return 'Love';
    case 15:
      return 'Fifteen';
    case 30:
      return 'Thirty';
    default:
      return point.toString();
  }
};

export const scoreToString = (score: Score): string => {
  switch (score.kind) {
    case 'POINTS':
      return `${pointToString(score.pointsData.PLAYER_ONE)} - ${pointToString(score.pointsData.PLAYER_TWO)}`;
    case 'FORTY':
      const fortyPlayer = score.fortyData.player === 'PLAYER_ONE' ? 'Player 1' : 'Player 2';
      return `Forty - ${pointToString(score.fortyData.otherPoint)} (${fortyPlayer} at 40)`;
    case 'DEUCE':
      return 'Deuce';
    case 'ADVANTAGE':
      const advantagePlayer = score.player === 'PLAYER_ONE' ? 'Player 1' : 'Player 2';
      return `Advantage ${advantagePlayer}`;
    case 'GAME':
      const winner = score.player === 'PLAYER_ONE' ? 'Player 1' : 'Player 2';
      return `Game ${winner}`;
  }
};

export const scoreWhenDeuce = (winner: Player): Score => advantage(winner);

export const scoreWhenAdvantage = (
  advantagedPlayed: Player,
  winner: Player
): Score => {
  if (isSamePlayer(advantagedPlayed, winner)) return game(winner);
  return deuce();
};

export const incrementPoint = (point: Point): Option.Option<Point> => {
  if (point === 0) return Option.some(15);
  if (point === 15) return Option.some(30);
  return Option.none();
};

export const scoreWhenForty = (
  currentForty: FortyData,
  winner: Player
): Score => {
  if (isSamePlayer(currentForty.player, winner)) return game(winner);
  return pipe(
    incrementPoint(currentForty.otherPoint),
    Option.match({
      onNone: () => deuce(),
      onSome: p => forty(currentForty.player, p) as Score
    })
  );
};

// Exercice 2
// Tip: You can use pipe function from Effect to improve readability.
// See scoreWhenForty function above.
export const scoreWhenPoint = (current: PointsData, winner: Player): Score => {
  const winnerPoint = current[winner];
  const otherPlayerKey = winner === 'PLAYER_ONE' ? 'PLAYER_TWO' : 'PLAYER_ONE';
  const otherPoint = current[otherPlayerKey];
  
  return pipe(
    incrementPoint(winnerPoint),
    Option.match({
      onNone: () => forty(winner, otherPoint),
      onSome: newPoint => ({
        kind: 'POINTS' as const,
        pointsData: {
          ...current,
          [winner]: newPoint
        }
      })
    })
  );
};

// Exercice 3
export const scoreWhenGame = (currentGame: Score): Score => currentGame;

export const score = (currentScore: Score, winner: Player): Score => {
  switch (currentScore.kind) {
    case 'POINTS':
      return scoreWhenPoint(currentScore.pointsData, winner);
    case 'FORTY':
      return scoreWhenForty(currentScore.fortyData, winner);
    case 'DEUCE':
      return scoreWhenDeuce(winner);
    case 'ADVANTAGE':
      return scoreWhenAdvantage(currentScore.player, winner);
    case 'GAME':
      return scoreWhenGame(currentScore);
  }
};
