/**
 * 3D Surface Visualization using Three.js
 * Renders optimization functions as 3D surfaces with animated gradient descent
 */

import * as THREE from 'three';

/**
 * 3D Visualizer Class for gradient descent on optimization surfaces
 */
export class Visualizer3D {
  /**
   * @param {HTMLElement} container - DOM element to render into
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: 800,
      height: 600,
      surfaceResolution: 50,
      showWireframe: false,
      showTrail: true,
      trailLength: 50,
      pointSize: 0.1,
      cameraDistance: 10,
      ...options
    };
    
    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    // Visualization objects
    this.surface = null;
    this.currentPoint = null;
    this.trailPoints = [];
    this.trailLine = null;
    this.globalMinimumMarker = null;
    
    // Animation state
    this.animationId = null;
    this.isAnimating = false;
    
    // Function and optimization state
    this.currentFunction = null;
    this.optimizer = null;
    
    this.initializeRenderer();
  }
  
  /**
   * Initialize Three.js renderer and scene
   */
  initializeRenderer() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.options.width / this.options.height,
      0.1,
      1000
    );
    this.camera.position.set(8, 8, 8);
    this.camera.lookAt(0, 0, 0);
    
    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.options.width, this.options.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add to container
    this.container.appendChild(this.renderer.domElement);
    
    // Lighting
    this.setupLighting();
    
    // Controls (if OrbitControls is available)
    this.setupControls();
    
    // Handle resize
    this.setupResizeHandler();
    
    // Start render loop
    this.startRenderLoop();
  }
  
  /**
   * Setup scene lighting
   */
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // Point light for better surface definition
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, 10, -5);
    this.scene.add(pointLight);
  }
  
  /**
   * Setup camera controls (basic rotation)
   */
  setupControls() {
    // Simple mouse controls for camera rotation
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    this.renderer.domElement.addEventListener('mousedown', (event) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    });
    
    this.renderer.domElement.addEventListener('mousemove', (event) => {
      if (!isMouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      // Rotate camera around the scene
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(this.camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      this.camera.position.setFromSpherical(spherical);
      this.camera.lookAt(0, 0, 0);
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    });
    
    this.renderer.domElement.addEventListener('mouseup', () => {
      isMouseDown = false;
    });
    
    // Zoom with wheel
    this.renderer.domElement.addEventListener('wheel', (event) => {
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      this.camera.position.multiplyScalar(scale);
      this.camera.position.clampLength(3, 20);
    });
  }
  
  /**
   * Setup window resize handler
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
   * Resize the renderer
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  /**
   * Set the optimization function to visualize
   * @param {Object} func - Function object with value() and gradient() methods
   */
  setFunction(func) {
    this.currentFunction = func;
    this.createSurface();
    this.createGlobalMinimumMarker();
  }
  
  /**
   * Create 3D surface mesh from function
   */
  createSurface() {
    if (!this.currentFunction) return;
    
    // Remove existing surface
    if (this.surface) {
      this.scene.remove(this.surface);
    }
    
    const { bounds } = this.currentFunction;
    const resolution = this.options.surfaceResolution;
    
    // Create geometry
    const geometry = new THREE.PlaneGeometry(
      bounds.max - bounds.min,
      bounds.max - bounds.min,
      resolution - 1,
      resolution - 1
    );
    
    // Modify vertices based on function values
    const positions = geometry.attributes.position;
    const vertices = [];
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      
      // Map from geometry coordinates to function domain
      const funcX = (x / (bounds.max - bounds.min)) * (bounds.max - bounds.min) + bounds.min;
      const funcZ = (z / (bounds.max - bounds.min)) * (bounds.max - bounds.min) + bounds.min;
      
      const y = this.currentFunction.value(funcX, funcZ);
      
      // Scale Y to reasonable range
      const scaledY = Math.min(Math.max(y, -10), 10) * 0.5;
      
      positions.setY(i, scaledY);
      vertices.push(new THREE.Vector3(funcX, scaledY, funcZ));
    }
    
    // Recompute normals for proper lighting
    geometry.computeVertexNormals();
    
    // Create material
    const material = this.options.showWireframe ? 
      new THREE.MeshBasicMaterial({ 
        color: 0x0077ff, 
        wireframe: true 
      }) :
      new THREE.MeshLambertMaterial({ 
        color: 0x0077ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
    
    // Create mesh
    this.surface = new THREE.Mesh(geometry, material);
    this.surface.receiveShadow = true;
    this.scene.add(this.surface);
  }
  
  /**
   * Create marker for global minimum
   */
  createGlobalMinimumMarker() {
    if (!this.currentFunction || !this.currentFunction.globalMinimum) return;
    
    // Remove existing marker
    if (this.globalMinimumMarker) {
      this.scene.remove(this.globalMinimumMarker);
    }
    
    const { x, y } = this.currentFunction.globalMinimum;
    const functionValue = this.currentFunction.value(x, y);
    const scaledY = Math.min(Math.max(functionValue, -10), 10) * 0.5;
    
    const geometry = new THREE.SphereGeometry(0.15, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    
    this.globalMinimumMarker = new THREE.Mesh(geometry, material);
    this.globalMinimumMarker.position.set(x, scaledY + 0.2, y);
    this.scene.add(this.globalMinimumMarker);
  }
  
  /**
   * Update visualization with current optimization state
   * @param {Object} state - Current optimizer state
   */
  updateVisualization(state) {
    if (!this.currentFunction) return;
    
    const { position, functionValue } = state;
    const scaledY = Math.min(Math.max(functionValue, -10), 10) * 0.5;
    
    // Update current point
    this.updateCurrentPoint(position.x, scaledY + 0.1, position.y);
    
    // Update trail
    if (this.options.showTrail) {
      this.updateTrail(position.x, scaledY + 0.05, position.y);
    }
  }
  
  /**
   * Update current optimization point
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate (height)
   * @param {number} z - Z coordinate
   */
  updateCurrentPoint(x, y, z) {
    if (!this.currentPoint) {
      const geometry = new THREE.SphereGeometry(this.options.pointSize, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      this.currentPoint = new THREE.Mesh(geometry, material);
      this.currentPoint.castShadow = true;
      this.scene.add(this.currentPoint);
    }
    
    this.currentPoint.position.set(x, y, z);
  }
  
  /**
   * Update optimization trail
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate (height)
   * @param {number} z - Z coordinate
   */
  updateTrail(x, y, z) {
    // Add new point to trail
    this.trailPoints.push(new THREE.Vector3(x, y, z));
    
    // Limit trail length
    if (this.trailPoints.length > this.options.trailLength) {
      this.trailPoints.shift();
    }
    
    // Remove existing trail line
    if (this.trailLine) {
      this.scene.remove(this.trailLine);
    }
    
    // Create new trail line
    if (this.trailPoints.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(this.trailPoints);
      const material = new THREE.LineBasicMaterial({ 
        color: 0xff6600,
        linewidth: 2
      });
      
      this.trailLine = new THREE.Line(geometry, material);
      this.scene.add(this.trailLine);
    }
  }
  
  /**
   * Clear the optimization trail
   */
  clearTrail() {
    this.trailPoints = [];
    if (this.trailLine) {
      this.scene.remove(this.trailLine);
      this.trailLine = null;
    }
  }
  
  /**
   * Reset visualization
   */
  reset() {
    // Remove current point
    if (this.currentPoint) {
      this.scene.remove(this.currentPoint);
      this.currentPoint = null;
    }
    
    // Clear trail
    this.clearTrail();
  }
  
  /**
   * Toggle wireframe mode
   * @param {boolean} wireframe - Whether to show wireframe
   */
  setWireframeMode(wireframe) {
    this.options.showWireframe = wireframe;
    if (this.surface) {
      this.surface.material.wireframe = wireframe;
    }
  }
  
  /**
   * Toggle trail visibility
   * @param {boolean} showTrail - Whether to show trail
   */
  setTrailVisibility(showTrail) {
    this.options.showTrail = showTrail;
    if (!showTrail) {
      this.clearTrail();
    }
  }
  
  /**
   * Start render loop
   */
  startRenderLoop() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
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
    
    // Cleanup Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
    
    // Dispose geometries and materials
    this.scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
  
  /**
   * Get current camera state for serialization
   * @returns {Object} Camera state
   */
  getCameraState() {
    return {
      position: this.camera.position.clone(),
      target: new THREE.Vector3(0, 0, 0)
    };
  }
  
  /**
   * Set camera state
   * @param {Object} state - Camera state to restore
   */
  setCameraState(state) {
    this.camera.position.copy(state.position);
    this.camera.lookAt(state.target);
  }
} 