/* global Phaser, colorHex, shadeColor, muteSoundEffects, pressSound */
var Button = function (iconName, text, callback, buttonList, context, game) {
  this.text = text
  this.iconName = iconName
  this.callback = callback
  this.callback2 = null
  this.context = context
  this.game = game
  this.buttonList = buttonList

  this.number = null
  this.x = null
  this.y = null
  this.index = null
  this.graphics = null
  this.label = null
  this.icon = null
  this.button = null
  this.tween = {}

  this.w = 400
  this.h = 100
  this.selected = false
  this.enabled = true

  this.textColor = colorHex
}

Button.prototype = {
  create: function () {
    var x = this.x
    var y = this.y
    var w = this.w
    var h = this.h

    // Button background rectangle
    this.graphics = this.game.add.graphics(-w / 2, -h / 2)
    if (!this.textOnly) {
      this.graphics.lineStyle(0)
      this.graphics.beginFill(0xF7F7FF, 1)
      this.graphics.drawRect(0, 0, w, h)
      this.graphics.drawCircle(0, h / 2, h)
      this.graphics.drawCircle(w, h / 2, h)
    } 
    this.graphics.endFill()
    if (!this.enabled) this.disable()

    var offset = 40
    if (this.iconName == null) offset = 0

    // Button label
    this.label = this.game.add.text(offset, 0, this.text, {
      fill: this.textOnly ? 'white' : this.textColor,
      font: '60px Trebuchet MS',
      fontWeight: 'bold'
    })
    this.label.anchor.setTo(0.5, 0.5)
    this.initFontSize()

    // Button icon
    this.icon = this.game.add.sprite(-w / 2 + 30, 0, this.iconName)
    this.icon.scale.set(0.3, 0.3)
    this.icon.anchor.setTo(0.5, 0.5)

    // Button group
    this.button = this.game.add.button(x, y)
    // this.icon.hitArea = new Phaser.Rectangle(-80, -80, w, h)
    this.button.input.useHandCursor = true
    this.button.fixedToCamera = true

    // clickButton(this.button, this.callback, this.context, menuArray, this.index)
    this.button.addChild(this.graphics)
    this.button.addChild(this.icon)
    this.button.addChild(this.label)
    if (this.numberLabel) this.button.addChild(this.numberLabel)
    this.button.anchor.setTo(0.5, 0.5)

    var s = this.button.scale
    var tweenTime = 30 / this.game.time.slowMotion;

    this.tween = {
      press: this.game.add.tween(s).to({x: s.x * 0.9, y: s.y * 0.9}, tweenTime, Phaser.Easing.Linear.None, false),
      release: this.game.add.tween(s).to({x: s.x, y: s.y}, tweenTime, Phaser.Easing.Linear.None, false),
      over: this.game.add.tween(s).to({x: s.x * 1.2, y: s.y * 1.2}, tweenTime * 2, Phaser.Easing.Linear.None, false),
      out: this.game.add.tween(s).to({ x: s.x, y: s.y }, tweenTime * 2, Phaser.Easing.Linear.None, false)
    }

    // tween stuff
    this.button.onInputOver.add(function () {
      this.buttonList.selection = this.index
    }, this)

    this.tween.release.onComplete.add(function () {
      this.selected = false
      if (this.enabled && !this.tween.release.isRunning && !this.tween.press.isRunning && this.callback) {
        if (this.callback2 && this.game.input.x > this.x) this.callback2.call(this.context)
        else this.callback.call(this.context)
      }
    }, this)

    this.button.onInputOver.add(function () {
      this.tween.release.onComplete.active = true
    }, this)

    this.button.onInputOut.add(function () {
      this.tween.release.onComplete.active = false
    }, this)

    if (this.callback) {
      this.button.onInputDown.add(this.buttonDown, {
        tween: this.tween.press,
        tweenOut: this.tween.release,
        button: this
      }, this)

      this.button.onInputUp.add(this.buttonUp, {
        tween: this.tween.release,
        button: this
      }, this)
    }
  },

  initFontSize: function () {
    if (this.label.width > this.w - 106) {
      this.label.width = this.w - 100
      this.label.scale.y = this.label.scale.x
    } else {
      this.label.scale.set(1)
      this.label.height = this.h - 20
      this.label.scale.x = this.label.scale.y
    }

    if (this.label.height > this.h - 20) {
      this.label.height = this.h - 20
      this.label.scale.x = this.label.scale.y
    }
  },

  buttonDown: function () {
    if (this.button.enabled) {
      if (!muteSoundEffects) pressSound.play()
      this.tweenOut.onComplete.active = true
      this.tween.start()
    }
  },

  buttonUp: function () {
    if (this.button.enabled) this.tween.start()
  },

  select: function () {
    if (this.enabled) {
      this.selected = true
      this.buttonList.selection = this.index
      this.tween.over.start()
    }
  },

  deselect: function () {
    this.selected = false
    this.tween.out.start()
  },

  setIcon: function (iconName) {
    this.icon.loadTexture(iconName)
  },

  setText: function (text) {
    this.label.text = text
    this.initFontSize()
  },

  setPosition: function (x, y) {
    this.x = x
    this.y = y
    if (this.button !== null) {
      this.button.x = x
      this.button.y = y
    }
  },

  setIndex: function (index) {
    this.index = index
  },

  hide: function () {
    this.button.visible = false
  },

  show: function () {
    this.button.visible = true
  },

  enable: function () {
    if (this.graphics) this.graphics.tint = 0xFFFFFE
    this.enabled = true
  },

  disable: function () {
    if (this.graphics) this.graphics.tint = parseInt(shadeColor(this.textColor, 0.7).substring(1), 16)
    this.enabled = false
  },

  setTextSize: function (size) {
    this.label.fontSize = size
  },

  addSecondCallback: function (callback) {
    this.callback2 = callback
  }
}
