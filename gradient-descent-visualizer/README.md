# Gradient Descent Visualizer

> 🚀 Interactive web-based visualization of gradient descent optimization algorithms

An educational and professional-grade tool that demonstrates gradient descent converging to function minima through smooth 2D and 3D animations. Perfect for machine learning education, algorithm demonstrations, and interactive documentation.

[![NPM Version](https://img.shields.io/npm/v/gradient-descent-visualizer)](https://www.npmjs.com/package/gradient-descent-visualizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

### 🎯 **Multiple Optimization Functions**
- **Quadratic Bowl**: Simple convex function perfect for demonstrating basic convergence
- **Rosenbrock Function**: Classic "banana" function showcasing non-convex optimization challenges  
- **Rastrigin Function**: Highly multimodal landscape with many local minima
- **Custom Functions**: Define your own mathematical expressions with full JavaScript support

### 🎨 **Dual Visualization Modes**
- **2D Contour Plots**: Beautiful heatmaps with configurable color schemes (Viridis, Plasma, Jet)
- **3D Surface Visualization**: Interactive Three.js surfaces with wireframe and shaded modes
- **Real-time Trails**: Watch the complete optimization path with configurable trail length
- **Interactive Controls**: Mouse/touch camera controls for 3D exploration

### ⚡ **Advanced Animation System**
- **Play/Pause/Step Control**: Full playback control for educational demonstrations
- **Variable Speed**: 0.1× to 5× speed adjustment for detailed analysis or quick overviews
- **Smooth Interpolation**: 60+ FPS animations that gracefully degrade on lower-powered devices
- **Real-time Parameters**: Adjust learning rate, starting position, and function on-the-fly

### 📊 **Performance Analytics**
- **Live Metrics**: Iteration count, function value, gradient magnitude, convergence status
- **Statistical Analysis**: Convergence rates, improvement percentages, execution timing
- **Export Capabilities**: JSON export of complete optimization history for further analysis

### 🛠️ **Developer Experience**
- **ES6 Modules**: Modern JavaScript architecture with tree-shaking support
- **TypeScript Ready**: Complete type definitions included
- **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JavaScript
- **Responsive Design**: Automatically adapts to container size and mobile devices

## 🚀 Quick Start

### Installation

```bash
npm install gradient-descent-visualizer
```

### Basic Usage

```javascript
import { createVisualizer } from 'gradient-descent-visualizer';

// Get container element
const container = document.getElementById('my-visualizer');

// Create visualizer instance
const visualizer = createVisualizer(container, {
  mode: '2d',                    // '2d' or '3d'
  initialFunction: 'quadratic',  // 'quadratic', 'rosenbrock', 'rastrigin'
  initialPosition: { x: 2, y: 2 },
  learningRate: 0.1,
  autoPlay: true
});

// Add event listeners
visualizer.onConvergence = (stats) => {
  console.log(`Converged in ${stats.iterations} iterations!`);
};
```

### Advanced Configuration

```javascript
import { GradientDescentVisualizer, CustomFunction } from 'gradient-descent-visualizer';

// Create custom function
const customFunc = new CustomFunction('x*x + Math.sin(y)', {
  min: -5, 
  max: 5
}, 0.05);

// Advanced visualizer setup
const visualizer = new GradientDescentVisualizer(container, {
  mode: '3d',
  showControls: true,
  initialFunction: customFunc,
  initialPosition: { x: -2, y: 3 },
  learningRate: 0.05,
  animationSpeed: 2.0,
  maxIterations: 1000
});

// Set up event handlers
visualizer.onStateChange = (state) => {
  updateCustomUI(state);
};

visualizer.onStep = (state) => {
  if (state.gradientMagnitude < 0.001) {
    visualizer.pause();
    showConvergenceMessage();
  }
};
```

## 📖 API Reference

### Main Classes

#### `GradientDescentVisualizer`

The primary class that orchestrates visualization, controls, and optimization.

**Constructor:**
```javascript
new GradientDescentVisualizer(container, options)
```

**Parameters:**
- `container` (HTMLElement): DOM element to render into
- `options` (Object): Configuration options

**Options:**
```javascript
{
  mode: '2d' | '3d',           // Visualization mode
  showControls: boolean,        // Show built-in UI controls
  autoPlay: boolean,           // Start animation immediately
  animationSpeed: number,      // Speed multiplier (0.1 - 5.0)
  maxIterations: number,       // Maximum optimization steps
  initialFunction: string,     // Built-in function name
  initialPosition: {x, y},     // Starting coordinates
  learningRate: number         // Gradient descent step size
}
```

**Methods:**

| Method | Description | Returns |
|--------|-------------|---------|
| `play()` | Start optimization animation | `void` |
| `pause()` | Pause current animation | `void` |
| `step()` | Perform single optimization step | `Object` |
| `reset()` | Reset to initial conditions | `void` |
| `setFunction(func)` | Change optimization function | `void` |
| `setVisualizationMode(mode)` | Switch between 2D/3D | `void` |
| `setLearningRate(rate)` | Update learning rate | `void` |
| `setStartPosition(x, y)` | Change starting point | `void` |
| `getCurrentState()` | Get current optimization state | `Object` |
| `getHistory()` | Get complete optimization history | `Array` |
| `exportData()` | Export data for analysis | `Object` |
| `destroy()` | Cleanup and remove from DOM | `void` |

**Events:**

```javascript
visualizer.onStateChange = (state) => { /* ... */ };
visualizer.onConvergence = (statistics) => { /* ... */ };
visualizer.onStep = (state) => { /* ... */ };
```

#### `CustomFunction`

Create custom optimization functions from JavaScript expressions.

**Constructor:**
```javascript
new CustomFunction(expression, bounds, learningRate)
```

**Example:**
```javascript
const func = new CustomFunction(
  'Math.pow(x-1, 2) + Math.pow(y+0.5, 2)', // Expression
  { min: -3, max: 3 },                     // Bounds
  0.1                                      // Recommended learning rate
);
```

#### Built-in Functions

Access pre-configured optimization functions:

```javascript
import { 
  quadraticBowl, 
  rosenbrock, 
  rastrigin, 
  getBuiltInFunctions 
} from 'gradient-descent-visualizer';

// Use individual functions
const visualizer = createVisualizer(container, {
  initialFunction: rosenbrock
});

// Or get all available functions
const functions = getBuiltInFunctions();
console.log(Object.keys(functions)); // ['quadratic', 'rosenbrock', 'rastrigin']
```

### Utility Functions

#### `createVisualizer(container, options)`

Convenience function for quick setup with sensible defaults.

#### `mathUtils`

Mathematical utility functions:

```javascript
import { mathUtils } from 'gradient-descent-visualizer';

mathUtils.vectorMagnitude(gradient);    // Calculate vector magnitude
mathUtils.clamp(value, min, max);       // Clamp value to range
mathUtils.lerp(a, b, t);               // Linear interpolation
```

## 🎓 Educational Examples

### Machine Learning Course Integration

```javascript
// Demonstrate different optimization challenges
const examples = [
  {
    name: "Convex Optimization",
    func: quadraticBowl,
    position: { x: 3, y: 3 },
    learningRate: 0.2
  },
  {
    name: "Non-convex Challenge", 
    func: rosenbrock,
    position: { x: -1, y: 1 },
    learningRate: 0.001
  },
  {
    name: "Local Minima Problem",
    func: rastrigin,
    position: { x: 2.5, y: -2.5 },
    learningRate: 0.01
  }
];

examples.forEach((example, i) => {
  const container = document.getElementById(`example-${i}`);
  const visualizer = createVisualizer(container, {
    initialFunction: example.func,
    initialPosition: example.position,
    learningRate: example.learningRate,
    mode: '2d'
  });
});
```

### Interactive Algorithm Comparison

```javascript
// Compare different learning rates
const learningRates = [0.001, 0.01, 0.1, 0.5];

learningRates.forEach((rate, i) => {
  const container = document.getElementById(`rate-${i}`);
  const visualizer = createVisualizer(container, {
    initialFunction: 'rosenbrock',
    initialPosition: { x: -1, y: 1 },
    learningRate: rate,
    showControls: false,
    autoPlay: true
  });
  
  visualizer.onConvergence = (stats) => {
    document.getElementById(`result-${i}`).innerHTML = 
      `Rate: ${rate}, Steps: ${stats.iterations}, Time: ${stats.executionTime.toFixed(2)}ms`;
  };
});
```

## 🎨 Customization

### Custom Color Schemes (2D Mode)

```javascript
// Built-in color schemes: 'viridis', 'plasma', 'jet'
visualizer.visualizer.setColorScheme('plasma');

// Toggle contour lines and heatmap
visualizer.visualizer.setContoursVisibility(true);
visualizer.visualizer.setHeatmapVisibility(false);
```

### 3D Visualization Options

```javascript
// Toggle wireframe mode
visualizer.visualizer.setWireframeMode(true);

// Show/hide optimization trail
visualizer.visualizer.setTrailVisibility(false);

// Save and restore camera position
const cameraState = visualizer.visualizer.getCameraState();
// ... later ...
visualizer.visualizer.setCameraState(cameraState);
```

### Custom UI Integration

```javascript
// Create visualizer without built-in controls
const visualizer = new GradientDescentVisualizer(container, {
  showControls: false,
  // ... other options
});

// Build custom controls
document.getElementById('my-play-btn').addEventListener('click', () => {
  visualizer.play();
});

document.getElementById('my-speed-slider').addEventListener('input', (e) => {
  visualizer.setAnimationSpeed(parseFloat(e.target.value));
});

// React to state changes
visualizer.onStateChange = (state) => {
  document.getElementById('iteration-display').textContent = state.iteration;
  document.getElementById('value-display').textContent = state.functionValue.toFixed(6);
};
```

## 📱 Responsive Design

The visualizer automatically adapts to different screen sizes:

```css
.visualizer-container {
  width: 100%;
  height: 70vh;
  min-height: 400px;
  max-height: 800px;
}

@media (max-width: 768px) {
  .visualizer-container {
    height: 50vh;
    min-height: 300px;
  }
}
```

The control panel automatically reorganizes for mobile devices, and touch controls are supported for 3D navigation.

## ⚡ Performance

### Optimization Guidelines

- **Frame Rate**: Targets 60 FPS on desktop, gracefully degrades to 30 FPS on mobile
- **Surface Resolution**: Configurable grid resolution for 2D/3D rendering
- **Trail Length**: Adjustable optimization path history for memory management
- **Animation Speed**: Variable speed reduces computational load at higher speeds

### Browser Compatibility

| Browser | 2D Mode | 3D Mode | Notes |
|---------|---------|---------|-------|
| Chrome 80+ | ✅ | ✅ | Full support |
| Firefox 75+ | ✅ | ✅ | Full support |
| Safari 13+ | ✅ | ✅ | Full support |
| Edge 80+ | ✅ | ✅ | Full support |
| Mobile Safari | ✅ | ⚠️ | Reduced 3D performance |
| Android Chrome | ✅ | ⚠️ | Reduced 3D performance |

## 🧪 Testing

### Unit Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

### Browser Testing

```bash
npm run test:browser  # Cross-browser testing
```

### Performance Testing

```bash
npm run test:perf     # Performance benchmarks
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/marinacozzolino/gradient-descent-visualizer.git
cd gradient-descent-visualizer
npm install
npm run dev        # Start development server
npm run build      # Build for production
npm run docs       # Generate documentation
```

### Project Structure

```
gradient-descent-visualizer/
├── src/
│   ├── math/                    # Mathematical functions and algorithms
│   │   ├── functions.js         # Optimization functions
│   │   └── gradientDescent.js   # Core optimization algorithm
│   ├── visualization/           # Rendering components
│   │   ├── Visualizer2D.js      # 2D contour plots
│   │   └── Visualizer3D.js      # 3D surface rendering
│   ├── GradientDescentVisualizer.js  # Main orchestrator class
│   └── index.js                 # Public API exports
├── demo/                        # Interactive demonstration
│   └── index.html              # Demo page
├── tests/                       # Test suites
├── docs/                       # Generated documentation
└── dist/                       # Built packages
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js** - 3D visualization capabilities
- **Mathematical Foundations** - Based on classical optimization literature
- **Educational Community** - Inspired by the need for better algorithm visualization tools

## 📚 Further Reading

- [Gradient Descent Algorithm](https://en.wikipedia.org/wiki/Gradient_descent)
- [Optimization Test Functions](http://www.sfu.ca/~ssurjano/optimization.html)
- [Three.js Documentation](https://threejs.org/docs/)
- [Canvas 2D API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

**Built with ❤️ for the machine learning education community**

[🌐 Live Demo](https://marinacozzolino.github.io/gradient-descent-visualizer) | [📖 Full Documentation](https://marinacozzolino.github.io/gradient-descent-visualizer/docs) | [🐛 Report Issues](https://github.com/marinacozzolino/gradient-descent-visualizer/issues) 