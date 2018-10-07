{
  /**
   * Global config.
   */
  const config = {
    play: true,
    radius: null,
    step: 0.03,
    roundNumbers: true,
    drawRadius: true,
    drawXAxis: true,
    drawYAxis: true,
    drawSin: true,
    drawCos: true,
    drawTan: true,
    drawCot: true,
    drawSec: true,
    drawCsc: true,
    drawNameRadius: true,
    drawNameFPS: true,
    drawNameCredits: true,
    drawNameSin: true,
    drawNameCos: true,
    drawNameTan: true,
    drawNameCot: true,
    drawNameSec: true,
    drawNameCsc: true,
  };

  /**
   * Global state.
   */
  const state = {
    degree: 45,
  };

  /**
   * Private state.
   */
  const $state = {
    x: 0,
    y: 0,
    drag: false,
  };

  /**
   * Get elements.
   */
  const canvasWrapper = document.querySelector(".canvas-wrapper");
  const canvas = document.querySelector("canvas");

  /**
   * Resize handler.
   * Check if size actually changed.
   */
  const resize = () => {
    const width = canvasWrapper.clientWidth;
    const height = canvasWrapper.clientHeight;
    
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      config.radius = null;
    }
  };

  /**
   * Consts
   */
  const tPI = 2 * Math.PI; 
  const COLORS = {
    white: '#fff',
    snow: '#fafafa',
    gray: '#ccc',
    night: '#34495e',
    greenLight: '#E3F2E6',
    greenDark: '#179746',
    green: '#00B52A',
    purple: '#8700b5',
    orange: '#f48c42',
    pink: '#f4427a',
    blue: '#4286f4',
    cyan: '#41cdf4',
  };

  /**
   * Helper utils.
   */
  const degToRad = deg => deg / 360 * tPI;

  /**
   * Prepare canvas context.
   */
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingQuality = "high"
  ctx.imageSmoothingEnabled = true;

  /**
   * Drawing helpers.
   */
  const $drawText = (x, y, text, {
    color = COLORS.gray,
    size = 14,
    angle = 0,
    align = 'center',
    baseline = 'bottom',
  } = {}) => {
    ctx.font = `${size}px sans-serif`;

    if (angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(degToRad(angle));
      x = 0;
      y = 0;
    }

    ctx.textBaseline = baseline;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    if (angle) {
      ctx.restore();
    }
  };

  const $drawLine = (fromX, fromY, toX, toY, { color }) => {
    ctx.lineWidth = 1.5; // Default for now.
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
  };

  const $drawCircle = (x, y, r, { color, fill, startAngle = 0, endAngle = tPI, aCW = true }) => {
    ctx.moveTo(x, y);
    ctx.beginPath();
    fill && ctx.moveTo(x, y);
    ctx.arc(x, y, r, startAngle, endAngle, aCW);
    fill && ctx.closePath();
    ctx.lineWidth = 1.5; // Default for now.
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    fill ? ctx.fill() : ctx.stroke();
  };

  /**
   * FPS Calculation.
   */
  let FPS = 0;
  let lastDrawTime = performance.now();
  let lastFPSUpdateTime = lastDrawTime;

  const resetFPS = () => {
    FPS = 0;
    lastDrawTime = lastFPSUpdateTime = performance.now();
  };

  const calculateFPS = () => {
    const now = performance.now();

    if (now - lastFPSUpdateTime >= 100) {
      lastFPSUpdateTime = now;
      FPS = (1000 / (now - lastDrawTime)).toFixed(0);
    }
    
    lastDrawTime = now;

    return FPS;
  };

  /**
   * Draw scene.
   */
  const draw = (once) => {
    // Constants
    const w = canvas.width;
    const h = canvas.height;

    // Calculate core values.
    const x = $state.x = w / 2;
    const y = $state.y = h / 2;
    const r = config.radius = config.radius || Math.min(w, h) / 3;

    // Options.
    const step = config.step;
    const degree = state.degree;

    // State values.
    const degreeInRad = degToRad(degree);
    const sin = -Math.sin(degreeInRad);
    const cos = Math.cos(degreeInRad);
    const lineX = x + cos * r;
    const lineY = y + sin * r;
    const sinHeight = y - lineY;
    const cosWidth = lineX - x;

    // Findout the quadrant we are in.
    const quadrant = { '01': 1, '00': 2, '10': 3, '11': 4 }[`${+(sin>0)}${+(cos>0)}`];
    const evenQuad = (quadrant % 2);

    // Calculate complementary degree of main angle.
    const coDegree = evenQuad ? (90 - (degree % 90)) : (degree % 90);

    // Calculate tangent and cotangent distances.
    const tanOfCoDegree = Math.tan(degToRad(coDegree));
    const tanDistance = sinHeight / tanOfCoDegree;
    const cotDistance = cosWidth / (1 / tanOfCoDegree);
    
    // Calculate tangent and cotangent start/end positions.
    const tanX = evenQuad ? (lineX + tanDistance) : (lineX - tanDistance);
    const cotY = evenQuad ? (lineY - cotDistance) : (lineY + cotDistance);

    // Clear canvas.
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, w, h);
    
    // Draw main circle.
    $drawCircle(x, y, r, { color: COLORS.gray });
    // Draw core main filled circle.
    $drawCircle(x, y, 20, { color: COLORS.snow, fill: true });
    
    // Draw X Axis
    config.drawXAxis && $drawLine(0, y, w, y, { color: COLORS.gray });
    // Draw Y Axis
    config.drawYAxis && $drawLine(x, 0, x, h, { color: COLORS.gray });

    // Draw theta angle circle fill and stroke.
    $drawCircle(x, y, 20, { color: COLORS.greenLight, fill: true, endAngle: degToRad(360 - degree) });
    $drawCircle(x, y, 20, { color: COLORS.greenDark, endAngle: degToRad(360 - degree) });
    $drawText(x + 20, y - 15, `θ`, { color: COLORS.greenDark, align: 'left' });

    // Draw Radius Line
    config.drawRadius && $drawLine(x, y, lineX, lineY, { color: COLORS.night });

    // Draw origin point.
    $drawCircle(x, y, 3, { color: COLORS.night, fill: true });
    // Draw radius line end circle.
    $drawCircle(lineX, lineY, 3, { color: COLORS.night, fill: true });
    // Draw radius line end perimeter circle.
    $drawCircle(lineX, lineY, 10, { color: COLORS.gray });

    // Dont draw on right angles.
    if (degree % 90) {
      // Draw Sinus.
      config.drawSin && $drawLine(lineX, lineY, lineX, y, { color: COLORS.purple });
      // Draw Cosinus.
      config.drawCos && $drawLine(lineX, lineY, x, lineY, { color: COLORS.green });
      // Draw Tangent.
      config.drawTan && $drawLine(tanX, y, lineX, lineY, { color: COLORS.orange });
      // Draw Cotangent.
      config.drawCot && $drawLine(lineX, lineY, x, cotY, { color: COLORS.pink });
      // Draw Secant.
      config.drawSec && $drawLine(tanX, y, x, y, { color: COLORS.blue });
      // Draw Cosecant.
      config.drawCsc && $drawLine(x, cotY, x, y, { color: COLORS.cyan });

      // Draw radius text.
      config.drawNameRadius && $drawText(x + (lineX - x) / 2, y + (lineY - y) / 2, 'radius', { color: COLORS.night, angle: -degree });
      // Draw sinus text.
      config.drawNameSin && $drawText(lineX + 1, y + (lineY - y) / 2, 'sinus', { color: COLORS.purple, angle: 90 });
      // Draw cosinus text.
      config.drawNameCos && $drawText(x + (lineX - x) / 2, lineY - 2, 'cosinus', { color: COLORS.green });
      // Draw tangent text.
      config.drawNameTan && $drawText(lineX + (tanX - lineX) / 2, y - 5 + (lineY - y) / 2, 'tangent', { color: COLORS.orange, angle: evenQuad ? coDegree : -coDegree });
      // Draw cotangent text.
      config.drawNameCot && $drawText(x + (lineX - x) / 2, lineY - 5 + (cotY - lineY) / 2, 'cotangent', { color: COLORS.pink, angle: evenQuad ? coDegree : -coDegree });
      // Draw secant text.
      config.drawNameSec && $drawText(x + (tanX - x) / 2, y + 17, 'secant', { color: COLORS.blue });
      // Draw cosecant text.
      config.drawNameCsc && $drawText(x - 17, y + (cotY - y) / 2, 'cosecant', { color: COLORS.cyan, angle: 90 });
    }

    // Calculate FPS.
    config.drawNameFPS && config.play && !$state.drag && $drawText(5, 17, `FPS: ${calculateFPS() || '-'}`, { align: 'left' });

    // Draw name of author and help.
    config.drawNameCredits && $drawText(w - 10, h - 10, 'ramesaliyev / trigonoparty / 2018', { align: 'right' });
    config.drawNameCredits && $drawText(w - 10, 20, 'You can click & drag!', { align: 'right' });

    // Increase degre.
    config.play && !$state.drag && (state.degree += step);

    // Reset at the end of circle.
    if (state.degree > 360) {
      state.degree %= 360;
    } else if (state.degree < 0) {
      state.degree += 360;
    }

    // Set other states.
    state.degreeInRad = degreeInRad;
    state.sin = -sin;
    state.cos = cos;
    state.sinHeight = sinHeight;
    state.cosWidth = cosWidth;
    state.quadrant = quadrant;

    // Animate!
    !once && window.requestAnimationFrame(() => draw());
  };

  /**
   * Calculate and set degree from mouse position.
   */
  const setDegreeByClientPosition = (clientX, clienY) => {
    const opposite = -(clienY - $state.y);
    const adjacent = clientX - $state.x;
    let degree = Math.atan(opposite / adjacent) * 360 / tPI;

    if (adjacent < 0) {
      degree += 180;
    }
    
    state.degree = degree;
    
    // Force draw to avoid glitches!
    draw(true);
  };

  /**
   * Listen for canvas interaction!
   */
  canvas.addEventListener('mousedown', event => {
    $state.drag = true;
    setDegreeByClientPosition(
      event.offsetX,
      event.offsetY
    );
  });

  canvas.addEventListener('mousemove', event => {
    $state.drag && setDegreeByClientPosition(
      event.offsetX,
      event.offsetY
    );
  });

  document.body.addEventListener('mouseup', () => {
    $state.drag = false;
    resetFPS();
  });

  /**
   * Kick start!
   */
  resize();
  draw();

  /**
   * Helper functions.
   */
  const togglePlay = () => {
    config.play = !config.play;
    resetFPS();
  };

  /**
   * Export to window!
   */
  window.addEventListener('resize', resize);
  window.tp = {
    config,
    state,
    togglePlay,
  };
}