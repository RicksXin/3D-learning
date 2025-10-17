import * as THREE from 'three';
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import mesh from './mesh2.js';

export function mount(stage) {
  const container = stage || document.body;
  const rect = container.getBoundingClientRect();

  const scene = new THREE.Scene();
  scene.add(mesh);

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(100, 100, 100);
  scene.add(light);

  const axesHelper = new THREE.AxesHelper(1000);
  scene.add(axesHelper);

  let width = rect.width;
  let height = rect.height;

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  let rafId = 0;
  function render() {
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(render);
  }
  render();

  container.append(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);

  function onResize() {
    const r = container.getBoundingClientRect();
    width = r.width; height = r.height;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  return function cleanup() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
    controls.dispose();
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    scene.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const m = obj.material;
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose && mm.dispose());
          else if (m.dispose) m.dispose();
        }
      }
    });
  }
}
