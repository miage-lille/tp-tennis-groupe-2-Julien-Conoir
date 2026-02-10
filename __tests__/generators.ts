import * as fc from 'fast-check';
import { Player } from '../types/player';
import {
  Fifteen,
  Forty,
  FortyData,
  Love,
  Point,
  Points,
  Thirty,
} from '../types/score';

export const playerOneArb = (): fc.Arbitrary<Player> =>
  fc.constant('PLAYER_ONE');
export const playerTwoArb = (): fc.Arbitrary<Player> =>
  fc.constant('PLAYER_TWO');
export const getPlayer = () => fc.oneof(playerOneArb(), playerTwoArb());
export const getPoint = (): fc.Arbitrary<Point> =>
  fc.oneof(getLove(), getFifteen(), getThirty());
export const getPoints = (): fc.Arbitrary<Points> =>
  fc.record({
    kind: fc.constant('POINTS'),
    pointsData: fc.record({
      PLAYER_ONE: getPoint(),
      PLAYER_TWO: getPoint(),
    }),
  });
export const getFortyData = (): fc.Arbitrary<FortyData> =>
  fc.record({
    player: getPlayer(),
    otherPoint: getPoint(),
  });
export const getForty = (): fc.Arbitrary<Forty> =>
  fc.record({
    fortyData: getFortyData(),
    kind: fc.constant('FORTY'),
  });
export const getLove = (): fc.Arbitrary<Love> =>
  fc.record({
    kind: fc.constant('LOVE'),
  });

export const getThirty = (): fc.Arbitrary<Thirty> =>
  fc.record({
    kind: fc.constant('THIRTY'),
  });
export const getFifteen = (): fc.Arbitrary<Fifteen> =>
  fc.record({
    kind: fc.constant('FIFTEEN'),
  });
