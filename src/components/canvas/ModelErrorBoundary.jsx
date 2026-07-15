import { Component } from 'react';

/**
 * Catches failures from a lazily-loaded GLTF model — missing .glb file,
 * network error, malformed asset — and renders a fallback instead of
 * crashing the whole 3D scene. This is a class component because React
 * error boundaries have no hook equivalent (getDerivedStateFromError /
 * componentDidCatch only exist on classes).
 *
 * Used by FurnitureLoader.jsx to fall back to a primitive placeholder mesh
 * whenever `public/models/*.glb` is missing or fails to load, which is the
 * expected state until real assets are added.
 */
export class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.warn('FurnitureLoader: model failed to load, using placeholder geometry —', error?.message ?? error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export default ModelErrorBoundary;
