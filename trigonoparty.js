{
  /**
   * Global config.
   */
  const config = {
    play: true,
    radius: null,
    step: 0.03,
    draw: {
      radius: true,
      xAxis: true,
      yAxis: true,
      sin: true,
      cos: true,
      tan: true,
      cot: true,
      sec: true,
      csc: true,
      nameRadius: true,
      nameFPS: true,
      nameCredits: true,
      nameSin: true,
      nameCos: true,
      nameTan: true,
      nameCot: true,
      nameSec: true,
      nameCsc: true,
    }
  };

  /**
   * Global state.
   */
  const state = {
    degree: 45,
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
    gray: '#CCC',
    night: '#34495e',
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

  const $drawCircle = (x, y, r, { color, fill }) => {
    ctx.lineWidth = 1.5; // Default for now.
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, tPI);
    fill ? ctx.fill() : ctx.stroke();
  };

  /**
   * FPS Calculation.
   */
  let FPS = 0;
  let lastDrawTime = performance.now();
  let lastFPSUpdateTime = lastDrawTime;

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
  const draw = () => {
    // Constants
    const w = canvas.width;
    const h = canvas.height;

    // Calculate core values.
    const x = w / 2;
    const y = h / 2;
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
    ctx.clearRect(0, 0, w, h);
    
    // Draw X Axis
    config.draw.xAxis && $drawLine(0, y, w, y, { color: COLORS.gray });
    // Draw Y Axis
    config.draw.yAxis && $drawLine(x, 0, x, h, { color: COLORS.gray });
    // Draw Radius Line
    config.draw.radius && $drawLine(x, y, lineX, lineY, { color: COLORS.night });

    // Draw main circle.
    $drawCircle(x, y, r, { color: COLORS.gray });
    // Draw origin point.
    $drawCircle(x, y, 5, { color: COLORS.gray, fill: true });
    // Draw origin point perimeter circle.
    $drawCircle(x, y, 20, { color: COLORS.gray });
    // Draw radius line end circle.
    $drawCircle(lineX, lineY, 5, { color: COLORS.gray, fill: true });
    // Draw radius line end perimeter circle.
    $drawCircle(lineX, lineY, 10, { color: COLORS.gray });
    
    // Dont draw on right angles.
    if (degree % 90) {
      // Draw Sinus.
      config.draw.sin && $drawLine(lineX, lineY, lineX, y, { color: COLORS.purple });
      // Draw Cosinus.
      config.draw.cos && $drawLine(lineX, lineY, x, lineY, { color: COLORS.green });
      // Draw Tangent.
      config.draw.tan && $drawLine(tanX, y, lineX, lineY, { color: COLORS.orange });
      // Draw Cotangent.
      config.draw.cot && $drawLine(lineX, lineY, x, cotY, { color: COLORS.pink });
      // Draw Secant.
      config.draw.sec && $drawLine(tanX, y, x, y, { color: COLORS.blue });
      // Draw Cosecant.
      config.draw.csc && $drawLine(x, cotY, x, y, { color: COLORS.cyan });

      // Draw radius text.
      config.draw.nameRadius && $drawText(x + (lineX - x) / 2, y + (lineY - y) / 2, 'radius', { color: COLORS.night, angle: -degree });
      // Draw sinus text.
      config.draw.nameSin && $drawText(lineX + 1, y + (lineY - y) / 2, 'sinus', { color: COLORS.purple, angle: 90 });
      // Draw cosinus text.
      config.draw.nameCos && $drawText(x + (lineX - x) / 2, lineY - 2, 'cosinus', { color: COLORS.green });
      // Draw tangent text.
      config.draw.nameTan && $drawText(lineX + (tanX - lineX) / 2, y - 5 + (lineY - y) / 2, 'tangent', { color: COLORS.orange, angle: evenQuad ? coDegree : -coDegree });
      // Draw cotangent text.
      config.draw.nameCot && $drawText(x + (lineX - x) / 2, lineY - 5 + (cotY - lineY) / 2, 'cotangent', { color: COLORS.pink, angle: evenQuad ? coDegree : -coDegree });
      // Draw secant text.
      config.draw.nameSec && $drawText(x + (tanX - x) / 2, y + 17, 'secant', { color: COLORS.blue });
      // Draw cosecant text.
      config.draw.nameCsc && $drawText(x - 17, y + (cotY - y) / 2, 'cosecant', { color: COLORS.cyan, angle: 90 });
    }

    // Calculate FPS.
    config.draw.nameFPS && config.play && $drawText(5, 17, `FPS: ${calculateFPS() || '-'}`, { align: 'left' });

    // Draw name of author.
    config.draw.nameCredits && $drawText(w - 10, h - 10, 'ramesaliyev / trigonoparty / 2018', { align: 'right' });

    // Increase degre.
    config.play && (state.degree += step);

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
    window.requestAnimationFrame(draw);
  };

  /**
   * Kick start!
   */
  resize();
  draw();

  /**
   * Export to window!
   */
  window.addEventListener('resize', resize);
  window.tp = {
    config,
    draw,
    state,
  };
}