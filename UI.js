var pixelPerSecond = 100;
var networkOpened = false, contentOpened = false;
var timeline = [
  [[0, 500], [1500, 3000], [5000, 7570], [8000, 9500]],
  [[500, 1000], [3000, 3100], [7570, 7600], [9500, 9590]],
], networkTimeline = [
  [[0, 500], [1500, 3000], [5000, 7570], [8000, 9500]],
  [[500, 1000], [3000, 3100], [7570, 7600], [9500, 9590]],
  [[0, 500], [1500, 3000], [5000], [8000, 9500]],
  [[500, 1000], [3000], [7570, 7600], [9500, 9590]],
], contentTimeline = [
  [[0, 500], [1500, 3000], [5000, 7570], [8000, 9500]],
  [[500, 1000], [3000, 3100], [7570, 7600], [9500, 9590]],
  [[0], [1500], [5000, 7570], [8000, 9500]],
  [[500, 1000], [3100], [7570, 7600], [9500, 9590]],
];

function init() {
  var ruler = document.getElementById('timelineRuler');
  var rulerCtx = ruler.getContext("2d");
  rulerCtx.fillStyle = "#fefefe";
  rulerCtx.fillRect(0,0,2000,50);
  rulerCtx.lineCap = "round";
  for (var t = 0; t < 2000/pixelPerSecond; t++) {
    rulerCtx.lineWidth = 1;
    rulerCtx.beginPath();
    rulerCtx.strokeStyle = "#2222ff";
    rulerCtx.moveTo(t*pixelPerSecond, 0);
    rulerCtx.lineTo(t*pixelPerSecond, 25);
    rulerCtx.stroke();
    rulerCtx.fillStyle = "#111";
    rulerCtx.font = "12pt Arial";
    rulerCtx.fillText("" + t + " s", t*pixelPerSecond + 1, 35);
    for (var ms = 1; ms < 10; ms++) {
      rulerCtx.lineWidth = 0.75;
      rulerCtx.strokeStyle = "#555555";
      rulerCtx.moveTo(t*pixelPerSecond + ms*pixelPerSecond/10, 0);
      rulerCtx.lineTo(t*pixelPerSecond + ms*pixelPerSecond/10, 15);
    }
    rulerCtx.stroke();
  }
  prepareTimeline(timeline);
  $("#networkCaption").click(openNetwork);
  $("#contentCaption").click(openContent);
  document.getElementById("timelineCanvas").addEventListener("DOMMouseScroll", mouseScrolled, true);
  document.getElementById("overlayDiv").addEventListener("DOMMouseScroll", mouseScrolled, true);
  document.getElementById("timelineCanvas").addEventListener("mousemove", onMouseMove, true);
}

function prepareTimeline(timeList, canvas, top, height, alpha) {
  canvas = canvas || document.getElementById('timelineCanvas').getContext("2d");
  canvas.globalAlpha = 1.0;
  canvas.fillStyle = "#fefefe";
  canvas.fillRect(0,0,2000,400);
  canvas.globalAlpha = alpha!=null?alpha:1.0;
  canvas.lineCap = "round";
  canvas.fillStyle = "#222222";
  height = height!=null? height: 400/timeList.length - 10;
  timeList.forEach(function(list, index) {
    list.forEach(function(coord) {
      createRect(canvas, (top==null?(5*index + 5*(index + 1)): top) + index*height, height, coord);
    });
  });
}

function createRect(canvas, top, height, [left, right]) {
  canvas.beginPath();
  var width = right!=null?(right-left)/1000*pixelPerSecond:10;
  left = left/1000*pixelPerSecond;
  var rad = Math.min(width/2, height/2, 20);
  canvas.moveTo(left + rad, top);
  canvas.lineTo(left + width - rad, top);
  canvas.quadraticCurveTo(left + width, top, left + width,top + rad);
  canvas.lineTo(left + width, top + height - rad);
  canvas.quadraticCurveTo(left + width, top + height, left + width - rad,top + height);
  canvas.lineTo(left + rad, top + height);
  canvas.quadraticCurveTo(left, top + height, left, top + height - rad);
  canvas.lineTo(left, top + rad);
  canvas.quadraticCurveTo(left, top, left + rad, top);
  canvas.fill();
}

