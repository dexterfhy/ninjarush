var Main = function (game) {
  this.sp = true
  this.game = game
  this.spawnPowers = false
  this.cellSize = 64
  this.name = 'main'
}

Main.prototype = {
  create: function () {
    this.score = 0
    this.goalGroup = this.game.add.group()
    this.obstacleGroup = this.game.add.group()
    this.lastPoint = null
    this.player = players[0]

    var highscoreTrophy = this.game.add.sprite(w2 * 0.1, h2 * 0.06, 'main-trophy')
    highscoreTrophy.scale.set(0.15)
    highscoreTrophy.anchor.setTo(0.5, 0.5)
    this.updateHighScoreText(false)

    this.createEndpoint()
    this.createObstacles()
    this.createBoundaries()
    this.createMiscellaneous()
    this.displayRyoMessage()

    this.runtime = 0.0
    this.runtimeEnded = false
  },

  createEndpoint: function () {
    var home = this.game.add.sprite((w2 * 2) - 140, h2 * 0.35, 'main-home')
    home.scale.set(0.6)
    home.anchor.setTo(0.5, 0.5)
    this.game.physics.enable(home, Phaser.Physics.ARCADE)
	home.body.setSize(home.body.width * 0.75, home.body.height * 0.75, 0, 0) //Decreasing collision size (?)

    this.goalGroup.add(home)
  },

  createObstacles: function () {
    for (var i = 0; i < mainObstacles.length; i++) {
        var tempObstacle = this.game.add.sprite(
            (mainObstacles[i]['xScale'] * w2 * 2) + mainObstacles[i]['xAdjust'],
            (mainObstacles[i]['yScale'] * h2 * 2) + mainObstacles[i]['yAdjust'],
            mainObstacles[i]['name']
        )
        tempObstacle.scale.set(0.8)
        tempObstacle.alpha = 1.0
        tempObstacle.anchor.setTo(0.5, 0.5)

        this.game.physics.enable(tempObstacle, Phaser.Physics.ARCADE)
        tempObstacle.body.setSize(tempObstacle.body.width * 0.9, tempObstacle.body.height * 0.9, 0, 0) //Decreasing collision size (?)

        this.obstacleGroup.add(tempObstacle)
    }
  },

  createBoundaries: function () {
    var topBoundary = this.game.add.sprite(0, 20, 'bar-boundary')
    topBoundary.anchor.setTo(0.5, 1.0)
    this.game.physics.enable(topBoundary, Phaser.Physics.ARCADE)
    this.obstacleGroup.add(topBoundary)

    var bottomBoundary = this.game.add.sprite(0, (h2 * 2) - 20, 'bar-boundary')
    bottomBoundary.anchor.setTo(0.5, 0)
    this.game.physics.enable(bottomBoundary, Phaser.Physics.ARCADE)
    this.obstacleGroup.add(bottomBoundary)
  },

  createMiscellaneous: function () {
    var ryoWaving = this.game.add.sprite((w2 * 2) - 110, (h2 * 2) - 80, 'main-ryo')
    ryoWaving.scale.set(0.8)
    ryoWaving.anchor.setTo(0.5, 0.5)
    this.game.physics.enable(ryoWaving, Phaser.Physics.ARCADE)
    this.obstacleGroup.add(ryoWaving)
  },

  displayRyoMessage: function () {
    countdown = false
    tempLabel = this.game.add.sprite((w2 * 2) - 250, (h2 * 2) - 320, 'main-bubble')
    tempLabel.anchor.setTo(0.5, 0.5)
    tempLabel.alpha = 0.0
    tempLabel.width = w2 - 80
    tempLabel.height = 300
    tempLabel.depth = 999

    tempLabelText = this.game.add.text((w2 * 2) - 270, (h2 * 2) - 350, "You're almost there!\n\nNow help me deliver\nyour parcel home.", {
        font: '35px Trebuchet MS',
        fill: '#0C0F12',
        align: 'left',
        fontWeight: 'bold'
    })
    tempLabelText.anchor.setTo(0.5, 0.5)
    tempLabelText.alpha = 0.0

    this.game.time.events.add(Phaser.Timer.SECOND * 0.5, function () {
        this.game.add.tween(tempLabel).to({ alpha: 0.7 }, 1500, Phaser.Easing.Linear.None, true)
        this.game.add.tween(tempLabelText).to({ alpha: 0.7 }, 1500, Phaser.Easing.Linear.None, true)
    }, this)
  },

  update: function () {},

  reachGoal: function (playerSprite, homeSprite, player) {
  	this.game.time.events.remove(this.runtimeTimer)
	this.setHighScore(this.runtime)
  },

  getScore: function () {
    return this.score
  },

  getHighScore: function () {
    var score = parseFloat(localStorage.getItem('highScore'), 10)
    if (isNaN(score)) {
      return 0.0
    } else {
      return score
    }
  },

  setHighScore: function (score) {
    if (!this.getHighScore() || score < this.getHighScore()) {
      localStorage.setItem('highScore', score)
	  this.updateHighScoreText(true)
      this.showEndgameText(successWithNewHighScoreLines[Math.floor(Math.random() * successWithNewHighScoreLines.length)]['text'])
      this.submitScore(score)
    } else {
      this.showEndgameText(successWithoutHighScoreLines[Math.floor(Math.random() * successWithoutHighScoreLines.length)]['text'])
    }
  },

  submitScore: function (score) {
  	var headers = {}
  	headers['Content-Type'] = 'application/json'

  	$.ajax({
  		url: "http://localhost:9000/game-result",
  		type: "POST",
  		headers: headers,
  		data: JSON.stringify({
  			code: localStorage.getItem('code'),
  			score: score
  		}),
    	dataType: 'json',
  		success: result => {
		  if (this.submittedResult) this.submittedResult.destroy()
		  console.log(result)
		  var text = 'You are #' + result.data.position + ' out of ' + result.data.totalResults + ' player(s).'
		  text += '\n\nTop score for Today: ' + result.data.topScore.toFixed(2) + 's'
		  if (score < 5.0) text += "\n\n(" + score.toFixed(2) + "s?! I gotta say that's pretty sus.)"

		  this.submittedResult = this.game.add.text(w2, h2 * 1.4, text, {
			font: '37px Trebuchet MS',
			fill: '#ffffff',
			align: 'center',
			fontWeight: 'bold'})
		  this.submittedResult.anchor.setTo(0.5, 0.5)
  		},
  		error: error => {
			console.log('Error! ', error) //Ignore
		}
	})
  },

  kill: function (other) {
  	this.game.time.events.remove(this.runtimeTimer)

  	if (other.key === 'main-ryo') {
    	this.showEndgameText(ryoDeathLines[Math.floor(Math.random() * ryoDeathLines.length)]['text'])
  	} else {
    	this.showEndgameText(deathLines[Math.floor(Math.random() * deathLines.length)]['text'])
  	}
  },

  pause: function () {
    if (this.shrink && this.shrink.sprite && this.shrink.sprite.animations) {
      this.shrink.sprite.animations.paused = true
    }
  },

  unPause: function () {
    if (this.shrink && this.shrink.sprite && this.shrink.sprite.animations) {
      this.shrink.sprite.animations.paused = false
    }
  },

  setScreen: function () {
    adjustScreen(this.game)
  },

  updateRuntime: function() {
    this.runtimeText = this.game.add.text(w2 * 2 * 0.92, h2 * 0.08, this.runtime.toFixed(2) + ' s', {
        font: '40px Trebuchet MS',
        fill: '#0C0F12',
        align: 'center',
        fontWeight: 'bold'})
    this.runtimeText.anchor.setTo(0.5, 0.5)
    this.runtimeTimer = this.game.time.events.loop(Phaser.Timer.SECOND / 100, this.setMainGameTimer, this)
  },

  setMainGameTimer: function () {
    this.runtime += 0.01
    this.runtimeText.setText(this.runtime.toFixed(2) + ' s')
  },

  updateHighScoreText: function (newHighScore) {
  	if (newHighScore) {
  		this.highscoreText.destroy()
  	}

  	var highscore = this.getHighScore()
    this.highscoreText = this.game.add.text(w2 * 0.28, h2 * 0.08, highscore == 0 ? '' : this.getHighScore().toFixed(2) + ' s', {
        font: '40px Trebuchet MS',
        fill: newHighScore ? '#8F1820' : '#0C0F12',
        align: 'center',
        fontWeight: 'bold'})
    this.highscoreText.anchor.setTo(0.5, 0.5)

    if (newHighScore) {
		this.runtimeText = this.game.add.text(w2 * 2 * 0.92, h2 * 0.08, this.runtime.toFixed(2) + ' s', {
			font: '40px Trebuchet MS',
			fill: '#8F1820',
			align: 'center',
			fontWeight: 'bold'})
    	this.runtimeText.anchor.setTo(0.5, 0.5)
    }
  },

  showEndgameText: function (endgameText) {
  	  if (this.endgameText) this.endgameText.destroy()

      this.endgameText = this.game.add.text(w2, h2 * 0.8, endgameText, {
        font: '50px Trebuchet MS',
        fill: '#ffffff',
        align: 'center',
        fontWeight: 'bold'})
      this.endgameText.anchor.setTo(0.5, 0.5)
  }

}