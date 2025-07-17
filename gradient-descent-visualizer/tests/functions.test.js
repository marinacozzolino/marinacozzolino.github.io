/**
 * Unit tests for mathematical optimization functions
 */

import { 
  quadraticBowl, 
  rosenbrock, 
  rastrigin, 
  CustomFunction, 
  mathUtils 
} from '../src/math/functions.js';

describe('Mathematical Functions', () => {
  describe('quadraticBowl', () => {
    test('should have correct global minimum', () => {
      const { x, y, value } = quadraticBowl.globalMinimum;
      expect(quadraticBowl.value(x, y)).toBeCloseTo(value, 6);
    });

    test('should calculate correct function values', () => {
      expect(quadraticBowl.value(1, 1)).toBe(0);
      expect(quadraticBowl.value(0, 0)).toBe(2);
      expect(quadraticBowl.value(2, 2)).toBe(2);
    });

    test('should calculate correct gradients', () => {
      const grad = quadraticBowl.gradient(1, 1);
      expect(grad.dx).toBe(0);
      expect(grad.dy).toBe(0);

      const grad2 = quadraticBowl.gradient(2, 3);
      expect(grad2.dx).toBe(2);
      expect(grad2.dy).toBe(4);
    });
  });

  describe('rosenbrock', () => {
    test('should have correct global minimum', () => {
      const { x, y, value } = rosenbrock.globalMinimum;
      expect(rosenbrock.value(x, y)).toBeCloseTo(value, 6);
    });

    test('should calculate correct function values', () => {
      expect(rosenbrock.value(1, 1)).toBe(0);
      expect(rosenbrock.value(0, 0)).toBe(1);
    });

    test('should calculate correct gradients at minimum', () => {
      const grad = rosenbrock.gradient(1, 1);
      expect(grad.dx).toBeCloseTo(0, 10);
      expect(grad.dy).toBeCloseTo(0, 10);
    });
  });

  describe('rastrigin', () => {
    test('should have correct global minimum', () => {
      const { x, y, value } = rastrigin.globalMinimum;
      expect(rastrigin.value(x, y)).toBeCloseTo(value, 6);
    });

    test('should calculate correct function values', () => {
      expect(rastrigin.value(0, 0)).toBeCloseTo(0, 6);
    });

    test('should calculate correct gradients at minimum', () => {
      const grad = rastrigin.gradient(0, 0);
      expect(grad.dx).toBeCloseTo(0, 10);
      expect(grad.dy).toBeCloseTo(0, 10);
    });
  });

  describe('CustomFunction', () => {
    test('should create function from simple expression', () => {
      const func = new CustomFunction('x*x + y*y');
      expect(func.value(0, 0)).toBe(0);
      expect(func.value(1, 1)).toBe(2);
      expect(func.value(2, 3)).toBe(13);
    });

    test('should calculate numerical gradients', () => {
      const func = new CustomFunction('x*x + y*y');
      const grad = func.gradient(1, 1);
      expect(grad.dx).toBeCloseTo(2, 5);
      expect(grad.dy).toBeCloseTo(2, 5);
    });

    test('should handle Math functions', () => {
      const func = new CustomFunction('Math.sin(x) + Math.cos(y)');
      expect(func.value(0, 0)).toBeCloseTo(1, 6); // sin(0) + cos(0) = 0 + 1 = 1
    });

    test('should throw error for invalid expressions', () => {
      expect(() => new CustomFunction('invalid expression!')).toThrow();
    });
  });

  describe('mathUtils', () => {
    test('vectorMagnitude should calculate correct magnitude', () => {
      expect(mathUtils.vectorMagnitude({ dx: 3, dy: 4 })).toBe(5);
      expect(mathUtils.vectorMagnitude({ dx: 0, dy: 0 })).toBe(0);
      expect(mathUtils.vectorMagnitude({ dx: 1, dy: 0 })).toBe(1);
    });

    test('clamp should constrain values to range', () => {
      expect(mathUtils.clamp(5, 0, 10)).toBe(5);
      expect(mathUtils.clamp(-5, 0, 10)).toBe(0);
      expect(mathUtils.clamp(15, 0, 10)).toBe(10);
    });

    test('lerp should interpolate correctly', () => {
      expect(mathUtils.lerp(0, 10, 0.5)).toBe(5);
      expect(mathUtils.lerp(0, 10, 0)).toBe(0);
      expect(mathUtils.lerp(0, 10, 1)).toBe(10);
      expect(mathUtils.lerp(10, 20, 0.25)).toBe(12.5);
    });
  });
});

describe('Function Properties', () => {
  const functions = [quadraticBowl, rosenbrock, rastrigin];

  functions.forEach(func => {
    describe(`${func.name}`, () => {
      test('should have required properties', () => {
        expect(func).toHaveProperty('name');
        expect(func).toHaveProperty('description');
        expect(func).toHaveProperty('value');
        expect(func).toHaveProperty('gradient');
        expect(func).toHaveProperty('bounds');
        expect(func).toHaveProperty('globalMinimum');
        expect(func).toHaveProperty('recommendedLearningRate');
      });

      test('should have valid bounds', () => {
        expect(func.bounds.min).toBeLessThan(func.bounds.max);
        expect(typeof func.bounds.min).toBe('number');
        expect(typeof func.bounds.max).toBe('number');
      });

      test('should have valid global minimum within bounds', () => {
        const { x, y } = func.globalMinimum;
        expect(x).toBeGreaterThanOrEqual(func.bounds.min);
        expect(x).toBeLessThanOrEqual(func.bounds.max);
        expect(y).toBeGreaterThanOrEqual(func.bounds.min);
        expect(y).toBeLessThanOrEqual(func.bounds.max);
      });

      test('should have positive learning rate', () => {
        expect(func.recommendedLearningRate).toBeGreaterThan(0);
        expect(func.recommendedLearningRate).toBeLessThanOrEqual(1);
      });

      test('gradient should have correct structure', () => {
        const grad = func.gradient(0, 0);
        expect(grad).toHaveProperty('dx');
        expect(grad).toHaveProperty('dy');
        expect(typeof grad.dx).toBe('number');
        expect(typeof grad.dy).toBe('number');
      });
    });
  });
});

describe('Numerical Stability', () => {
  test('functions should handle edge cases', () => {
    const functions = [quadraticBowl, rosenbrock, rastrigin];
    
    functions.forEach(func => {
      // Test extreme values
      expect(isFinite(func.value(1000, 1000))).toBe(true);
      expect(isFinite(func.value(-1000, -1000))).toBe(true);
      
      // Test gradients at extreme values
      const grad = func.gradient(100, 100);
      expect(isFinite(grad.dx)).toBe(true);
      expect(isFinite(grad.dy)).toBe(true);
    });
  });

  test('gradients should be consistent with function values', () => {
    const functions = [quadraticBowl, rosenbrock, rastrigin];
    const h = 1e-8;
    
    functions.forEach(func => {
      const x = 0.5, y = 0.5;
      const grad = func.gradient(x, y);
      
      // Numerical gradient approximation
      const numericalGradX = (func.value(x + h, y) - func.value(x - h, y)) / (2 * h);
      const numericalGradY = (func.value(x, y + h) - func.value(x, y - h)) / (2 * h);
      
      // Allow for some numerical error in gradient calculation
      expect(grad.dx).toBeCloseTo(numericalGradX, 3);
      expect(grad.dy).toBeCloseTo(numericalGradY, 3);
    });
  });
}); 