var animateTime = 0;
function expandNetworkTimeline(canvas) {
  canvas = canvas || document.getElementById('timelineCanvas').getContext("2d");
  if (animateTime > 150) {
    prepareTimeline(networkTimeline);
    animateTime = 0;
    return;
  }
  var refreshRate = 1000/60;
  animateTime += refreshRate;
  var height = 190*(1 + animateTime/150);
  var alpha = (170 - animateTime)/150;
  prepareTimeline([timeline[0]], canvas, 5, height, alpha);
  window.mozRequestAnimationFrame(function() {expandNetworkTimeline(canvas);});
}

function collapseNetworkTimeline(canvas) {
  canvas = canvas || document.getElementById('timelineCanvas').getContext("2d");
  if (animateTime > 150) {
    prepareTimeline(timeline);
    animateTime = 0;
    return;
  }
  var refreshRate = 1000/60;
  animateTime += refreshRate;
  var height = 40 + 50*(170 - animateTime)/150;
  var alpha = (170 - animateTime)/150;
  prepareTimeline(networkTimeline, canvas, 5, height, alpha);
  window.mozRequestAnimationFrame(function() {collapseNetworkTimeline(canvas);});
}

function expandContentTimeline(canvas) {
  canvas = canvas || document.getElementById('timelineCanvas').getContext("2d");
  if (animateTime > 150) {
    prepareTimeline(contentTimeline);
    animateTime = 0;
    return;
  }
  var refreshRate = 1000/60;
  animateTime += refreshRate;
  var height = 190*(1 + animateTime/150);
  var alpha = (170 - animateTime)/150;
  prepareTimeline([timeline[1]], canvas, 400 - height, height, alpha);
  window.mozRequestAnimationFrame(function() {expandContentTimeline(canvas);});
}

function collapseContentTimeline(canvas) {
  canvas = canvas || document.getElementById('timelineCanvas').getContext("2d");
  if (animateTime > 150) {
    prepareTimeline(timeline);
    animateTime = 0;
    return;
  }
  var refreshRate = 1000/60;
  animateTime += refreshRate;
  var height = 40 + 50*(170 - animateTime)/150;
  var alpha = (170 - animateTime)/150;
  prepareTimeline(contentTimeline, canvas, 400 - height*contentTimeline.length, height, alpha);
  window.mozRequestAnimationFrame(function() {collapseContentTimeline(canvas);});
}

function mouseScrolled(e) {
  var open = e.detail;
  var network = e.clientY <= 200;
  if (open < -2) {
    if (networkOpened || contentOpened)
      return;
    else if (network)
      openNetwork();
    else
      openContent();
  } else if (open > 2) {
    if (networkOpened)
      closeNetwork();
    else if (contentOpened)
      closeContent();
  }
}

function openNetwork(event) {
  if (animateTime == 0)
    expandNetworkTimeline();
  document.getElementById("timelineCanvas").title = "Scroll back to go back";
  inNetwork = false;
  inContent = false;
  $("#overlayDiv").animate( {
    opacity: 0,
    top: '0px',
    left: '0px',
    'min-height': '0px',
    'min-width': '0px',
  }, 100);
  $("#contentDataTitle").animate( {
    opacity: 0,
    'min-height': '0px',
    'max-height': '0px',
  }, 200);
  $("#networkDataTitle").animate( {
    opacity: 1,
    'min-height': '400px',
    'max-height': '400px',
  }, 250, function() {
    networkOpened = true;
    $("#networkCaption").addClass("hidden");
    $("#networkDivisions").removeClass("hidden");
  });
}

function closeNetwork(event) {
  if (animateTime == 0)
    collapseNetworkTimeline();
  document.getElementById("timelineCanvas").title = "";
  document.getElementById("overlayDiv").title = "Scroll to view the detailed event schedule";
  $("#networkDataTitle").animate( {
    opacity: 1,
    'min-height': '200px',
    'max-height': '200px',
  }, 200);
  $("#contentDataTitle").animate( {
    opacity: 1,
    'min-height': '200px',
    'max-height': '200px',
  }, 250, function() {
    $("#networkDivisions").addClass("hidden");
    $("#networkCaption").removeClass("hidden");
    networkOpened = false;
  });
}

