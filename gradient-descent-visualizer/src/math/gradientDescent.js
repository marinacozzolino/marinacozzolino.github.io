/**
 * Gradient Descent Algorithm Implementation
 * Supports various optimization strategies and real-time tracking
 */

import { mathUtils } from './functions.js';

/**
 * Configuration options for gradient descent
 */
export const defaultConfig = {
  learningRate: 0.01,
  maxIterations: 1000,
  tolerance: 1e-6,
  momentum: 0,
  adaptiveLearningRate: false,
  initialDecay: 0.9
};

/**
 * Gradient Descent Optimizer Class
 * Handles the core optimization algorithm with various features
 */
export class GradientDescentOptimizer {
  /**
   * @param {Object} optimizationFunction - Function object with value() and gradient() methods
   * @param {Object} config - Configuration options
   */
  constructor(optimizationFunction, config = {}) {
    this.func = optimizationFunction;
    this.config = { ...defaultConfig, ...config };
    
    // Current state
    this.currentPosition = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 }; // For momentum
    this.iteration = 0;
    this.converged = false;
    
    // History tracking
    this.history = [];
    this.isRunning = false;
    
    // Performance metrics
    this.startTime = null;
    this.endTime = null;
  }
  
  /**
   * Initialize optimizer with starting position
   * @param {number} x - Starting x coordinate
   * @param {number} y - Starting y coordinate
   */
  initialize(x, y) {
    this.currentPosition = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.iteration = 0;
    this.converged = false;
    this.history = [];
    this.isRunning = false;
    
    // Record initial state
    this.recordCurrentState();
  }
  
  /**
   * Perform a single gradient descent step
   * @returns {Object} Step result with position, gradient, and metadata
   */
  step() {
    if (this.converged || this.iteration >= this.config.maxIterations) {
      this.isRunning = false;
      return this.getCurrentState();
    }
    
    const { x, y } = this.currentPosition;
    
    // Calculate gradient
    const gradient = this.func.gradient(x, y);
    const gradientMagnitude = mathUtils.vectorMagnitude(gradient);
    
    // Check for convergence
    if (gradientMagnitude < this.config.tolerance) {
      this.converged = true;
      this.isRunning = false;
      this.endTime = performance.now();
      return this.getCurrentState();
    }
    
    // Adaptive learning rate (optional)
    let currentLearningRate = this.config.learningRate;
    if (this.config.adaptiveLearningRate && this.iteration > 0) {
      const decayFactor = Math.pow(this.config.initialDecay, this.iteration);
      currentLearningRate *= decayFactor;
    }
    
    // Update velocity (momentum)
    if (this.config.momentum > 0) {
      this.velocity.x = this.config.momentum * this.velocity.x - currentLearningRate * gradient.dx;
      this.velocity.y = this.config.momentum * this.velocity.y - currentLearningRate * gradient.dy;
      
      // Update position with momentum
      this.currentPosition.x += this.velocity.x;
      this.currentPosition.y += this.velocity.y;
    } else {
      // Standard gradient descent update
      this.currentPosition.x -= currentLearningRate * gradient.dx;
      this.currentPosition.y -= currentLearningRate * gradient.dy;
    }
    
    this.iteration++;
    this.recordCurrentState();
    
    return this.getCurrentState();
  }
  
  /**
   * Run optimization for multiple steps
   * @param {number} steps - Number of steps to run
   * @returns {Array} Array of step results
   */
  runSteps(steps) {
    const results = [];
    
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = performance.now();
    }
    
    for (let i = 0; i < steps && !this.converged; i++) {
      results.push(this.step());
    }
    
    if (this.converged && !this.endTime) {
      this.endTime = performance.now();
    }
    
    return results;
  }
  
  /**
   * Run optimization until convergence or max iterations
   * @returns {Array} Complete optimization history
   */
  runToConvergence() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = performance.now();
    }
    
    while (!this.converged && this.iteration < this.config.maxIterations) {
      this.step();
    }
    
    if (!this.endTime) {
      this.endTime = performance.now();
    }
    
    return this.history;
  }
  
  /**
   * Get current optimizer state
   * @returns {Object} Current state information
   */
  getCurrentState() {
    const { x, y } = this.currentPosition;
    const functionValue = this.func.value(x, y);
    const gradient = this.func.gradient(x, y);
    const gradientMagnitude = mathUtils.vectorMagnitude(gradient);
    
    return {
      position: { x, y },
      functionValue,
      gradient,
      gradientMagnitude,
      iteration: this.iteration,
      converged: this.converged,
      learningRate: this.config.learningRate
    };
  }
  
  /**
   * Record current state in history
   */
  recordCurrentState() {
    const state = this.getCurrentState();
    this.history.push({
      ...state,
      timestamp: performance.now()
    });
  }
  
  /**
   * Reset optimizer to initial state
   */
  reset() {
    this.iteration = 0;
    this.converged = false;
    this.history = [];
    this.isRunning = false;
    this.velocity = { x: 0, y: 0 };
    this.startTime = null;
    this.endTime = null;
  }
  
  /**
   * Get optimization statistics
   * @returns {Object} Performance and convergence statistics
   */
  getStatistics() {
    if (this.history.length === 0) {
      return null;
    }
    
    const initialValue = this.history[0].functionValue;
    const finalValue = this.history[this.history.length - 1].functionValue;
    const improvement = initialValue - finalValue;
    const improvementPercent = (improvement / Math.abs(initialValue)) * 100;
    
    return {
      iterations: this.iteration,
      converged: this.converged,
      initialValue,
      finalValue,
      improvement,
      improvementPercent,
      executionTime: this.endTime ? this.endTime - this.startTime : null,
      averageStepTime: this.endTime ? (this.endTime - this.startTime) / this.iteration : null
    };
  }
  
  /**
   * Export optimization history for analysis
   * @returns {Object} Complete optimization data
   */
  exportData() {
    return {
      config: this.config,
      history: this.history,
      statistics: this.getStatistics(),
      functionInfo: {
        name: this.func.name,
        description: this.func.description
      }
    };
  }
}

