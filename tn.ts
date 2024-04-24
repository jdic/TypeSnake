import * as readline from 'readline'

enum Movement
{
  Up = 'up',
  Left = 'left',
  Right = 'right',
  Down = 'down'
}

type Difficulty = 'easy' | 'medium' | 'high' | 'custom'
type Position = [number, number]
type Eaten = keyof IPowerUps | 'apple'
type Range = 'exact' | 'expanded'

interface IICons
{
  target?: string
  body?: string
  backgorund?: string
  magnet?: string
  slowmo?: string
  bonus?: string
}

interface IOptions
{
  updateTime?: number
  scorePerApple?: number
  difficulty?: Difficulty | null
  icons?: IICons
  powerUps?: IPowerUps
  expandedRange?: number
}

interface ISpeeds
{
  easy: number
  medium: number
  high: number
}

interface IPowerUps
{
  magnet: { enable: boolean, probability: number }
  slowmo: { enable: boolean, probability: number }
  bonus: { enable: boolean, probability: number }
}

interface IPowerUp
{
  position: Position
  type: keyof IPowerUps
}

class Snake
{
  private snake: Position[] = [[10, 10]]
  private apple: Position = this.getRandomIndex()
  private direction: Position = [0, -1]
  private updateTime: number = 0
  private score: number = 0
  private scorePerApple: number = 5
  private difficulty: Difficulty = 'easy'
  private speeds: ISpeeds = { easy: 1000, medium: 250, high: 70 }
  private icons: IICons = { backgorund: '⬜️', body: '🐍', target: '🍎', bonus: '🍐', magnet: '🧲', slowmo: '🧊' }
  private powerUps: IPowerUps = { magnet: { enable: true, probability: 1 }, slowmo: { enable: true, probability: 1 }, bonus: { enable: true, probability: 1 } }
  private powerUpsOnBoard: IPowerUp[] = []
  private range: Range = 'exact'
  private expandedRange: number = 1
  private intervalId: Timer | null = null

  constructor()
  {  }

  initialize(options?: IOptions)
  {
    this.expandedRange = options?.expandedRange || this.expandedRange
    this.icons = { ...this.icons, ...(options?.icons || this.icons) }
    this.powerUps = options?.powerUps || this.powerUps
    this.scorePerApple = options?.scorePerApple || this.scorePerApple
    this.difficulty = options?.difficulty || this.difficulty
    this.updateTime = this.difficulty !== 'custom'
      ? this.speeds[this.difficulty]
      : options?.updateTime
      ?? 1000

    readline.emitKeypressEvents(process.stdin)
    if (process.stdin.isTTY) process.stdin.setRawMode(true)

    process.stdin.on('keypress', (_, key) =>
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

    this.intervalId = setInterval(() =>
    {
      this.update()
    }, this.updateTime)
  }

  update()
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
 
    const eatenApple = this.isInRange(this.apple) ? 'apple' : undefined
    const eatenPowerUp = this.powerUpsOnBoard.find((powerUp) => this.isInRange(powerUp.position))?.type

    if (eatenApple) this.onEat(eatenApple)
    else if (eatenPowerUp) this.onEat(eatenPowerUp)
    else this.snake.pop()

    this.snake.unshift(head)
    this.draw()
  }

  onEat(eaten?: Eaten)
  {
    const oldBackgroundIcon = this.icons.backgorund
    const oldScorePerApple = this.scorePerApple
    
    switch (eaten)
    {
      case 'apple':
        this.score += this.scorePerApple
        this.apple = this.getRandomIndex()

        const random = Math.random()

        if (this.powerUps.magnet.enable && (random < this.powerUps.magnet.probability)) this.addPowerUp('magnet')
        if (this.powerUps.bonus.enable && (random < this.powerUps.bonus.probability)) this.addPowerUp('bonus')
        if (this.powerUps.slowmo.enable && (random < this.powerUps.slowmo.probability)) this.addPowerUp('slowmo')
        break

      case 'magnet':
        this.deletePowerUp(eaten)
        this.range = 'expanded'
        setTimeout(() =>
        {
          this.range = 'exact'
        }, 2000)
        break

      case 'slowmo':
        this.deletePowerUp('slowmo')
        clearInterval(this.intervalId as Timer)
        this.intervalId = setInterval(() => this.update(), this.updateTime + 200)

        setTimeout(() =>
        {
          clearInterval(this.intervalId as Timer)
          this.intervalId = setInterval(() => this.update(), this.updateTime)
        }, 2000)
        break

      case 'bonus':
        this.deletePowerUp(eaten)

        const intervalId = setInterval(() =>
        {
          this.icons.backgorund = this.icons.backgorund === '🟦' ? '⬜' : '🟦'
          this.draw()
          this.scorePerApple = 15
        }, this.updateTime)

        setTimeout(() =>
        {
          clearInterval(intervalId)
          this.icons.backgorund = oldBackgroundIcon
          this.scorePerApple = oldScorePerApple
          this.draw()
        }, 2000)
        break
      
      default:
        break
    }
  }

  addPowerUp(type: keyof IPowerUps)
  {
    const existingPowerUp = this.powerUpsOnBoard
      .find((powerUp) => powerUp.type === type)

    if (existingPowerUp) return

    const position = this.getRandomIndex()
    this.powerUpsOnBoard.push({ position, type })
  }

  deletePowerUp(type: keyof IPowerUps)
  {
    this.powerUpsOnBoard = this.powerUpsOnBoard.filter((powerUp) => powerUp.type !== type)
  }

  getRandomIndex()
  {
    return [Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)] as Position
  }

  isInRange(position: Position): boolean
  {
    if (this.range === 'exact')
    {
      return this.snake[0][0] === position[0] && this.snake[0][1] === position[1]
    }

    else if (this.range === 'expanded')
    {
      const [x, y] = this.snake[0]

      return Math.abs(x - position[0]) <= this.expandedRange && Math.abs(y - position[1]) <= this.expandedRange
    }

    return false
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
        let isPowerUp = false

        for (const powerUp of this.powerUpsOnBoard)
        {
          if (powerUp.position[0] === i && powerUp.position[1] === j)
          {
            row += this.icons[powerUp.type]
            isPowerUp = true
            break
          }
        }

        if (!isPowerUp)
        {
          if (this.snake.find((part) => part[0] === i && part[1] === j)) row += this.icons.body
          else if (this.apple[0] === i && this.apple[1] === j) row += this.icons.target
          else row += this.icons.backgorund
        }
      }

      console.log(row)
    }
  }
}

const snake = new Snake()

const options: IOptions =
{
  scorePerApple: 8,
  difficulty: 'high',
  icons: { backgorund: '⬛', body: '🗿' }
}

snake.initialize(options)