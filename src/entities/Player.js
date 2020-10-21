var Player = function (id, x, y, key, mode, game) {
  this.game = game
  this.mode = mode
  this.sprite = null
  this.score = 0
  this.direction = 1
  this.id = id
  this.x = x
  this.y = y
  this.key = key
  this.dead = false
  this.ready = false
  this.speed = 1
  this.angularVelocity = 1
  this.frameCount = 0
  this.keyText = null
  this.paused = false
  this.textTween = null
  this.showOneKey = true
  this.collectSemaphore = 0
  this.finished = false

  this.inputTimes = []
  this.autoMode = false
  this.totalTime = 0
  this.keyUpVar = true
  this.clicks = null

  this.usedCheckpointSize = false

  this.runtimeStarted = false
  this.runtimeEnded = false
}

Player.prototype = {
  create: function () {
    this.graphics = this.game.add.graphics(0, 0)

    var spriteName = this.mode.name === 'main' ? 'player-loaded' : 'player'

    this.sprite = this.game.add.sprite(this.x, this.y, spriteName)
    this.sprite.name = '' + this.id

    this.sprite.anchor.setTo(0.5, 0.5)

    if (this.y > h2 && !this.mode.sp) {
      this.sprite.rotation = Math.PI
    }
    this.color = Phaser.Color.hexToColor('#FFFFFF')

    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE)
    this.sprite.scale.set(0.06)
    this.sprite.fixedRotation = true
    this.sprite.angle = 180

    this.sprite.body.angularVelocity = this.direction * 200 * this.angularVelocity * this.speed * scale

    this.game.input.onDown.dispose()
    this.game.input.onUp.dispose()
    this.game.input.keyboard.onDownCallback = null
    this.game.input.keyboard.onUpCallback = null
    if (this.mode.sp) {
      this.game.input.onDown.add(this.keyPressed, this)
      this.game.input.onUp.add(this.keyUp, this)
      this.game.input.keyboard.addCallbacks(this, this.keyPressed, this.keyUp)
    } else {
      this.input = this.game.input.keyboard.addKey(this.key).onDown.add(this.keyPressed, this)
    }
    this.clicks = localStorage.getItem('mouseClicks')
  },

  update: function () {
    if (!this.paused && paused) {
      this.paused = true
      this.pause()
    } else if (this.paused && !paused) {
      this.paused = false
      this.unpause()
    }

    if (!this.paused) {
      this.totalTime += this.game.time.physicsElapsedMS
      if (this.autoMode && (this.totalTime) >= this.inputTimes[0]) {
        this.inputTimes.shift()
      }

      if (!this.sprite.alive) {
        this.kill()
      }

      // player movement
      if (!this.finished) {
        this.game.physics.arcade.velocityFromAngle(this.sprite.angle, 300 * this.speed * scale, this.sprite.body.velocity)
        this.sprite.body.angularVelocity = this.direction * 200 * this.angularVelocity * this.speed
      } else {
        this.sprite.body.velocity.set(0)
        this.sprite.body.angularVelocity = 0
      }
      this.frameCount = (this.frameCount + 1) % 1 / (this.speed * scale)

      if (this.dead) {
        this.sprite.kill()
      }

      this.game.physics.arcade.overlap(this.sprite, groupPowers, this.collect, null, this)

      if (this.mode.goalGroup) {
        this.game.physics.arcade.overlap(this.sprite, this.mode.goalGroup, this.reachGoal, null, this)
      }
      if (this.mode.obstacleGroup) {
        if (this.game.physics.arcade.overlap(this.sprite, this.mode.obstacleGroup, this.kill, null, this)) {
        }
      }

      // Border's collisions
      var xx = Math.cos(this.sprite.rotation) * 18 * scale + this.sprite.x
      var yy = Math.sin(this.sprite.rotation) * 18 * scale + this.sprite.y

      if ((xx + colisionMargin * scale) <= borders[0]) {
        this.sprite.x = borders[1] - Math.cos(this.sprite.rotation) * 30 * scale
      } else if ((xx - colisionMargin * scale) >= borders[1]) {
        this.sprite.x = borders[0] - Math.cos(this.sprite.rotation) * 30 * scale
      }

      if ((yy + colisionMargin * scale) <= borders[2]) {
        this.sprite.y = borders[3] - Math.sin(this.sprite.rotation) * 30 * scale
      } else if ((yy - colisionMargin * scale) >= borders[3]) {
        this.sprite.y = borders[2] - Math.sin(this.sprite.rotation) * 30 * scale
      }
    }
  },

  keyUp: function () {
    this.keyUpVar = true
  },

  keyPressed: function () {
    if (!countdown && this.keyUpVar) {
      if (!this.game.input.keyboard.isDown(Phaser.Keyboard.ESC)) {
        this.ready = true
        if (this.mode.sp) this.keyUpVar = false
        else {
          this.showOneKey = true
        }
        if (!this.dead && !gameOver && !paused) {
          this.clicks++
          localStorage.setItem('mouseClicks', this.clicks)
          this.inputTimes.push(this.totalTime)
          if (this.direction === 1) {
            this.direction = -1
            if (!muteSoundEffects && !paused) {
              moveSounds[0].play()
            }
          } else {
            this.direction = 1
            if (!muteSoundEffects) {
              moveSounds[1].play()
            }
          }
          if (!this.mode.sp && this.keyText.alpha === 1) {
            this.textTween = this.game.add.tween(this.keyText).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true)
          }
          if (tempLabel !== null && tempLabel.alpha === 0.7) {
            this.game.add.tween(tempLabel).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true)

            if (this.mode.name === 'tutorial') {
                if (tempLabelHeaderText) this.game.add.tween(tempLabelHeaderText).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true)
                if (tempLabelBodyText) this.game.add.tween(tempLabelBodyText).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true)
            } else {
                if (tempLabelText) this.game.add.tween(tempLabelText).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true)
            }
          }
        }
      }

      if (!this.runtimeStarted) {
        if (this.mode.updateRuntime) {
          this.runtimeStarted = true
          this.mode.updateRuntime()
        }
      }
    }
  },

  kill: function (player, other) {
    if (this.keyText) this.keyText.destroy()
    if (!this.dead && !this.finished) {
      if (this.mode.sp) {
        var deathScore = parseInt(localStorage.getItem('deathScore'), 10)
        if (isNaN(deathScore)) {
          deathScore = 0
        }
        localStorage.setItem('deathScore', deathScore + 1)
      }
      if (this.mode.sp || (!player && !other)) {
        this.dead = true
      }

      if (!muteSoundEffects && !this.mode.levelComplete) {
        killSound.play()
      }

      if (this.mode.kill) {
        this.mode.kill(other)
      }
    }
  },

  collect: function (player, power) {
    if (this.collectSemaphore === 0) {
      this.collectSemaphore = 1

      if (this.mode.collect) {
        this.mode.collect(player, power, this)
      }

      var scaleTo = 0
      var duration = 200
      var tween = Phaser.Easing.Linear.None
      if (this.finished) {
        scaleTo = 1.5
        duration = 1000
        tween = Phaser.Easing.Elastic.Out
      }

      // this.game.add.tween(power).to({ alpha: 0 }, 300, Phaser.Easing.Linear.None, true)
      var powerTween = this.game.add.tween(power.scale).to({x: scaleTo, y: scaleTo}, duration, tween, true)
      powerTween.onComplete.add(function () {
        if (!this.finished) {
          power.destroy()
          this.collectSemaphore = 0
        } else {
          var t = this.game.add.tween(power.scale)
          t.to({x: 2, y: 2}, 300, Phaser.Easing.Linear.None, true)
        }
      }, this)
    }
  },

  reachGoal: function (playerSprite, homeSprite) {
  	if (!this.finished) {
  		successSound.play()
    	this.mode.reachGoal(playerSprite, homeSprite, this)
  	}
  	this.finished = true
  },

  pause: function () {
    if (this.textTween) {
      this.textTween.pause()
    }
    this.sprite.body.angularVelocity = 0
    this.sprite.body.velocity.x = 0
    this.sprite.body.velocity.y = 0
  },

  unpause: function () {
    if (this.textTween) {
      this.textTween.resume()
    }
    this.sprite.body.angularVelocity = this.direction * 200 * this.angularVelocity * this.speed * scale
  },

  clearInput: function () {
    this.game.input.keyboard.removeKey(this.key)
  },

  setInputTimes: function (times) {
    this.autoMode = true
    this.inputTimes = times
  },

  render: function () {
    this.game.debug.body(this.sprite)
  }

}
