/**
 * 2D Contour Plot Visualization using Canvas 2D API
 * Renders optimization functions as contour plots with animated gradient descent
 */

/**
 * 2D Visualizer Class for gradient descent on contour plots
 */
export class Visualizer2D {
  /**
   * @param {HTMLElement} container - DOM element to render into
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: 800,
      height: 600,
      contourLevels: 20,
      showContours: true,
      showHeatmap: true,
      showTrail: true,
      trailLength: 100,
      pointSize: 8,
      gridResolution: 100,
      colorScheme: 'viridis',
      ...options
    };
    
    // Canvas setup
    this.canvas = null;
    this.ctx = null;
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    
    // Visualization state
    this.currentFunction = null;
    this.contourData = null;
    this.currentPosition = { x: 0, y: 0 };
    this.trail = [];
    this.globalMinimum = null;
    
    // Animation state
    this.animationId = null;
    this.isDirty = true;
    
    this.initializeCanvas();
  }
  
  /**
   * Initialize canvas and context
   */
  initializeCanvas() {
    // Main canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.canvas.style.border = '1px solid #ccc';
    this.canvas.style.borderRadius = '4px';
    this.ctx = this.canvas.getContext('2d');
    
    // Offscreen canvas for contour rendering
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.options.width;
    this.offscreenCanvas.height = this.options.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    
    // Add to container
    this.container.appendChild(this.canvas);
    
    // Handle resize
    this.setupResizeHandler();
    
    // Start render loop
    this.startRenderLoop();
  }
  
