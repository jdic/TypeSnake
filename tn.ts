console.log("Hello via Bun!");import * as readline from 'readline'

enum Movement
{
  Up = 'up',
  Left = 'left',
  Right = 'right',
  Down = 'down'
}

type Difficulty = 'easy' | 'medium' | 'high' | 'custom'

type Position = [number, number]

interface IICons
{
  target: string
  body: string
  backgorund: string
}

interface IOptions
{
  updateTime?: number
  scorePerApple?: number
  difficulty?: Difficulty | null
  icons: IICons
}

interface ISpeeds
{
  easy: number
  medium: number
  high: number
}

class Snake
{
  private snake: Position[] = [[10, 10]]
  private apple: Position = [Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)]
  private direction: Position = [0, -1]
  private updateTime: number = 0
  private score: number = 0
  private scorePerApple: number = 0
  private difficulty: Difficulty = 'custom'
  private speeds: ISpeeds = { easy: 1000, medium: 250, high: 70 }
  private icons: IICons = { backgorund: '', body: '', target: '' }

  constructor()
  {  }

  initialize(options?: IOptions)
  {
    this.icons = options?.icons || { backgorund: '⬜️', body: '🐍', target: '🍎' }
    this.scorePerApple = options?.scorePerApple || 5
    this.difficulty = options?.difficulty || 'custom'
    this.updateTime = this.difficulty !== 'custom'
      ? this.speeds[this.difficulty]
      : options?.updateTime
      ?? 1000

    readline.emitKeypressEvents(process.stdin)
    if (process.stdin.isTTY) process.stdin.setRawMode(true)

    process.stdin.on('keypress', (str, key) =>
    {
      switch (key.name)
      {
        case Movement.Up:
          if (this.direction[0] !== 1) this.direction = [-1, 0]
          break

        case Movement.Down:
          if (this.direction[0] !== -1) this.direction = [1, 0]
          break

        case Movement.Left:
          if (this.direction[1] !== 1) this.direction = [0, -1]
          break

        case Movement.Right:
          if (this.direction[1] !== -1) this.direction = [0, 1]
          break

        case 'c':
          if (key.ctrl) process.exit()
          break
      }
    })

    setInterval(() =>
    {
      const head = this.snake[0].slice() as Position
      head[0] = (head[0] + this.direction[0] + 20) % 20
      head[1] = (head[1] + this.direction[1] + 20) % 20

      for (let i = 1; i < this.snake.length; i++)
      {
        if (this.snake[i][0] === head[0] && this.snake[i][1] === head[1])
        {
          console.log('¡You Lose!')
          process.exit()
        }
      }
 
      if (head[0] === this.apple[0] && head[1] === this.apple[1]) this.onEat()
      else this.snake.pop()

      this.snake.unshift(head)
      this.draw()
    }, this.updateTime)
  }

  onEat()
  {
    this.score += this.scorePerApple
    this.apple = [Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)]
  }

  draw()
  {
    console.clear()
  
    console.log('Difficulty:', this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1))
    console.log('Score:', this.score, '\t')

    for (let i = 0; i < 20; i++)
    {
      let row = ''

      for (let j = 0; j < 20; j++)
      {
        if (this.snake.find((part) => part[0] === i && part[1] === j)) row += this.icons.body
        else if (this.apple[0] === i && this.apple[1] === j) row += this.icons.target
        else row += this.icons.backgorund
      }

      console.log(row)
    }
  }
}

const snake = new Snake()

snake.initialize({ scorePerApple: 8, difficulty: 'high', icons: { backgorund: '⬛', body: '🗿', target: '🍎' } })