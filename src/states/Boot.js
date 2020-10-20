var boot = function (game) {
  playCounter = 0
  w2 = 0
  h2 = 0
  changeColor = false
  muteMusic = false
  muteSoundEffects = false
  showMouse = false
  firstTime = true
  scale = 1
  changingKeys = false
  controllersSet = false
}

boot.prototype = {
  preload: function () {
    this.game.load.image('ryo-running', 'assets/sprites/gui/ryo-running.png')
  },

  create: function () {
    w2 = this.game.width / 2
    h2 = this.game.height / 2

    this.game.stage.disableVisibilityChange = true

    if (localStorage.getItem('muteMusic') === 'true') {
      muteMusic = true
    }

    if (localStorage.getItem('muteSoundEffects') === 'true') {
      muteSoundEffects = true
    }

    // Background colors
    // [green, red, purple, blue]
    bgColors = ['#8F1820']
    bgColorsDark = ['#8F1820']

    modesLB = ['CgkIr97_oIgHEAIQCQ', 'CgkIr97_oIgHEAIQCg', 'CgkIr97_oIgHEAIQCw']

    chosenColor = this.game.rnd.integerInRange(0, 0)
    colorHex = bgColors[chosenColor]
    colorHexDark = bgColorsDark[chosenColor]
    document.body.style.background = '#8F1820'
    this.stage.backgroundColor = '#8F1820'


    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.scale.pageAlignHorizontally = true
    this.scale.pageAlignVertically = true

    this.physics.startSystem(Phaser.Physics.ARCADE)

    this.stage.smoothed = true

    this.game.input.gamepad.start()

    this.state.start('PreloadMenu')
  }
}
