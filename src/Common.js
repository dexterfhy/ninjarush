function shuffleArray (o) {
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {}
  return o
}

function adjustScreen (game) {
  var winW = window.innerWidth
  var winH = window.innerHeight
  var winRatio = winW / winH
  var height = Math.round(Math.sqrt(baseArea / winRatio))
  var width = Math.round(winRatio * height)

  game.width = width
  game.height = height
  game.canvas.width = width
  game.canvas.height = height
  game.renderer.resize(width, height)
  game.stage.width = width
  game.stage.height = height
  game.scale.width = width
  game.scale.height = height
  game.world.setBounds(0, 0, width, height)
  game.camera.setSize(width, height)
  game.camera.setBoundsToWorld()
  game.scale.refresh()

  w2 = width / 2
  h2 = height / 2
}

function setScreenFixed (w, h, game) {
  game.width = w
  game.height = h
  game.canvas.width = w
  game.canvas.height = h
  game.renderer.resize(w, h)
  game.stage.width = w
  game.stage.height = h
  game.scale.width = w
  game.scale.height = h
  game.world.setBounds(0, 0, w, h)
  game.camera.setSize(w, h)
  game.camera.setBoundsToWorld()
  game.scale.refresh()

  w2 = w / 2
  h2 = h / 2
}

function shadeColor (color, percent) {
  var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF
  return '#' + (0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1)
}

function changeBGColor (game) {
  chosenColor = game.rnd.integerInRange(0, 3)
  colorHex = bgColors[chosenColor]
  colorHexDark = bgColorsDark[chosenColor]
  document.body.style.background = colorHex
  game.stage.backgroundColor = colorHex
  changeColor = false
}

function getParamsFromUrl(url) {
     url = decodeURI(url);
     if (typeof url === 'string') {
         if (!url) {
             return {};
         }
         let params = url.split('?');
         let eachParamsArr = params[1].split('&');
         let obj = {};
         if (eachParamsArr && eachParamsArr.length) {
             eachParamsArr.map(param => {
                 let keyValuePair = param.split('=')
                 let key = keyValuePair[0];
                 let value = decodeURIComponent(keyValuePair[1]);
                 obj[key] = value;
             })
         }
         return obj;
     }
 }