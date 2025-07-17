/**
 * Gradient Descent Visualizer
 * Interactive web-based gradient descent visualization library
 * 
 * @author Marina Cozzolino
 * @version 1.0.0
 */

// Main visualizer class
export { GradientDescentVisualizer } from './GradientDescentVisualizer.js';

// Math components
export {
  quadraticBowl,
  rosenbrock,
  rastrigin,
  CustomFunction,
  getBuiltInFunctions,
  mathUtils
} from './math/functions.js';

export {
  GradientDescentOptimizer,
  createOptimizer,
  optimizationUtils,
  defaultConfig
} from './math/gradientDescent.js';

// Visualization components
export { Visualizer2D } from './visualization/Visualizer2D.js';
export { Visualizer3D } from './visualization/Visualizer3D.js';

/**
 * Quick setup function for easy integration
 * @param {HTMLElement} container - DOM element to render into
 * @param {Object} options - Configuration options
 * @returns {GradientDescentVisualizer} Configured visualizer instance
 */
export function createVisualizer(container, options = {}) {
  return new GradientDescentVisualizer(container, options);
}

/**
 * Library version
 */
export const VERSION = '1.0.0';

/**
 * Default export for convenience
 */
export default GradientDescentVisualizer; 