var GameManager = function (game) {
  tempLabel = null
  this.gameTime = 60 // sec
  this.initialTime = 0
  this.powerTimer = null
  this.ui = {}
  this.mode = null
  colisionMargin = 20
  countdown = false
  this.pauseButtons = null
  this.rToken = null
  this.rTokenSecret = null
  this.countdownCounter = 3
  this.countdownText = 0
  this.screenshot = null
  this.restarting = false

  this.unlockedMusics = 0
  this.musicButton = null
  this.music = null
}

GameManager.prototype = {
  init: function (mode) {
    if (mode) this.mode = mode
    countdown = false
  },

  preload: function () {
    if (this.mode.preload) this.mode.preload()
  },

  create: function () {
    scale = 1

    players = []
    gameOver = false
    muteAudio = false
    paused = false
    totalTime = 0
    pauseTween = null
    bmd = null
    nextBallHigh = 0

    // create sound effects
    moveSounds = []
    moveSounds[0] = this.add.audio('move0')
    moveSounds[1] = this.add.audio('move1')
    successSound = this.add.audio('success')
    killSound = this.add.audio('kill')

    if (!this.restarting) this.music = null

    changeColor = true

    this.initialTime = this.game.time.totalElapsedSeconds()

    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.physics.arcade.gravity.y = 0

    var ui = this.ui
    ui.graphics = this.add.graphics(w2, h2)

    groupPowers = this.add.group()
    if (this.mode.name === 'tutorial') {
      countdown = false
      tempLabel = this.add.sprite(w2, h2, 'aux-stat')
      tempLabel.anchor.setTo(0.5, 0.5)
      tempLabel.alpha = 0.7
      tempLabel.width = (w2 * 2) - 100
      tempLabel.height = 340
      tempLabelHeaderText = this.add.text(w2, h2 - 80, "Welcome to Ninja Rush!", {
        font: '70px Trebuchet MS',
        fill: colorHex,
        align: 'center',
        fontWeight: 'bold'
      })
      tempLabelBodyText = this.add.text(w2, h2 + 50, "Before your parcel can be delivered to you,\nit first needs to be loaded up.\nTap away or hit spacebar to control the van!", {
        font: '35px Trebuchet MS',
        fill: colorHex,
        align: 'center',
        fontWeight: 'bold'
      })
      tempLabelHeaderText.anchor.setTo(0.5, 0.5)
      tempLabelBodyText.anchor.setTo(0.5, 0.5)
    }
    var nPlayers = 0
    if (this.mode.nPlayers) {
      nPlayers = this.mode.nPlayers
    }
    for (var i = 0; i <= nPlayers; i++) {
        if (this.mode.name === 'tutorial' || this.mode.name === 'main') {
          //Start from bottom
          players[i] = new Player(i,
            this.mode.name === 'main' ? w2 * 0.35 : w2,
            (h2 * 2) - 100,
            keys[i], this.mode, this.game)
        } else {
          players[i] = new Player(i,
            Math.cos((2 * Math.PI / (nPlayers + 1)) * i + Math.PI) * (w2 - 200) + w2,
            Math.sin((2 * Math.PI / (nPlayers + 1)) * i + Math.PI) * (h2 - 100) + h2,
            keys[i], this.mode, this.game)
        }
        players[i].create()
    }

    if (this.mode.create) {
      this.mode.create(this)
    }

    if (this.mode.name === 'main') {
      document.body.style.background = '#F3F7F0'
      this.game.stage.backgroundColor = '#F3F7F0'
      bgColor = Phaser.Color.hexToColor('#F3F7F0')
    } else {
      this.game.stage.backgroundColor = colorHexDark
      bgColor = Phaser.Color.hexToColor(colorHexDark)
    }

    if (this.mode.setCamera) this.mode.setCamera()
    borders = [0, this.game.world.width, 0, this.game.world.height]

    // create BitmapData
    bmd = this.add.bitmapData(this.game.world.width, this.game.world.height + 16)
    bmd.addToWorld()
    bmd.smoothed = false

    ui.overlay = this.add.sprite(0, 0, 'overlay')
    ui.overlay.scale.set(0)
    ui.overlay.alpha = 0.5
    ui.overlay.fixedToCamera = true

    if (!muteMusic) {
      menuMusic.volume = 1
      if (this.music && !this.restarting) {
        this.music.play()
        this.music.loop()
      }
    }

    var musicButton, musicText
    if (muteMusic) {
      musicButton = 'audiooff_button'
      musicText = 'music: off'
    } else {
      musicButton = 'audio_button'
      musicText = 'music: on'
    }

    var soundEffectsButton, soundEffectsText
    if (muteSoundEffects) {
      soundEffectsButton = 'audiooff_button'
      soundEffectsText = 'sound effects: off'
    } else {
      soundEffectsButton = 'audio_button'
      soundEffectsText = 'sound effects: on'
    }

    this.deathButtons = new ButtonList(this, this.game)
    this.deathButtons.add('restart_button', 'Play Again', this.restart)
	this.deathButtons.buttons[0].iconName = null
    this.deathButtons.textColor = colorHexDark
    this.deathButtons.setY(h2)

    this.deathButtons.create()

    this.deathButtons.hide()

    this.restarting = false
  },

  update: function () {
    this.game.forceSingleUpdate = true
    if (menuMusic && menuMusic.isPlaying && (menuMusic.volume === 1) && !gameOver && !muteMusic) {
      menuMusic.fadeOut(2000)
    }
    if (!paused) {
      if (!countdown) {
        totalTime += this.game.time.physicsElapsed
      }

      if (!gameOver) {
        if (this.game.canvas.style.cursor !== 'none' && !showMouse) {
          this.game.canvas.style.cursor = 'none'
        }
        // Give crown
        if (this.mode.update) {
          this.mode.update()
        }
        if (players[0].dead ||  players[0].finished) {
          this.endGame()
        }
      } else {
        this.deathButtons.update()
      }
    } else {
      this.countdownText.alpha = 0
    }

    for (var i = 0; i < players.length; i++) {
      players[i].update()
    }
  },

  endGame: function () {
    var ui = this.ui
    if (!gameOver) {
      var bottomY = this.deathButtons.getButton(this.deathButtons.length() - 1).y
      if (this.mode.endGame) {
        this.mode.endGame(bottomY)
      }

      ui.overlay.inputEnabled = false
      if (this.mode.sp) {
        this.game.time.events.add(Phaser.Timer.SECOND * 0.4, function () {
          ui.overlay.inputEnabled = true
        }, this)
      }

      ui.overlay.width = w2 * 2
      ui.overlay.height = h2 * 2

      this.deathButtons.show()
      if (this.game.canvas.style.cursor !== 'auto') {
        this.game.canvas.style.cursor = 'auto'
      }
      this.deathButtons.select(1)
    }
  },

  restart: function () {
    this.restarting = true
    if (this.mode.setScreen) {
      this.mode.setScreen()
    }
    this.state.restart(true, false, this.mode)
  },

  muteMusic: function () {
    if (muteMusic) {
      this.ui.musicButton.setIcon('audio_button')
      this.ui.musicButton.setText('music: on ')
      muteMusic = false
      if (this.mode.music) {
        this.mode.music.play()
        this.mode.music.loop()
      }
      else if (this.music) {
        this.music.play()
        this.music.loop()
      }
    } else {
      this.ui.musicButton.setIcon('audiooff_button')
      this.ui.musicButton.setText('music: off')
      muteMusic = true
      if (this.mode.music) this.mode.music.stop()
      else if (this.music) this.music.stop()
      if (menuMusic && menuMusic.isPlaying) {
        menuMusic.stop()
      }
    }
    localStorage.setItem('muteMusic', muteMusic)
  },

  muteSoundEffects: function () {
    if (muteSoundEffects) {
      this.ui.soundEffectsButton.setIcon('audio_button')
      this.ui.soundEffectsButton.setText('sound effects: on ')
      muteSoundEffects = false
    } else {
      this.ui.soundEffectsButton.setIcon('audiooff_button')
      this.ui.soundEffectsButton.setText('sound effects: off')
      muteSoundEffects = true
    }
    localStorage.setItem('muteSoundEffects', muteSoundEffects)
  },

  shutdown: function () {
    for (var i = 0; i < players.length; i++) {
      players[i].clearInput()
    }
    if (this.mode.music && !this.restarting) this.mode.music.stop()
    if (this.music && !this.restarting) this.music.stop()
  },

  selectPress: function () {
    this.deathButtons.selectPress()
  },

  selectRelease: function () {
    this.deathButtons.selectRelease()
  }

}