function openContent(event) {
  if (animateTime == 0)
    expandContentTimeline();
  inNetwork = false;
  inContent = false;
  document.getElementById("timelineCanvas").title = "Scroll back to go back";
  $("#overlayDiv").animate( {
    opacity: 0,
    top: '0px',
    left: '0px',
    'min-height': '0px',
    'min-width': '0px',
  }, 100);
  $("#networkDataTitle").animate( {
    opacity: 0,
    'min-height': '0px',
    'max-height': '0px',
  }, 200);
  $("#contentDataTitle").animate( {
    opacity: 1,
    'min-height': '400px',
    'max-height': '400px',
  }, 250, function() {
    contentOpened = true;
    $("#contentCaption").addClass("hidden");
    $("#contentDivisions").removeClass("hidden");
  });
}

function closeContent(event) {
  if (animateTime == 0)
    collapseContentTimeline();
  document.getElementById("timelineCanvas").title = "";
  document.getElementById("overlayDiv").title = "Scroll to view the detailed event schedule";
  $("#contentDataTitle").animate( {
    opacity: 1,
    'min-height': '200px',
    'max-height': '200px',
  }, 200);
  $("#networkDataTitle").animate( {
    opacity: 1,
    'min-height': '200px',
    'max-height': '200px',
  }, 250, function() {
    $("#contentDivisions").addClass("hidden");
    $("#contentCaption").removeClass("hidden");
    contentOpened = false;
  });
}
var lastId = -1;
function highlightElement(x,y) {
  var itemList = [[]];
  y -= 50;
  x -= 200;
  var canvas = document.getElementById("timelineContainer");
  if (networkOpened)
    itemList = networkTimeline[Math.floor(y/(400/networkTimeline.length))%networkTimeline.length];
  else if (contentOpened)
    itemList = contentTimeline[Math.floor(y/(400/contentTimeline.length))%contentTimeline.length];
  else
    return;
  var id = -1;
  for (var index = 0; index < itemList.length; index++) {
    var start = itemList[index][0];
    var end = itemList[index][1];
    if (!end)
      end = start + 10*1000/pixelPerSecond;
    if (x > (start/1000*pixelPerSecond - canvas.scrollLeft) && x < (end/1000*pixelPerSecond - canvas.scrollLeft)) {
      id = index;
      break;
    }
  }
  if (lastId == id)
    return;
  if (id > -1) {
    lastId = id;
    var top = (networkOpened? Math.floor(y/(400/networkTimeline.length))*(400/networkTimeline.length)
                            : Math.floor(y/(400/contentTimeline.length))*(400/contentTimeline.length));
    var topOffset = networkOpened?Math.floor(y/(400/networkTimeline.length)):Math.floor(y/(400/contentOpened.length));
    var width = !itemList[id][1]?10:(itemList[id][1]-itemList[id][0])/1000*pixelPerSecond;
    var height = networkOpened? 400/networkTimeline.length: 400/contentTimeline.length;
    height -= 10;
    $("#overlayDiv").animate( {
      opacity: 0.8,
      'background-color': 'rgba(100,150,200,0.2)',
      top: (50 + top + 2) + 'px',
      left: (itemList[id][0]/1000*pixelPerSecond) + 'px',
      'min-height': height + 'px',
      'min-width': width + 'px',
      'border-radius': '20px',
      '-moz-box-shadow': '0px 0px 3px highlight',
    }, 100, function() {
      document.getElementById("overlayDiv").title = "Some Data";
    });
  }
  else if (id == -1) {
    lastId = -1;
    $("#overlayDiv").animate( {
      opacity: 0,
      '-moz-box-shadow': 'none',
    }, 100, function() {
      document.getElementById("overlayDiv").title = "Scroll to view the detailed event schedule";
    });
  }
}

var inContent = false, inNetwork = false;
function onMouseMove(e) {
  if (contentOpened || networkOpened) {
    highlightElement(e.clientX, e.clientY);
    return;
  }
  var height = 400;
  var y = e.clientY;
  if (y <= height/2 && !inNetwork) {
    inNetwork = true;
    inContent = false;
    $("#overlayDiv").animate( {
      opacity: 0.2,
      top: '50px',
      left: '0px',
      'min-height':Math.floor(height/2) + 'px',
      'min-width': '2000px',
      'border-radius': '0px',
    }, 100);
  } else if (y > height/2 && !inContent) {
    inNetwork = false;
    inContent = true;
    $("#overlayDiv").animate( {
      opacity: 0.2,
      top: (Math.floor(height/2) + 50) + 'px',
      left: '0px',
      'min-height':Math.floor(height/2) + 'px',
      'min-width': '2000px',
      'border-radius': '0px',
    }, 100);
  }
}