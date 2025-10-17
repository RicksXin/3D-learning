import * as THREE from 'three';
import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import mesh from './mesh.js';
export function mount(stage) {
  const container = stage || document.body;
  const rect = container.getBoundingClientRect();
  const scene = new THREE.Scene();

  scene.add(mesh);

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(500, 300, 600);
  scene.add(light);

  const light2 = new THREE.AmbientLight();
  scene.add(light2);

  const axesHelper = new THREE.AxesHelper(1000);
  scene.add(axesHelper);

  const width = rect.width;
  const height = rect.height;

  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
  camera.position.set(0, 200, 600);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(width, height)
  const controls = new OrbitControls(camera, renderer.domElement);

  controls.enableDamping = true

  function render() {
    controls.update()
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    mesh.children.forEach((item, index) => {
      const flag = index % 2 === 0 ? 1 : -1;
      item.rotation.z += 0.0003 * index * flag;
    })
  }


  render();

  container.append(renderer.domElement);



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