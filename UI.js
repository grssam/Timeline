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
  window.setTimeout(function() {expandNetworkTimeline(canvas);}, refreshRate);
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
  window.setTimeout(function() {collapseNetworkTimeline(canvas);}, refreshRate);
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
  window.setTimeout(function() {expandContentTimeline(canvas);}, refreshRate);
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
  window.setTimeout(function() {collapseContentTimeline(canvas);}, refreshRate);
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