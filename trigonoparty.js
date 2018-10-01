let canvas = document.querySelector("canvas");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

const w = canvas.width;
const h = canvas.height;

const ctx = canvas.getContext("2d");
const x = w/2;
const y = h/2;
const r = h/3;
const step = 0.5;

const degToRad = deg => (deg/360) * 2 * Math.PI;

let degree = 135;

let fps = 0,
    cycle = performance.now();

const draw = () => {
  if (degree===360) {
    degree = 0;
  }
  
  let sin = Math.sin(degToRad(degree));
  let cos = Math.cos(degToRad(degree));
  let lineX = x + sin * r;
  let lineY = y + cos * r;
  
  degree += step;
  
  ctx.imageSmoothingQuality = "high"
  ctx.imageSmoothingEnabled = true;
  ctx.clearRect(0, 0, w, h);
  
  ctx.lineWidth = 1.5;
  
  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(w, y);
  ctx.stroke();
  
  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, h);
  ctx.stroke();

  ctx.strokeStyle = "#999";
  
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, 2 * Math.PI);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(lineX, lineY);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(lineX, lineY, 10, 0, 2 * Math.PI);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(lineX, lineY, 5, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.strokeStyle = "#00b52a";
  ctx.beginPath();
  ctx.moveTo(lineX, lineY);
  ctx.lineTo(x, lineY);
  ctx.stroke();
  
  // tangent
  ctx.strokeStyle = "#8700b5";
  ctx.beginPath();
  ctx.moveTo(lineX, lineY);
  ctx.lineTo(lineX, y);
  ctx.stroke();
  
  let sinHeight = y - lineY;
  let cosWidth = lineX - x;
  
  let oDegre = 90 - (degree % 90);
  
  if (cosWidth < 0 && sinHeight > 0 || cosWidth > 0 && sinHeight < 0) {
    oDegre = (degree % 90);
  }
  
  let tanOfoDegre = Math.tan(degToRad(oDegre));
  let tanDistance = sinHeight / tanOfoDegre;
  let cotDistance = cosWidth / (1/tanOfoDegre);
  
  let tanX = lineX + tanDistance;
  let cotY = lineY - cotDistance;
  
  if (cosWidth < 0 && sinHeight > 0 || cosWidth > 0 && sinHeight < 0) {
    tanX = lineX - tanDistance;
    cotY = lineY + cotDistance;
  }
  
  // tangent
  ctx.strokeStyle = "#f48c42";
  ctx.beginPath();
  ctx.moveTo(tanX, y);
  ctx.lineTo(lineX, lineY);
  ctx.stroke();
  
  // cotangent
  ctx.strokeStyle = "#f4427a";
  ctx.beginPath();
  ctx.moveTo(lineX, lineY);
  ctx.lineTo(x, cotY);
  ctx.stroke();
  
  // secant
  ctx.strokeStyle = "#4286f4";
  ctx.beginPath();
  ctx.moveTo(tanX, y);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  // cosecant
  ctx.strokeStyle = "#41cdf4";
  ctx.beginPath();
  ctx.moveTo(x, cotY);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  if (performance.now() - cycle > 1000) {
    console.log('FPS:', fps);
    cycle = performance.now();
    fps = 0;
  }
  
  fps++;
  window.requestAnimationFrame(draw);
};

draw();