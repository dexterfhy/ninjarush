var menu = function (game) {
  maxPlayers = 7
  defaultKeys = [
    Phaser.Keyboard.W + '',
    Phaser.Keyboard.P + '',
    Phaser.Keyboard.B + '',
    Phaser.Keyboard.Z + '',
    Phaser.Keyboard.M + '',
    Phaser.Keyboard.C + '',
    Phaser.Keyboard.R + '',
    Phaser.Keyboard.U + '']
  keys = []
  menuMusic = null
  this.ui = {}
  this.buttons = null
}

menu.prototype = {
  create: function () {
    pressSound = this.add.audio('sfx_press')
    setScreenFixed(baseH * 1.5, baseH * 1.1, this.game)
    savedCheckpoint = {}

    this.world.pivot.set(0, 0)
    this.world.angle = 0

    if (localStorage.getItem('keys') != null) {
      keys = JSON.parse(localStorage['keys'])
    } else {
      keys = defaultKeys
    }

    if (changeColor) changeBGColor(this.game)

    bgColor = Phaser.Color.hexToColor(colorHex)
    this.stage.backgroundColor = colorHex
    document.body.style.background = colorHex

    if (menuMusic === null) {
      menuMusic = this.add.audio('dream')
    }
    if (!menuMusic.isPlaying && !muteMusic) {
      menuMusic.loop = true
      menuMusic.play()
      menuMusic.volume = 1
    }
    var ui = this.ui

    var titleSize = 240
    var titleH = 200

    // Game Title
    ui.title = this.add.text(w2, titleH, 'Ninja Rush', {
      font: titleSize + 'px Impact',
      fill: '#ffffff',
      align: 'center'
    })
    ui.title.anchor.setTo(0.5, 0.5)
    this.buttons = new ButtonList(this, this.game)

    this.buttons.add('start_button', 'Start Driving!', this.startDriving)

    this.buttons.create()
    this.buttons.select(0)
  },

  update: function () {
    this.buttons.update()
  },

  play: function (mode) {
    if (mode.setScreen) {
      mode.setScreen()
    }
    this.game.state.start('PreloadGame', true, false, mode)
  },

  startDriving: function () {
    var mode = localStorage.getItem('tutorialCompleted') && localStorage.getItem('tutorialCompleted') == 1 ? new Main(this.game) : new Tutorial(this.game)
    this.play(mode)
  },

  selectPress: function () {
    this.buttons.selectPress()
  },

  selectRelease: function () {
    this.buttons.selectRelease()
  },

}
