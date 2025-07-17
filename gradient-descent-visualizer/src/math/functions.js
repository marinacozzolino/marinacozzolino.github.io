/**
 * Mathematical optimization functions for gradient descent visualization
 * Each function includes value calculation, gradient computation, and metadata
 */

/**
 * Quadratic Bowl function: f(x,y) = (x-1)² + (y-1)²
 * Simple convex function with global minimum at (1,1)
 */
export const quadraticBowl = {
  name: 'Quadratic Bowl',
  description: 'Simple convex function: f(x,y) = (x-1)² + (y-1)²',
  
  /**
   * Calculate function value
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @returns {number} Function value
   */
  value: (x, y) => {
    return Math.pow(x - 1, 2) + Math.pow(y - 1, 2);
  },
  
  /**
   * Calculate gradient vector
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @returns {Object} Gradient vector {dx, dy}
   */
  gradient: (x, y) => {
    return {
      dx: 2 * (x - 1),
      dy: 2 * (y - 1)
    };
  },
  
  // Visualization bounds
  bounds: { min: -2, max: 4 },
  globalMinimum: { x: 1, y: 1, value: 0 },
  recommendedLearningRate: 0.1
};

/**
 * Rosenbrock function: f(x,y) = 100(y-x²)² + (1-x)²
 * Classic non-convex optimization test function with global minimum at (1,1)
 */
export const rosenbrock = {
  name: 'Rosenbrock',
  description: 'Non-convex "banana" function: f(x,y) = 100(y-x²)² + (1-x)²',
  
  /**
   * Calculate function value
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @returns {number} Function value
   */
  value: (x, y) => {
    return 100 * Math.pow(y - x * x, 2) + Math.pow(1 - x, 2);
  },
  
  /**
   * Calculate gradient vector
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @returns {Object} Gradient vector {dx, dy}
   */
  gradient: (x, y) => {
    const term = y - x * x;
    return {
      dx: -400 * x * term - 2 * (1 - x),
      dy: 200 * term
    };
  },
  
  // Visualization bounds
  bounds: { min: -2, max: 2 },
  globalMinimum: { x: 1, y: 1, value: 0 },
  recommendedLearningRate: 0.001
};

/**
 * Rastrigin function: f(x,y) = 20 + x² + y² - 10(cos(2πx) + cos(2πy))
 * Highly multimodal function with many local minima
 */
export const rastrigin = {
  name: 'Rastrigin',
  description: 'Multimodal function with many local minima',
  
  /**
   * Calculate function value
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @returns {number} Function value
   */
  value: (x, y) => {
    const A = 10;
    return 2 * A + 
           (x * x - A * Math.cos(2 * Math.PI * x)) + 
           (y * y - A * Math.cos(2 * Math.PI * y));
  },
  
  /**
   * Calculate gradient vector
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @returns {Object} Gradient vector {dx, dy}
   */
  gradient: (x, y) => {
    const A = 10;
    return {
      dx: 2 * x + 2 * Math.PI * A * Math.sin(2 * Math.PI * x),
      dy: 2 * y + 2 * Math.PI * A * Math.sin(2 * Math.PI * y)
    };
  },
  
  // Visualization bounds
  bounds: { min: -5, max: 5 },
  globalMinimum: { x: 0, y: 0, value: 0 },
  recommendedLearningRate: 0.01
};

/**
 * Custom function parser for user-defined functions
 * Allows users to input custom mathematical expressions
 */
export class CustomFunction {
  /**
   * @param {string} expression - JavaScript expression for the function
   * @param {Object} bounds - Visualization bounds {min, max}
   * @param {number} learningRate - Recommended learning rate
   */
  constructor(expression, bounds = { min: -5, max: 5 }, learningRate = 0.01) {
    this.name = 'Custom Function';
    this.description = `Custom function: ${expression}`;
    this.expression = expression;
    this.bounds = bounds;
    this.recommendedLearningRate = learningRate;
    
    // Create function from expression
    try {
      // eslint-disable-next-line no-new-func
      this.valueFunction = new Function('x', 'y', `return ${expression}`);
    } catch (error) {
      throw new Error(`Invalid function expression: ${error.message}`);
    }
  }
  
  /**
   * Calculate function value
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @returns {number} Function value
   */
  value(x, y) {
    try {
      return this.valueFunction(x, y);
    } catch (error) {
      return NaN;
    }
  }
  
  /**
   * Calculate numerical gradient using finite differences
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @param {number} h - Step size for numerical differentiation
   * @returns {Object} Gradient vector {dx, dy}
   */
  gradient(x, y, h = 1e-6) {
    const f = this.value.bind(this);
    
    // Central difference for numerical gradient
    const dx = (f(x + h, y) - f(x - h, y)) / (2 * h);
    const dy = (f(x, y + h) - f(x, y - h)) / (2 * h);
    
    return { dx, dy };
  }
}

/**
 * Get all available built-in functions
 * @returns {Object} Dictionary of function name to function object
 */
export const getBuiltInFunctions = () => ({
  'quadratic': quadraticBowl,
  'rosenbrock': rosenbrock,
  'rastrigin': rastrigin
});

/**
 * Utility functions for mathematical operations
 */
export const mathUtils = {
  /**
   * Calculate vector magnitude (norm)
   * @param {Object} gradient - Gradient vector {dx, dy}
   * @returns {number} Vector magnitude
   */
  vectorMagnitude: (gradient) => {
    return Math.sqrt(gradient.dx * gradient.dx + gradient.dy * gradient.dy);
  },
  
  /**
   * Clamp a value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  clamp: (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  },
  
  /**
   * Linear interpolation between two values
   * @param {number} a - Start value
   * @param {number} b - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  lerp: (a, b, t) => {
    return a + (b - a) * t;
  }
}; 