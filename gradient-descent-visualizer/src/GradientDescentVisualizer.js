/**
 * Main Gradient Descent Visualizer Class
 * Coordinates visualization, controls, and optimization
 */

import { Visualizer2D } from './visualization/Visualizer2D.js';
import { Visualizer3D } from './visualization/Visualizer3D.js';
import { GradientDescentOptimizer, createOptimizer } from './math/gradientDescent.js';
import { getBuiltInFunctions, CustomFunction } from './math/functions.js';

/**
 * Main GradientDescentVisualizer class
 * Provides a complete gradient descent visualization solution
 */
export class GradientDescentVisualizer {
  /**
   * @param {HTMLElement} container - DOM element to render into
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      mode: '2d', // '2d' or '3d'
      showControls: true,
      autoPlay: false,
      animationSpeed: 1.0,
      maxIterations: 1000,
      initialFunction: 'quadratic',
      initialPosition: { x: 2, y: 2 },
      learningRate: 0.01,
      ...options
    };
    
    // State management
    this.currentFunction = null;
    this.optimizer = null;
    this.visualizer = null;
    this.isPlaying = false;
    this.animationId = null;
    this.lastStepTime = 0;
    this.stepInterval = 100; // ms between steps
    
    // UI elements
    this.controlPanel = null;
    this.statsPanel = null;
    this.canvas3D = null;
    this.canvas2D = null;
    
    // Event callbacks
    this.onStateChange = null;
    this.onConvergence = null;
    this.onStep = null;
    
    this.initialize();
  }
  
  /**
   * Initialize the visualizer
   */
  initialize() {
    this.createLayout();
    this.createControls();
    this.setupInitialFunction();
    this.setupEventListeners();
    
    // Auto-start if requested
    if (this.options.autoPlay) {
      this.play();
    }
  }
  
  /**
   * Create the main layout structure
   */
  createLayout() {
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.fontFamily = 'Arial, sans-serif';
    
    // Create visualization container
    this.visualizationContainer = document.createElement('div');
    this.visualizationContainer.style.flex = '1';
    this.visualizationContainer.style.position = 'relative';
    this.visualizationContainer.style.minHeight = '400px';
    this.container.appendChild(this.visualizationContainer);
    
    // Create control container
    if (this.options.showControls) {
      this.controlContainer = document.createElement('div');
      this.controlContainer.style.padding = '15px';
      this.controlContainer.style.borderTop = '1px solid #ddd';
      this.controlContainer.style.backgroundColor = '#f8f9fa';
      this.container.appendChild(this.controlContainer);
    }
  }
  
