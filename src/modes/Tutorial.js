var Tutorial = function (game) {
  this.sp = true
  this.game = game
  this.spawnPowers = false
  this.cellSize = 64
  this.name = 'tutorial'
}

Tutorial.prototype = {
  create: function () {
    this.rows = Math.floor(h2 * 1.9 / this.cellSize)
    this.columns = Math.floor(w2 * 1.9 / this.cellSize)
    this.marginX = (2 * w2 - this.columns * this.cellSize + this.cellSize) * 0.5
    this.marginY = (2 * h2 - this.rows * this.cellSize + this.cellSize) * 0.5
    this.score = 0
    this.obstacleGroup = this.game.add.group()
    this.pointsPow = []
    this.pointsObs = []
    this.lastPoint = null
    this.player = players[0]

    // create grid points
    for (var i = 0; i < this.columns; i++) {
      for (var j = 0; j < this.rows; j++) {
        this.pointsPow.push({x: i, y: j})
      }
    }
    this.pointsPow = shuffleArray(this.pointsPow)

    // create grid points
    for (i = 0; i < this.columns * 0.5; i++) {
      for (j = 0; j < this.rows * 0.5; j++) {
        this.pointsObs.push({x: i * 2, y: j * 2})
      }
    }
    this.pointsObs = shuffleArray(this.pointsObs)

    this.createParcel('parcel')
  },

  update: function () {},

  collect: function (playerSprite, powerSprite) {
  	pickupSound.play()

    if (powerSprite.name.indexOf('parcel') > -1) {
      this.score++
      this.createParcel('parcel')
    }
  },

  gridIsFull: function () {
    return (!this.pointsObs[0])
  },

  createParcel: function (type) {
    this.lastPoint = this.pointsPow.pop()
    var x = (this.lastPoint.x) * this.cellSize + this.marginX
    var y = (this.lastPoint.y) * this.cellSize + this.marginY
    var point = this.lastPoint
    this.pointsPow.push(point)
    this.pointsPow = shuffleArray(this.pointsPow)

    var parcel = new Parcel(this.game, type, this, x, y, this.score)
    parcel.create()

    for (var i = 0; i < this.pointsObs.length; i++) {
      if (JSON.stringify(this.pointsObs[i]) === JSON.stringify(this.lastPoint)) {
        this.pointsObs.splice(i, 1)
        break
      }
    }

    if (this.score === 1) {
	  localStorage.setItem('tutorialCompleted', 1)
	  this.player.sprite.loadTexture('player-loaded')

      this.countdownCounter = 5
      this.countdownText = this.game.add.text(w2, h2, getCountdown(this.countdownCounter), {
        font: '60px Trebuchet MS',
        fill: '#ffffff',
        align: 'center',
        fontWeight: 'bold'})
      this.countdownText.anchor.setTo(0.5, 0.5)
      this.game.time.events.loop(Phaser.Timer.SECOND, this.updateMainGameCountdown, this)

      this.game.time.events.add(Phaser.Timer.SECOND, this.showRandomText, this)
    }
  },

  updateMainGameCountdown: function () {
      this.countdownCounter--
      this.countdownText.setText(getCountdown(this.countdownCounter))
      if (this.countdownCounter === 0) {
        countdown = false
      }
      if (this.countdownCounter === -1) {
        this.countdownText.kill()
        this.startMainGame()
      }
  },

  showRandomText: function () {
    this.randomText = this.game.add.text(w2, (h2 * 2) - 50, "(FYI: Our drivers usually drive more steadily in real life.)", {
      font: '32px Trebuchet MS',
      fill: '#ffffff',
      align: 'left',
      fontStyle: 'italic'})
    this.randomText.anchor.setTo(0.5, 0.5)
  },

  setScreen: function () {
    adjustScreen(this.game)
  },

  startMainGame: function () {
    var mode = new Main(this.game)
    this.game.state.start('PreloadGame', true, false, mode)
  },

}

var getCountdown = counter => 'Well done!\n\nGame starting in ' + counter + '...'