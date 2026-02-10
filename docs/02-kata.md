# Tennis Kata

_This Kata is an adaptation to OCaml of [Mark Seeman's serie of articles about property-based testing](http://blog.ploeh.dk/2016/02/10/types-properties-software/). Most of his article's exemples are un F#. I highly recommand the reading of his blog if you're interested by functional programming._

## About type systems

TypeScript is a language built over Javascript which provides syntax for types and specially it allows to write [Algebric Data Type](https://en.wikipedia.org/wiki/Algebraic_data_type) (aka ADT). As a reminder, an Algebric Data Type is a system built with sum types, product types and recursive types.

With the Algebric Data Type available in Typescript, you can design your types so that illegal states are unrepresentable. You can see this as "free" tests for your application.

We will illustrate it by the Tennis Kata

## Draw your racket

### Code

Code must be in [index.ts](../index.ts)

### Developing

```sh
git clone <this-repo>
npm install
npm start
```

### Running Tests

```sh
# Runs the "test" command in `package.json`.
npm test
```

## Tennis

A tennis match consists of multiple sets that again are played as several games, in the kata, you only have to implement the scoring system for a single game:

- Each player can have either of these points in one game: Love, 15, 30, 40.
- If you have 40 and you win the ball, you win the game. There are, however, special rules.
- If both have 40, the players are deuce.
- If the game is in deuce, the winner of a ball will have advantage and game ball.
- If the player with advantage wins the ball, (s)he wins the game.
- If the player without advantage wins, they are back at deuce.

This problem is easy enough that it's fun to play with, but difficult enough that it's fun to play with.
<br/>(∩ ｀-´)⊃━ ☆ .\*･｡ﾟ

Along this Kata we will iterate on the implementation of the game and the associated unit tests.

### Type Driven Development

### Players

In tennis, there are two players, which we can easily model with a discriminated union :

```typescript
export type Player = 'PLAYER_ONE' | 'PLAYER_TWO';
```

### Points

#### **Naive point attempt with a type alias**

```typescript
type Point = number
```

This easily enables you to model some of the legal point values:

```typescript
const p1: Point = 15;
const p2: Point = 30;
```

It looks good so far, but how do you model love? It's not really an integer.

> Love would be a derivative of the french expression for an egg `L'oeuf` which sounds close to Love for english people because an egg looks like 0

Both players start with love, so it's intuitive to try to model love as 0 ...It's a hack, but it works. But your illegal values are not unrepresentable :

```typescript
const p3: Point = 1000;
const p4: Point = -20;
```

For a 32-bit integer, this means that we have four legal representations (0, 15, 30, 40), and 4,294,967,291 illegal representations of a tennis point. Clearly this doesn't meet the goal of making illegal states unrepresentable. ლ(ಠ_ಠლ)

#### **Second point attempt with discriminated unions**

You may see that love, 15, 30, and 40 aren't numbers, but rather labels. No arithmetic is performed on them. It's easy to constrain the domain of points with a discriminated union

```typescript
export type Point =
  | Love
  | Fifteen
  | Thirty
  | Forty
```

with
```typescript
export type Love = {
  kind: 'LOVE';
};

export type Fifteen = {
  kind: 'FIFTEEN';
};

export type Thirty = {
  kind: 'THIRTY';
};

type Forty = {
  kind: 'FORTY';
};

export const love = (): Love => ({
  kind: 'LOVE',
});

export const fifteen = (): Fifteen => ({
  kind: 'FIFTEEN',
});

export const thirty = (): Thirty => ({
  kind: 'THIRTY',
});

const forty = (): Forty => ({
  kind: 'FORTY',
});
```

In Typescript we need to define type constructor manually, like :
```typescript
const love = (): Love => ({
    kind: 'LOVE',
})
```

We need to do this for each variant of Point type.

A Point value isn't a score. A score is a representation of a state in the game, with a point to each player. You can model this with a record:

```typescript
export type PointsData = {
    playerOne: Point;
    playerTwo: Point;
}
```

You can experiment with this type:

```typescript
const s1: PointsData = { playerOne: love(), playerTwo: love() };
const s2: PointsData = { playerOne: fifteen(), playerTwo: love() };
const s3: PointsData = { playerOne: thirty(), playerTwo: love() };
```

What happens if players are evenly matched?

```typescript
const even: PointsData = { playerOne: forty(), playerTwo: forty() };
```

_Forty-Forty_ isn't a valid tennis score; it's called _Deuce_.

If you're into [Domain-Driven Design](https://www.infoq.com/minibooks/domain-driven-design-quickly), you prefer using the ubiquitous language of the domain. When the tennis domain language says that it's not called forty-forty, but deuce, the code should reflect that.

#### **Final attempt at a point type**

The love-love, fifteen-love, etc. values that you can represent with the above PointsData type are all valid. Only when you approach the boundary value of forty do problems appear. A solution is to remove the offending Forty case from Point. (⊙_☉)

At this point, it may be helpful to recap what we have :

```typescript
export type Player = 'PLAYER_ONE' | 'PLAYER_TWO';

export type Love = {
  kind: 'LOVE';
};

export type Fifteen = {
  kind: 'FIFTEEN';
};

export type Thirty = {
  kind: 'THIRTY';
};

export type Point = Love | Fifteen | Thirty;

export type PointsData = {
  playerOne: Point;
  playerTwo: Point;
};
```


While this enables you to keep track of the score when both players have less than forty points, the following phases of a game still remain:

- One of the players have forty points.
- Deuce.
- Advantage to one of the players.
- One of the players won the game.

You can design the first of these with another record type:

```typescript
export type FortyData = {
  player: Player; // The player who have forty points
  otherPoint: Point; // Points of the other player
};
```

For instance, this value indicates that playerOne has forty points, and playerTwo has Love :

```typescript
let fd: FortyData = { player: playerOne(), otherPoint: love() };

```

This is a legal score. Other values of this type exist, but none of them are illegal.

### Score

Now you have two distinct types, PointsData and FortyData, that keep track of the score at two different phases of a tennis game. You still need to model the remaining three phases, and somehow turn all of these into a single type. This is an undertaking that can be surprisingly complicated in C# or Java, but is trivial to do with a variant:

```typescript
export type Score = Points | Forty | Deuce | Advantage | Game;
```

with

```typescript
export type Points = {
  kind: 'POINTS';
  pointsData: PointsData;
};

export type Deuce = {
  kind: 'DEUCE';
};

export type Forty = {
  kind: 'FORTY';
  fortyData: FortyData;
};

export type Advantage = {
  kind: 'ADVANTAGE';
  player: Player;
};

export type Game = {
  kind: 'GAME';
  player: Player;
};
```

#### 🧑‍💻 Exercice 0 🧑‍💻

Write type constructors of types Deuce, Forty and Advantage. I give you their types :
```
deuce: () -> Deuce
forty: Player -> Point -> Forty
advantage: Player -> Advantage
```

As an example, the game starts with both players at love:

```typescript
const startScore: Score = points(love(), love());
```

PlayerOne has forty points, and PlayerTwo has thirty points, you can create this value:

```typescript
const anotherScore: Score = forty(playerTwo(), thirty());
```

This model of the tennis score system enables you to express all legal values, while making illegal states unrepresentable.

These types govern what can be stated in the domain, but they don't provide any rules for how values can transition from one state to another.

#### 🧑‍💻 Exercice 1 🧑‍💻

Develop 2 functions : `pointToString`, `scoreToString` that return string from a data of type point or score.

## Transitions

While the types defined in the previously make illegal states unrepresentable, they don't enforce any rules about how to transition from one state into another. A state transition should be a function that takes a current Score and the winner of a ball and returns a new Score. More formally, it should have the type `Score -> Player -> Score`.

### Test Driven Development

We will apply Test-Driven Development following the Red/Green/Refactor cycle, using [Jest](https://jestjs.io/).

We will define a smaller function for each case, and test the properties of each of these functions.


Test framework is already setup :

- [index.ts](../__tests__/index.ts) : contains tests and test sets

#### **Deuce property**

The case of deuce is special, because there's no further data associated with the state; when the score is deuce, it's deuce. This means that when calling scoreWhenDeuce, you don't have to supply the current state of the game.

In [index.ts](../__tests__/index.ts) :

```typescript
test('Given deuce, score is advantage to winner', () => {
  ['PLAYER_ONE', 'PLAYER_TWO'].forEach((w) => {
    const score = scoreWhenDeuce(stringToPlayer(w));
    const scoreExpected = advantage(stringToPlayer(w));
    expect(score).toStrictEqual(scoreExpected);
  })
});
```

The test fails because we don't have implement the function `scoreWhenDeuce` yet :

```typescript
export const scoreWhenDeuce = (winner: Player): Score => advantage(winner);
```

💡 `advantage` function with type `Player -> Advantage` is the type constructor of `Advantage` type.

Now the test pass ! (•̀ᴗ•́)و

### Winning the game

#### **Advantage**

When one of the players have the advantage in tennis, the result can go one of two ways: either the player with the advantage wins the ball, in which case he or she wins the game, or the other player wins, in which case the next score is deuce.

We will add a new test :

```typescript
test('Given advantage when advantagedPlayer wins, score is Game avantagedPlayer', () => {
  ['PLAYER_ONE', 'PLAYER_TWO'].forEach((advantaged) => {
    const advantagedPlayer = stringToPlayer(advantaged);
    const winner = advantagedPlayer;
    const score = scoreWhenAdvantage(advantagedPlayer, winner);
    const scoreExpected = game(winner);
    expect(score).toStrictEqual(scoreExpected);
  })
});
```

The test fails because we don't have implement the function `scoreWhenAdvantage` yet :

```typescript
export const scoreWhenAdvantage = (
  advantagedPlayed: Player,
  winner: Player
): Score => {
  return game(winner);
};
```

Now the test pass ! (•̀ᴗ•́)و

Add a new test :

```typescript
test('Given advantage when otherPlayer wins, score is Deuce', () => {
  ['PLAYER_ONE', 'PLAYER_TWO'].forEach((advantaged) => {
    const advantagedPlayer = stringToPlayer(advantaged);
    const winner = otherPlayer(advantagedPlayer);
    const score = scoreWhenAdvantage(advantagedPlayer, winner);
    const scoreExpected = deuce();
    expect(score).toStrictEqual(scoreExpected);
  })
});
```

The test fails again (⊙_☉)

The above implementation of `scoreWhenAdvantage` is obviously incorrect, because it always claims that the advantaged player wins the game, regardless of who wins the ball.

```typescript
export const scoreWhenAdvantage = (
  advantagedPlayed: Player,
  winner: Player
): Score => {
  if (isSamePlayer(advantagedPlayed, winner)) return game(winner);
  return deuce();
};

```

Now the test pass ! (•̀ᴗ•́)و

#### **Forty**

When one of the players have forty points, there are three possible outcomes of the next ball:

1. If the player with forty points wins the ball, (s)he wins the game.
2. If the other player has thirty points, and wins the ball, the score is deuce.
3. If the other player has less than thirty points, and wins the ball, his or her points increases to the next level (from love to fifteen, or from fifteen to thirty).

The first property is the easiest :

```typescript
test('Given a player at 40 when the same player wins, score is Game for this player', () => {
  ['PLAYER_ONE', 'PLAYER_TWO'].forEach((winner) => {
    const fortyData = {
      player: stringToPlayer(winner),
      otherPoint: stringToPoint('THIRTY'),
    };
    const score = scoreWhenForty(fortyData, stringToPlayer(winner));
    const scoreExpected = game(stringToPlayer(winner));
    expect(score).toStrictEqual(scoreExpected);
  })
});
```

The test fails, now add an implementation :

```typescript
export const scoreWhenForty = (
  currentForty: FortyData,
  winner: Player
): Score => game(winner);
```

Now the test pass ! (•̀ᴗ•́)و

Add a test for the second :

```typescript
test('Given player at 40 and other at 30 when other wins, score is Deuce', () => {
  ['PLAYER_ONE', 'PLAYER_TWO'].forEach((winner) => {
    const fortyData = {
      player: otherPlayer(stringToPlayer(winner)),
      otherPoint: stringToPoint('THIRTY'),
    };
    const score = scoreWhenForty(fortyData, stringToPlayer(winner));
    const scoreExpected = deuce();
    expect(score).toStrictEqual(scoreExpected);
  })
});
```

And add a test for the third property :

```typescript
test('Given player at 40 and other at 15 when other wins, score is 40 - 30', () => {
  ['PLAYER_ONE', 'PLAYER_TWO'].forEach((winner) => {
    const fortyData = {
      player: otherPlayer(stringToPlayer(winner)),
      otherPoint: stringToPoint('FIFTEEN'),
    };
    const score = scoreWhenForty(fortyData, stringToPlayer(winner));
    const scoreExpected = forty(fortyData.player, thirty());
    expect(score).toStrictEqual(scoreExpected);
  })
});
```

Iterate our implementation of `scoreWhenForty` to make the tests pass ! (•̀ᴗ•́)و

First create a tooling function :

```typescript
export const incrementPoint = (point: Point) : Option.Option<Point> => {
  switch (point.kind) {
    case 'LOVE':
      return Option.some(fifteen());
    case 'FIFTEEN':
      return Option.some(thirty());
    case 'THIRTY':
      return Option.none();
  }
};
```

Now we can use pattern matching on our option type (with `match` provided by Effect) to implement our function :

```typescript
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
```

Now the test pass ! (ﾉ ◕ ヮ ◕)ﾉ\*:・ﾟ ✧

#### **Points**

#### 🧑‍💻 Exercice 2 🧑‍💻

Implement some tests for points (uncomment them in [index.ts](../__tests__/index.ts)) :

```typescript
  test('Given players at 0 or 15 points score kind is still POINTS', () => {
    throw new Error(
      'Your turn to code the preconditions, expected result and test.'
    );
  });
```
```typescript
  test('Given one player at 30 and win, score is forty', () => {
    throw new Error(
      'Your turn to code the preconditions, expected result and test.'
    );
  });
```

Then implements `scoreWhenPoint` :

```typescript
export const scoreWhenPoint = (current: PointsData, winner: Player): Score => {
  // Your code here
}
```
_Tip: You can use pipe function from fp-ts to improve readability. See scoreWhenForty function._

Now the test pass ! (ﾉ ◕ ヮ ◕)ﾉ\*:・ﾟ ✧

### Composing the general function

What you need to implement is a state transition of the type `Score -> Score -> Player`.

What you have so far are the following functions:

- scoreWhenPoint : `PointsData -> Player -> Score`
- scoreWhenForty : `FortyData -> Player -> Score`
- scoreWhenDeuce : `Player -> Score`
- scoreWhenAdvantage : `Player -> Player -> Score`

It missing a function `scoreWhenGame`. It's because a pattern matching must be exaustive in the general function `score`. We should also use default case in our switch/case instruction, but in our case, `currentScore` type is `Score` so its value may also be `Game`, so here pattern matching is exhaustive. When score is Game it means a player win the game, score will no more change.

#### 🧑‍💻 Exercice 3 🧑‍💻

Fill the implementation :

```typescript
export const scoreWhenGame = (winner: Player): Score => {
  // Your code here
};
```

Now, you can implement the desired function `score` by cliping the pieces together:

```typescript
const score = (currentScore: Score, winner: Player): Score => {
  // Your code here
};
```

Finally you can initialize a new Game :

```typescript
const newGame: Score = points(love(), love());
```

## Take away

Everything we did in this Kata is achievable in any language that can represent an ADT (Algebric Data Type)!