  /**
   * Create control panel UI
   */
  createControls() {
    if (!this.options.showControls || !this.controlContainer) return;
    
    const controlsHTML = `
      <div class="gd-controls">
        <div class="gd-control-row">
          <div class="gd-control-group">
            <label>Function:</label>
            <select id="gd-function-select">
              <option value="quadratic">Quadratic Bowl</option>
              <option value="rosenbrock">Rosenbrock</option>
              <option value="rastrigin">Rastrigin</option>
              <option value="custom">Custom Function</option>
            </select>
          </div>
          
          <div class="gd-control-group">
            <label>Visualization:</label>
            <select id="gd-mode-select">
              <option value="2d">2D Contour</option>
              <option value="3d">3D Surface</option>
            </select>
          </div>
          
          <div class="gd-control-group">
            <label>Learning Rate:</label>
            <input type="range" id="gd-learning-rate" min="0.001" max="0.5" step="0.001" value="${this.options.learningRate}">
            <span id="gd-learning-rate-value">${this.options.learningRate}</span>
          </div>
        </div>
        
        <div class="gd-control-row">
          <div class="gd-control-group">
            <label>Start X:</label>
            <input type="number" id="gd-start-x" value="${this.options.initialPosition.x}" step="0.1">
          </div>
          
          <div class="gd-control-group">
            <label>Start Y:</label>
            <input type="number" id="gd-start-y" value="${this.options.initialPosition.y}" step="0.1">
          </div>
          
          <div class="gd-control-group">
            <label>Speed:</label>
            <input type="range" id="gd-speed" min="0.1" max="5" step="0.1" value="${this.options.animationSpeed}">
            <span id="gd-speed-value">${this.options.animationSpeed}x</span>
          </div>
        </div>
        
        <div class="gd-control-row">
          <div class="gd-control-group">
            <button id="gd-play-btn" class="gd-btn gd-btn-primary">Play</button>
            <button id="gd-pause-btn" class="gd-btn" disabled>Pause</button>
            <button id="gd-step-btn" class="gd-btn">Step</button>
            <button id="gd-reset-btn" class="gd-btn">Reset</button>
          </div>
        </div>
        
        <div class="gd-control-row gd-stats-row">
          <div class="gd-stats">
            <div class="gd-stat">
              <label>Iteration:</label>
              <span id="gd-iteration">0</span>
            </div>
            <div class="gd-stat">
              <label>Function Value:</label>
              <span id="gd-function-value">0.000</span>
            </div>
            <div class="gd-stat">
              <label>Gradient Norm:</label>
              <span id="gd-gradient-norm">0.000</span>
            </div>
            <div class="gd-stat">
              <label>Converged:</label>
              <span id="gd-converged">No</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.controlContainer.innerHTML = controlsHTML;
    this.addControlStyles();
  }
  
  /**
   * Add CSS styles for controls
   */
  addControlStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .gd-controls {
        max-width: 100%;
      }
      
      .gd-control-row {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;
        flex-wrap: wrap;
        align-items: center;
      }
      
      .gd-control-group {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 120px;
      }
      
      .gd-control-group label {
        font-weight: 500;
        min-width: 80px;
        font-size: 14px;
      }
      
      .gd-control-group select,
      .gd-control-group input[type="number"] {
        padding: 6px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        min-width: 100px;
      }
      
      .gd-control-group input[type="range"] {
        min-width: 80px;
      }
      
      .gd-btn {
        padding: 8px 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 14px;
        margin-right: 8px;
        transition: all 0.2s;
      }
      
      .gd-btn:hover:not(:disabled) {
        background: #f0f0f0;
        border-color: #999;
      }
      
      .gd-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .gd-btn-primary {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }
      
      .gd-btn-primary:hover:not(:disabled) {
        background: #0056b3;
        border-color: #0056b3;
      }
      
      .gd-stats-row {
        padding-top: 10px;
        border-top: 1px solid #ddd;
      }
      
      .gd-stats {
        display: flex;
        gap: 25px;
        flex-wrap: wrap;
        width: 100%;
      }
      
      .gd-stat {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .gd-stat label {
        font-weight: 500;
        font-size: 14px;
        color: #666;
      }
      
      .gd-stat span {
        font-family: monospace;
        font-size: 14px;
        font-weight: bold;
        color: #333;
      }
      
      @media (max-width: 768px) {
        .gd-control-row {
          flex-direction: column;
          gap: 10px;
        }
        
        .gd-control-group {
          width: 100%;
          justify-content: space-between;
        }
        
        .gd-stats {
          flex-direction: column;
          gap: 10px;
        }
        
        .gd-stat {
          justify-content: space-between;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Setup initial function
   */
  setupInitialFunction() {
    const functions = getBuiltInFunctions();
    this.setFunction(functions[this.options.initialFunction]);
    this.setVisualizationMode(this.options.mode);
  }
  
  /**
   * Setup event listeners for controls
   */
  setupEventListeners() {
    if (!this.options.showControls) return;
    
    // Function selection
    const functionSelect = document.getElementById('gd-function-select');
    if (functionSelect) {
      functionSelect.value = this.options.initialFunction;
      functionSelect.addEventListener('change', (e) => {
        const functions = getBuiltInFunctions();
        if (e.target.value === 'custom') {
          this.handleCustomFunction();
        } else {
          this.setFunction(functions[e.target.value]);
        }
      });
    }
    
    // Mode selection
    const modeSelect = document.getElementById('gd-mode-select');
    if (modeSelect) {
      modeSelect.value = this.options.mode;
      modeSelect.addEventListener('change', (e) => {
        this.setVisualizationMode(e.target.value);
      });
    }
    
    // Learning rate
    const learningRateSlider = document.getElementById('gd-learning-rate');
    const learningRateValue = document.getElementById('gd-learning-rate-value');
    if (learningRateSlider && learningRateValue) {
      learningRateSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        learningRateValue.textContent = value.toFixed(3);
        this.setLearningRate(value);
      });
    }
    
    // Start position
    const startX = document.getElementById('gd-start-x');
    const startY = document.getElementById('gd-start-y');
    if (startX && startY) {
      const updatePosition = () => {
        const x = parseFloat(startX.value);
        const y = parseFloat(startY.value);
        this.setStartPosition(x, y);
      };
      startX.addEventListener('change', updatePosition);
      startY.addEventListener('change', updatePosition);
    }
    
    // Animation speed
    const speedSlider = document.getElementById('gd-speed');
    const speedValue = document.getElementById('gd-speed-value');
    if (speedSlider && speedValue) {
      speedSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        speedValue.textContent = value.toFixed(1) + 'x';
        this.setAnimationSpeed(value);
      });
    }
    
    // Control buttons
    const playBtn = document.getElementById('gd-play-btn');
    const pauseBtn = document.getElementById('gd-pause-btn');
    const stepBtn = document.getElementById('gd-step-btn');
    const resetBtn = document.getElementById('gd-reset-btn');
    
    if (playBtn) playBtn.addEventListener('click', () => this.play());
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.pause());
    if (stepBtn) stepBtn.addEventListener('click', () => this.step());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
  }
  
  /**
   * Handle custom function input
   */
  handleCustomFunction() {
    const expression = prompt(
      'Enter a custom function expression (using x and y variables):\n' +
      'Examples:\n' +
      '  x*x + y*y\n' +
      '  Math.sin(x) + Math.cos(y)\n' +
      '  (x-1)*(x-1) + (y-1)*(y-1)'
    );
    
    if (expression) {
      try {
        const customFunc = new CustomFunction(expression);
        this.setFunction(customFunc);
      } catch (error) {
        alert('Invalid function expression: ' + error.message);
        // Reset to previous function
        const functionSelect = document.getElementById('gd-function-select');
        if (functionSelect) {
          functionSelect.value = this.options.initialFunction;
        }
      }
    }
  }
  
  /**
   * Set the optimization function
   * @param {Object} func - Function object
   */
  setFunction(func) {
    this.currentFunction = func;
    
    // Create new optimizer
    this.optimizer = createOptimizer(func);
    this.optimizer.initialize(
      this.options.initialPosition.x,
      this.options.initialPosition.y
    );
    
    // Update visualizer
    if (this.visualizer) {
      this.visualizer.setFunction(func);
      this.visualizer.reset();
      this.updateVisualization();
    }
    
    // Update learning rate display
    const learningRateSlider = document.getElementById('gd-learning-rate');
    const learningRateValue = document.getElementById('gd-learning-rate-value');
    if (learningRateSlider && learningRateValue) {
      learningRateSlider.value = func.recommendedLearningRate || 0.01;
      learningRateValue.textContent = (func.recommendedLearningRate || 0.01).toFixed(3);
    }
    
    this.updateStats();
  }
  
  /**
   * Set visualization mode (2D or 3D)
   * @param {string} mode - '2d' or '3d'
   */
  setVisualizationMode(mode) {
    this.options.mode = mode;
    
    // Cleanup existing visualizer
    if (this.visualizer) {
      this.visualizer.destroy();
    }
    
    // Create new visualizer
    if (mode === '3d') {
      this.visualizer = new Visualizer3D(this.visualizationContainer);
    } else {
      this.visualizer = new Visualizer2D(this.visualizationContainer);
    }
    
    // Setup with current function
    if (this.currentFunction) {
      this.visualizer.setFunction(this.currentFunction);
      this.updateVisualization();
    }
  }
  
  /**
   * Set learning rate
   * @param {number} rate - Learning rate value
   */
  setLearningRate(rate) {
    this.options.learningRate = rate;
    if (this.optimizer) {
      this.optimizer.config.learningRate = rate;
    }
  }
  
  /**
   * Set starting position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  setStartPosition(x, y) {
    this.options.initialPosition = { x, y };
    if (this.optimizer) {
      this.optimizer.initialize(x, y);
      this.updateVisualization();
      this.updateStats();
    }
  }
  
  /**
   * Set animation speed
   * @param {number} speed - Speed multiplier
   */
  setAnimationSpeed(speed) {
    this.options.animationSpeed = speed;
    this.stepInterval = 100 / speed; // Adjust step interval
  }
  
  /**
   * Start animation
   */
  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.lastStepTime = performance.now();
    
    // Update UI
    const playBtn = document.getElementById('gd-play-btn');
    const pauseBtn = document.getElementById('gd-pause-btn');
    if (playBtn) playBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    
    this.animate();
  }
  
  /**
   * Pause animation
   */
  pause() {
    this.isPlaying = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Update UI
    const playBtn = document.getElementById('gd-play-btn');
    const pauseBtn = document.getElementById('gd-pause-btn');
    if (playBtn) playBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
  }
  
  /**
   * Perform single step
   */
  step() {
    if (!this.optimizer) return;
    
    const result = this.optimizer.step();
    this.updateVisualization();
    this.updateStats();
    
    // Call step callback
    if (this.onStep) {
      this.onStep(result);
    }
    
    // Check for convergence
    if (this.optimizer.converged) {
      this.pause();
      if (this.onConvergence) {
        this.onConvergence(this.optimizer.getStatistics());
      }
    }
    
    return result;
  }
  
  /**
   * Reset optimization
   */
  reset() {
    this.pause();
    
    if (this.optimizer) {
      this.optimizer.initialize(
        this.options.initialPosition.x,
        this.options.initialPosition.y
      );
    }
    
    if (this.visualizer) {
      this.visualizer.reset();
      this.updateVisualization();
    }
    
    this.updateStats();
  }
  
  /**
   * Animation loop
   */
  animate() {
    if (!this.isPlaying) return;
    
    const currentTime = performance.now();
    
    if (currentTime - this.lastStepTime >= this.stepInterval) {
      this.step();
      this.lastStepTime = currentTime;
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  /**
   * Update visualization with current state
   */
  updateVisualization() {
    if (this.visualizer && this.optimizer) {
      const state = this.optimizer.getCurrentState();
      this.visualizer.updateVisualization(state);
      
      // Call state change callback
      if (this.onStateChange) {
        this.onStateChange(state);
      }
    }
  }
  
  /**
   * Update statistics display
   */
  updateStats() {
    if (!this.optimizer || !this.options.showControls) return;
    
    const state = this.optimizer.getCurrentState();
    
    const iterationEl = document.getElementById('gd-iteration');
    const functionValueEl = document.getElementById('gd-function-value');
    const gradientNormEl = document.getElementById('gd-gradient-norm');
    const convergedEl = document.getElementById('gd-converged');
    
    if (iterationEl) iterationEl.textContent = state.iteration;
    if (functionValueEl) functionValueEl.textContent = state.functionValue.toFixed(6);
    if (gradientNormEl) gradientNormEl.textContent = state.gradientMagnitude.toFixed(6);
    if (convergedEl) convergedEl.textContent = state.converged ? 'Yes' : 'No';
  }
  
  /**
   * Get current optimization state
   * @returns {Object} Current state
   */
  getCurrentState() {
    return this.optimizer ? this.optimizer.getCurrentState() : null;
  }
  
  /**
   * Get optimization history
   * @returns {Array} History array
   */
  getHistory() {
    return this.optimizer ? this.optimizer.history : [];
  }
  
  /**
   * Export optimization data
   * @returns {Object} Complete optimization data
   */
  exportData() {
    return this.optimizer ? this.optimizer.exportData() : null;
  }
  
  /**
   * Cleanup and destroy visualizer
   */
  destroy() {
    this.pause();
    
    if (this.visualizer) {
      this.visualizer.destroy();
    }
    
    this.container.innerHTML = '';
  }
} 