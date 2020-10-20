/* global scale, w2, h2, Phaser, groupPowers
*/
var Parcel = function (game, type, mode, x, y, currentScore) {
  this.mode = mode
  this.game = game
  this.type = type
  this.sprite = null
  this.spriteTween = null
  this.x = x
  this.y = y
  this.size = 1
  this.currentScore = currentScore
}

Parcel.prototype = {
  create: function () {
    if (this.type.indexOf('parcel') > -1) {
        this.size = 1
    }

    if (this.mode.name === 'tutorial' && this.currentScore === 0) {
        this.x = w2
        this.y = 300
    } else if (!this.x && this.mode.gridded) {
        this.x = this.game.rnd.integerInRange(32 / scale, 2 * w2 - 32 / scale)
        this.y = this.game.rnd.integerInRange(32 / scale, 2 * h2 - 32 / scale)
    }
    this.sprite = this.game.add.sprite(this.x, this.y, this.type)

    this.sprite.anchor.setTo(0.5, 0.5)
    this.sprite.scale.set(0.2)
    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE)

    this.sprite.name = this.type

    groupPowers.add(this.sprite)
  },

  setPosition: function (x, y) {
    this.sprite.x = x
    this.sprite.y = y
  },

  setAlpha: function (a) {
    this.sprite.alpha = a
  },

  setScale: function (s) {
    this.sprite.scale.setTo(s)
  }
}
