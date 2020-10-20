var preloadGame = function (game) {
  this.game = game
  this.mode = null
  this.level = null
}

preloadGame.prototype = {
  init: function (mode, level) {
    this.mode = mode
    this.level = level
  },

  preload: function () {
    if (this.level != null) {
      this.game.load.text('level', this.level)
    }
  },

  create: function () {
    this.game.state.start('GameManager', true, false, this.mode)
  }

}