/**
 * Factory function to create optimizer with presets
 * @param {Object} func - Optimization function
 * @param {string} preset - Preset name ('standard', 'momentum', 'adaptive')
 * @returns {GradientDescentOptimizer} Configured optimizer
 */
export function createOptimizer(func, preset = 'standard') {
  const presets = {
    standard: {
      learningRate: func.recommendedLearningRate || 0.01,
      momentum: 0,
      adaptiveLearningRate: false
    },
    momentum: {
      learningRate: func.recommendedLearningRate || 0.01,
      momentum: 0.9,
      adaptiveLearningRate: false
    },
    adaptive: {
      learningRate: func.recommendedLearningRate || 0.01,
      momentum: 0,
      adaptiveLearningRate: true,
      initialDecay: 0.95
    }
  };
  
  const config = presets[preset] || presets.standard;
  return new GradientDescentOptimizer(func, config);
}

/**
 * Utility functions for optimization analysis
 */
export const optimizationUtils = {
  /**
   * Calculate convergence rate from history
   * @param {Array} history - Optimization history
   * @returns {number} Convergence rate
   */
  calculateConvergenceRate: (history) => {
    if (history.length < 2) return 0;
    
    const values = history.map(h => h.functionValue);
    const differences = [];
    
    for (let i = 1; i < values.length; i++) {
      differences.push(Math.abs(values[i] - values[i-1]));
    }
    
    // Calculate average rate of improvement
    return differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
  },
  
  /**
   * Detect if optimization is stuck in local minimum
   * @param {Array} history - Optimization history
   * @param {number} windowSize - Number of recent steps to analyze
   * @returns {boolean} True if likely stuck
   */
  detectLocalMinimum: (history, windowSize = 10) => {
    if (history.length < windowSize) return false;
    
    const recentHistory = history.slice(-windowSize);
    const values = recentHistory.map(h => h.functionValue);
    
    // Check if values have plateaued
    const variance = optimizationUtils.calculateVariance(values);
    return variance < 1e-8;
  },
  
  /**
   * Calculate variance of an array
   * @param {Array} values - Array of numbers
   * @returns {number} Variance
   */
  calculateVariance: (values) => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }
}; 