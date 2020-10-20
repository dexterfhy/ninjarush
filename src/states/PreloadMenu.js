/* global Phaser, changingKeys*/

var preloadMenu = function (game) {}

preloadMenu.prototype = {
  preload: function () {
    this.game.load.image('start_button', 'assets/sprites/gui/ryo-hold-parcel2.png')
    this.game.load.image('main-ryo', 'assets/sprites/gui/ryo-waving.png')
    this.game.load.image('main-bubble', 'assets/sprites/gui/speech-bubble.png')

    this.game.load.image('aux-stat', 'assets/sprites/gui/stats/aux-stat.png')
    this.game.load.image('score', 'assets/sprites/gui/stats/score-general.png')

    this.game.load.audio('move0', 'assets/sfx/zig.wav')
    this.game.load.audio('move1', 'assets/sfx/zig.wav')
    this.game.load.audio('success', 'assets/sfx/door-slam-2.wav')
    this.game.load.audio('kill', 'assets/sfx/squish.wav')

    this.game.load.image('player', 'assets/sprites/game/player.png')
    this.game.load.image('player-loaded', 'assets/sprites/game/player-loaded.png')
    this.game.load.image('main-home', 'assets/sprites/game/home.png')
    this.game.load.image('main-trophy', 'assets/sprites/game/trophy.png')
    this.game.load.image('bar-boundary', 'assets/sprites/game/bar-boundary.jpg')
    this.game.load.image('building-small-one', 'assets/sprites/game/building-small-one.png')
    this.game.load.image('building-small-two', 'assets/sprites/game/building-small-two.png')
    this.game.load.image('building-medium', 'assets/sprites/game/building-medium.png')
    this.game.load.image('building-large-one', 'assets/sprites/game/building-large-one.png')
    this.game.load.image('building-large-two', 'assets/sprites/game/building-large-two.png')
    this.game.load.image('parcel', 'assets/sprites/game/parcel.png')

    this.game.load.image('overlay', 'assets/sprites/game/overlay.png')

    this.game.load.audio('dream', 'assets/music/dream.ogg')
  },

  create: function () {
    this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(this.keys.selectPress, this)
    this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onUp.add(this.keys.selectRelease, this)
    this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.keys.selectPress, this)
    this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onUp.add(this.keys.selectRelease, this)
    this.game.input.resetLocked = true

    var ryoRunning = this.game.add.sprite(w2, h2, 'ryo-running')
    ryoRunning.anchor.set(0.5)
    this.game.time.events.add(Phaser.Timer.SECOND * 3, function () {
      this.game.state.start('Menu')
    }, this)
    
  },

  keys: {
    selectPress: function () {
      if (this.state.states[this.game.state.current].selectPress && !changingKeys) {
        this.state.states[this.game.state.current].selectPress()
      }
    },

    selectRelease: function () {
      if (this.state.states[this.game.state.current].selectRelease && !changingKeys) {
        this.state.states[this.game.state.current].selectRelease()
      }
    }
  }

}
