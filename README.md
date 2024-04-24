# TypeSnake

I was bored, with nothing to do, BUT, some time ago I had created this pseudo game, the other game was my first or second day of TypeScript, it's been a while, I'm not a master, this code is not that of a master, but, this simple code is a progress from the previous one.

## Code structure

The code, although not complex, is super easy, it is sectioned, which I will describe below, I could have sectioned the code into separate parts, in other files, but I don't want to.

### Snake Class

The main class of the game, responsible for managing the game logic and user interactions.

- **Constructor**: Initializes the default variables and configurations of the game.
- **initialize()**: Initializes the game with the options provided by the user, configuring the board, power-ups, speeds, etc.
- **update()**: Updates the game state at each game cycle, controlling the snake's movement, detecting collisions and updating the screen.
- **onEat()**: Handles the actions that occur when the snake eats an apple or a PowerUp.
- **addPowerUp()**: Adds a new PowerUp to the board at a random position.
- **deletePowerUp()**: Removes a PowerUp from the board.
- **getRandomIndex()**: Generates a random position on the board.
- **isInRange()**: Checks if a position is within the collision detection range.
- **draw()**: Draws the current state of the game in the console.
- **draw()**: Dibuja el estado actual del juego en la consola.

## Usage

To play the game, instantiate the `Snake` class and call the `initialize()` method passing the desired options, such as difficulty level, board dimensions and custom icons.

```typescript
const snake = new Snake()

const options: IOptions =
{
  scorePerApple: 8,
  difficulty: 'high',
  icons: { background: '⬛', body: '🗿' },
  board: { width: 50, height: 50 }
}

snake.initialize(options)
```