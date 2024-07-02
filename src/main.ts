import "./style.css";
import Phaser from "phaser";

const gameCanvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

const sizes = {
  height: 500,
  width: 500,
};

const speedDown = 400;
const gameDuration = 30000;

const gameStartDiv = document.querySelector("#gameStartDiv") as HTMLDivElement;
const gameStartBtn = document.querySelector("#gameStartBtn") as HTMLButtonElement;
const gameEndDiv = document.querySelector("#gameEndDiv") as HTMLDivElement
const gameWinLoseSpan = document.querySelector("#gameWinLoseSpan") as HTMLSpanElement;
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan") as HTMLSpanElement;

class GameScene extends Phaser.Scene {
  public player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | null = null;
  public target: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | null = null;
  public cursor: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  public playerSpeed = speedDown - 50;
  public points = 0;
  public textScore: Phaser.GameObjects.Text | null = null;
  public textTime: Phaser.GameObjects.Text | null = null;
  public timedEvent: Phaser.Time.TimerEvent | null = null;
  public remainingTime = 0;
  public coinMusic: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound | null = null;
  public bgMusic: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound | null = null;
  public emitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor() {
    super("scene-game");
  }

  preload() {
    this.load.image("bg", "/assets/bg.png");
    this.load.image("basket", "/assets/basket.png");
    this.load.image("apple", "/assets/apple.png");
    this.load.image('money', "/assets/money.png");
    this.load.audio("coin", "/assets/coin.mp3");
    this.load.audio("bgMusic", "/assets/bgMusic.mp3");
  }

  create() {
    this.scene.pause('scene-game')

    this.coinMusic = this.sound.add("coin");
    this.bgMusic = this.sound.add("bgMusic");
    this.bgMusic.play();

    this.add.image(0, 0, "bg").setOrigin(0, 0);
    this.player = this.physics.add.image(0, sizes.height - 100, 'basket').setOrigin(0, 0);
    this.player.setImmovable(true);
    this.player.body.allowGravity = false;
    this.player.setCollideWorldBounds(true);

    const colliderWidth = this.player.width - this.player.width / 4;
    const collierHeight = this.player.height / 10;
    const colliderOffsetX = this.player.width / 10;
    const colliderOffsetY = this.player.height - this.player.height / 10;

    this.player.setSize(colliderWidth, collierHeight).setOffset(colliderOffsetX, colliderOffsetY);

    this.target = this.physics.add.image(0, 0, "apple").setOrigin(0, 0);
    this.target.setMaxVelocity(0, speedDown);
    if (this.input.keyboard) {
        this.cursor = this.input.keyboard.createCursorKeys();
    }

    this.physics.add.overlap(this.target, this.player, this.targetHit, undefined, this);
    this.textScore = this.add.text(sizes.width - 120, 10, "Score:0", {
        font: "25px Arial",
        color: "#000000",
    });
    this.textTime = this.add.text(10, 10, "Remaining Time: 00", {
        font: "25px Arial",
        color: "#000000"
    })

    this.timedEvent = this.time.delayedCall(gameDuration, this.gameOver, [], this)

    this.emitter = this.add.particles(0, 0, "money", {
        speed: 100,
        gravityY: speedDown - 200,
        scale: 0.04,
        duration: 100,
        emitting: false
    });
    this.emitter.startFollow(this.player, this.player.width / 2, this.player.height / 2, true);
  }

  update() {
    if (this.target) {
        if (this.target.y >= sizes.height) {
            this.target.setY(0);
            this.target.setX(this.getRandomX())
        }
    }

    if (this.cursor && this.player) {
        const { left, right } = this.cursor;

        if (left.isDown) {
            this.player.setVelocityX(-this.playerSpeed)
        } else if (right.isDown) {
            this.player.setVelocityX(this.playerSpeed)
        } else {
            this.player.setVelocityX(0)
        }
    }

    if (this.timedEvent) {
        this.remainingTime = this.timedEvent.getRemainingSeconds();
    }

    if (this.textTime) {
        this.textTime.setText(`Remaining Time: ${Math.round(this.remainingTime).toString()}`)
    }
  }

  getRandomX() {
    return Math.floor(Math.random() * 480)
  }

  targetHit() {
    if (this.target) {
        this.target.setY(0);
        this.target.setX(this.getRandomX());
        this.points++;

        if (this.textScore) {
            this.textScore.setText(`Score: ${this.points}`);
        }

        if (this.coinMusic) {
            this.coinMusic.play()
        }

        if (this.emitter) {
            this.emitter.start()
        }
    }
  }

  gameOver() {
    this.sys.game.destroy(true);
    if (gameEndScoreSpan && gameWinLoseSpan) {
        if (this.points >= 10) {
            gameEndScoreSpan.textContent = this.points.toString();
            gameWinLoseSpan.textContent = "Win! 😍"
        } else {
            gameEndScoreSpan.textContent = this.points.toString();
            gameWinLoseSpan.textContent = "Lose! 😭"
        }

        gameEndDiv.style.display = "flex"
    }

  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  ...sizes,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown, x: 0 },
    },
  },
  scene: [GameScene],
};


const game = new Phaser.Game(config);

if (gameStartBtn) {
    gameStartBtn.addEventListener("click", () => {
        if (gameStartDiv) {
            gameStartDiv.style.display = "none"
            game.scene.resume("scene-game")
        }
    })
}