  /**
   * Setup resize handler
   */
  setupResizeHandler() {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.resize(width, height);
      }
    });
    
    resizeObserver.observe(this.container);
  }
  
  /**
   * Resize the canvas
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    
    this.options.width = width;
    this.options.height = height;
    
    this.isDirty = true;
    this.generateContourData();
  }
  
  /**
   * Set the optimization function to visualize
   * @param {Object} func - Function object with value() and gradient() methods
   */
  setFunction(func) {
    this.currentFunction = func;
    this.globalMinimum = func.globalMinimum;
    this.generateContourData();
    this.isDirty = true;
  }
  
  /**
   * Generate contour data from function
   */
  generateContourData() {
    if (!this.currentFunction) return;
    
    const { bounds } = this.currentFunction;
    const resolution = this.options.gridResolution;
    
    // Create grid data
    const gridData = [];
    const step = (bounds.max - bounds.min) / (resolution - 1);
    
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    for (let i = 0; i < resolution; i++) {
      gridData[i] = [];
      for (let j = 0; j < resolution; j++) {
        const x = bounds.min + i * step;
        const y = bounds.min + j * step;
        const value = this.currentFunction.value(x, y);
        
        gridData[i][j] = {
          x, y, value,
          screenX: (i / (resolution - 1)) * this.options.width,
          screenY: (j / (resolution - 1)) * this.options.height
        };
        
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    }
    
    // Generate contour levels
    const contourLevels = [];
    for (let i = 0; i <= this.options.contourLevels; i++) {
      const level = minValue + (maxValue - minValue) * (i / this.options.contourLevels);
      contourLevels.push(level);
    }
    
    this.contourData = {
      grid: gridData,
      minValue,
      maxValue,
      levels: contourLevels,
      bounds,
      resolution,
      step
    };
    
    this.renderContours();
  }
  
  /**
   * Render contours to offscreen canvas
   */
  renderContours() {
    if (!this.contourData) return;
    
    const { grid, minValue, maxValue, levels } = this.contourData;
    const resolution = this.options.gridResolution;
    
    // Clear offscreen canvas
    this.offscreenCtx.fillStyle = '#ffffff';
    this.offscreenCtx.fillRect(0, 0, this.options.width, this.options.height);
    
    // Render heatmap if enabled
    if (this.options.showHeatmap) {
      this.renderHeatmap();
    }
    
    // Render contour lines if enabled
    if (this.options.showContours) {
      this.renderContourLines();
    }
    
    // Render axes and labels
    this.renderAxes();
  }
  
  /**
   * Render heatmap background
   */
  renderHeatmap() {
    const { grid, minValue, maxValue } = this.contourData;
    const resolution = this.options.gridResolution;
    
    const imageData = this.offscreenCtx.createImageData(this.options.width, this.options.height);
    const data = imageData.data;
    
    for (let x = 0; x < this.options.width; x++) {
      for (let y = 0; y < this.options.height; y++) {
        // Map screen coordinates to grid coordinates
        const gridX = Math.floor((x / this.options.width) * (resolution - 1));
        const gridY = Math.floor((y / this.options.height) * (resolution - 1));
        
        if (gridX < resolution && gridY < resolution) {
          const value = grid[gridX][gridY].value;
          const normalized = (value - minValue) / (maxValue - minValue);
          const color = this.getColorFromValue(normalized);
          
          const index = (y * this.options.width + x) * 4;
          data[index] = color.r;     // R
          data[index + 1] = color.g; // G
          data[index + 2] = color.b; // B
          data[index + 3] = 128;     // A (semi-transparent)
        }
      }
    }
    
    this.offscreenCtx.putImageData(imageData, 0, 0);
  }
  
  /**
   * Render contour lines
   */
  renderContourLines() {
    const { grid, levels } = this.contourData;
    const resolution = this.options.gridResolution;
    
    this.offscreenCtx.strokeStyle = '#333333';
    this.offscreenCtx.lineWidth = 1;
    this.offscreenCtx.globalAlpha = 0.7;
    
    // Use marching squares algorithm for contour lines
    for (const level of levels) {
      this.offscreenCtx.beginPath();
      
      for (let i = 0; i < resolution - 1; i++) {
        for (let j = 0; j < resolution - 1; j++) {
          const cell = [
            grid[i][j],
            grid[i + 1][j],
            grid[i + 1][j + 1],
            grid[i][j + 1]
          ];
          
          this.drawContourInCell(cell, level);
        }
      }
      
      this.offscreenCtx.stroke();
    }
    
    this.offscreenCtx.globalAlpha = 1;
  }
  
  /**
   * Draw contour line in a grid cell using marching squares
   * @param {Array} cell - Four corner points of the cell
   * @param {number} level - Contour level value
   */
  drawContourInCell(cell, level) {
    // Simplified marching squares implementation
    const [tl, tr, br, bl] = cell;
    const values = [tl.value, tr.value, br.value, bl.value];
    
    // Create binary representation
    let config = 0;
    if (values[0] > level) config |= 1;
    if (values[1] > level) config |= 2;
    if (values[2] > level) config |= 4;
    if (values[3] > level) config |= 8;
    
    // Interpolation helper
    const interpolate = (p1, p2, v1, v2) => {
      if (Math.abs(v1 - v2) < 1e-10) return p1;
      const t = (level - v1) / (v2 - v1);
      return {
        screenX: p1.screenX + t * (p2.screenX - p1.screenX),
        screenY: p1.screenY + t * (p2.screenY - p1.screenY)
      };
    };
    
    // Calculate edge intersections
    const edges = [];
    if (config & 1 && config & 2) { // Top edge
      edges.push(interpolate(tl, tr, values[0], values[1]));
    }
    if (config & 2 && config & 4) { // Right edge
      edges.push(interpolate(tr, br, values[1], values[2]));
    }
    if (config & 4 && config & 8) { // Bottom edge
      edges.push(interpolate(br, bl, values[2], values[3]));
    }
    if (config & 8 && config & 1) { // Left edge
      edges.push(interpolate(bl, tl, values[3], values[0]));
    }
    
    // Draw line segments
    if (edges.length >= 2) {
      this.offscreenCtx.moveTo(edges[0].screenX, edges[0].screenY);
      this.offscreenCtx.lineTo(edges[1].screenX, edges[1].screenY);
    }
  }
  
  /**
   * Render coordinate axes and labels
   */
  renderAxes() {
    const { bounds } = this.contourData;
    
    this.offscreenCtx.strokeStyle = '#666666';
    this.offscreenCtx.lineWidth = 1;
    this.offscreenCtx.font = '12px Arial';
    this.offscreenCtx.fillStyle = '#333333';
    
    // Draw axes
    this.offscreenCtx.beginPath();
    
    // X-axis
    const yZero = this.worldToScreenY(0);
    if (yZero >= 0 && yZero <= this.options.height) {
      this.offscreenCtx.moveTo(0, yZero);
      this.offscreenCtx.lineTo(this.options.width, yZero);
    }
    
    // Y-axis
    const xZero = this.worldToScreenX(0);
    if (xZero >= 0 && xZero <= this.options.width) {
      this.offscreenCtx.moveTo(xZero, 0);
      this.offscreenCtx.lineTo(xZero, this.options.height);
    }
    
    this.offscreenCtx.stroke();
    
    // Add tick marks and labels
    this.drawAxisLabels();
  }
  
  /**
   * Draw axis labels and tick marks
   */
  drawAxisLabels() {
    const { bounds } = this.contourData;
    const numTicks = 5;
    
    this.offscreenCtx.fillStyle = '#333333';
    this.offscreenCtx.textAlign = 'center';
    this.offscreenCtx.textBaseline = 'top';
    
    // X-axis labels
    for (let i = 0; i <= numTicks; i++) {
      const value = bounds.min + (bounds.max - bounds.min) * (i / numTicks);
      const x = (i / numTicks) * this.options.width;
      
      this.offscreenCtx.fillText(
        value.toFixed(1),
        x,
        this.options.height - 20
      );
    }
    
    this.offscreenCtx.textAlign = 'left';
    this.offscreenCtx.textBaseline = 'middle';
    
    // Y-axis labels
    for (let i = 0; i <= numTicks; i++) {
      const value = bounds.max - (bounds.max - bounds.min) * (i / numTicks);
      const y = (i / numTicks) * this.options.height;
      
      this.offscreenCtx.fillText(
        value.toFixed(1),
        5,
        y
      );
    }
  }
  
  /**
   * Get color from normalized value using color scheme
   * @param {number} value - Normalized value (0-1)
   * @returns {Object} RGB color object
   */
  getColorFromValue(value) {
    // Clamp value
    value = Math.max(0, Math.min(1, value));
    
    switch (this.options.colorScheme) {
      case 'viridis':
        return this.viridisColormap(value);
      case 'plasma':
        return this.plasmaColormap(value);
      case 'jet':
        return this.jetColormap(value);
      default:
        return this.viridisColormap(value);
    }
  }
  
  /**
   * Viridis colormap implementation
   * @param {number} t - Value between 0 and 1
   * @returns {Object} RGB color
   */
  viridisColormap(t) {
    const a = [0.2777273272234177, 0.005407344544966578, 0.3340998053353061];
    const b = [0.1050930431085774, 1.404613529898575, 1.384590162594685];
    const c = [-0.3308618287255563, 0.214847559468213, 0.09509516302823659];
    const d = [-4.634230498983486, -5.799100973351585, -19.33244095627987];
    const e = [6.228269936347081, 14.17993336680509, 56.69055260068105];
    const f = [4.776384997670288, -13.74514537774601, -65.35303263337234];
    const g = [-5.435455855934631, 4.645852612178535, 26.3124352495832];
    
    const r = a[0] + b[0] * t + c[0] * t * t + d[0] * t * t * t + e[0] * t * t * t * t + f[0] * Math.pow(t, 5) + g[0] * Math.pow(t, 6);
    const g_val = a[1] + b[1] * t + c[1] * t * t + d[1] * t * t * t + e[1] * t * t * t * t + f[1] * Math.pow(t, 5) + g[1] * Math.pow(t, 6);
    const b_val = a[2] + b[2] * t + c[2] * t * t + d[2] * t * t * t + e[2] * t * t * t * t + f[2] * Math.pow(t, 5) + g[2] * Math.pow(t, 6);
    
    return {
      r: Math.round(Math.max(0, Math.min(1, r)) * 255),
      g: Math.round(Math.max(0, Math.min(1, g_val)) * 255),
      b: Math.round(Math.max(0, Math.min(1, b_val)) * 255)
    };
  }
  
  /**
   * Jet colormap implementation
   * @param {number} t - Value between 0 and 1
   * @returns {Object} RGB color
   */
  jetColormap(t) {
    const r = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * t - 3)));
    const g = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * t - 2)));
    const b = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * t - 1)));
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
  
  /**
   * Plasma colormap implementation
   * @param {number} t - Value between 0 and 1
   * @returns {Object} RGB color
   */
  plasmaColormap(t) {
    const r = 0.05 + 0.95 * Math.pow(t, 0.4);
    const g = Math.pow(t, 2.5);
    const b = Math.sin(Math.PI * t * 0.5);
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
  
  /**
   * Update visualization with current optimization state
   * @param {Object} state - Current optimizer state
   */
  updateVisualization(state) {
    this.currentPosition = state.position;
    
    // Add to trail if enabled
    if (this.options.showTrail) {
      this.trail.push({ ...state.position });
      
      // Limit trail length
      if (this.trail.length > this.options.trailLength) {
        this.trail.shift();
      }
    }
    
    this.isDirty = true;
  }
  
  /**
   * Convert world coordinates to screen coordinates
   * @param {number} x - World X coordinate
   * @returns {number} Screen X coordinate
   */
  worldToScreenX(x) {
    if (!this.contourData) return 0;
    const { bounds } = this.contourData;
    return ((x - bounds.min) / (bounds.max - bounds.min)) * this.options.width;
  }
  
  /**
   * Convert world coordinates to screen coordinates
   * @param {number} y - World Y coordinate
   * @returns {number} Screen Y coordinate
   */
  worldToScreenY(y) {
    if (!this.contourData) return 0;
    const { bounds } = this.contourData;
    return ((bounds.max - y) / (bounds.max - bounds.min)) * this.options.height;
  }
  
  /**
   * Render current frame
   */
  render() {
    if (!this.isDirty) return;
    
    // Clear main canvas
    this.ctx.clearRect(0, 0, this.options.width, this.options.height);
    
    // Draw contour background
    if (this.contourData) {
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
    
    // Draw global minimum
    this.drawGlobalMinimum();
    
    // Draw trail
    this.drawTrail();
    
    // Draw current position
    this.drawCurrentPosition();
    
    this.isDirty = false;
  }
  
  /**
   * Draw global minimum marker
   */
  drawGlobalMinimum() {
    if (!this.globalMinimum) return;
    
    const x = this.worldToScreenX(this.globalMinimum.x);
    const y = this.worldToScreenY(this.globalMinimum.y);
    
    this.ctx.fillStyle = '#00ff00';
    this.ctx.strokeStyle = '#006600';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Add label
    this.ctx.fillStyle = '#006600';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Global Min', x, y - 15);
  }
  
  /**
   * Draw optimization trail
   */
  drawTrail() {
    if (!this.options.showTrail || this.trail.length < 2) return;
    
    this.ctx.strokeStyle = '#ff6600';
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.7;
    
    this.ctx.beginPath();
    for (let i = 0; i < this.trail.length; i++) {
      const point = this.trail[i];
      const x = this.worldToScreenX(point.x);
      const y = this.worldToScreenY(point.y);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
    
    this.ctx.globalAlpha = 1;
  }
  
  /**
   * Draw current optimization position
   */
  drawCurrentPosition() {
    const x = this.worldToScreenX(this.currentPosition.x);
    const y = this.worldToScreenY(this.currentPosition.y);
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.strokeStyle = '#800000';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.options.pointSize, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }
  
  /**
   * Clear the optimization trail
   */
  clearTrail() {
    this.trail = [];
    this.isDirty = true;
  }
  
  /**
   * Reset visualization
   */
  reset() {
    this.currentPosition = { x: 0, y: 0 };
    this.clearTrail();
  }
  
  /**
   * Toggle contour lines visibility
   * @param {boolean} showContours - Whether to show contour lines
   */
  setContoursVisibility(showContours) {
    this.options.showContours = showContours;
    this.renderContours();
    this.isDirty = true;
  }
  
  /**
   * Toggle heatmap visibility
   * @param {boolean} showHeatmap - Whether to show heatmap
   */
  setHeatmapVisibility(showHeatmap) {
    this.options.showHeatmap = showHeatmap;
    this.renderContours();
    this.isDirty = true;
  }
  
  /**
   * Set color scheme
   * @param {string} scheme - Color scheme name
   */
  setColorScheme(scheme) {
    this.options.colorScheme = scheme;
    this.renderContours();
    this.isDirty = true;
  }
  
  /**
   * Start render loop
   */
  startRenderLoop() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.render();
    };
    animate();
  }
  
  /**
   * Stop render loop and cleanup
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.canvas && this.container.contains(this.canvas)) {
      this.container.removeChild(this.canvas);
    }
  }
} 