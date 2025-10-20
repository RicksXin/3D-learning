import * as THREE from 'three'
import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import mesh from './mesh.js'

export function mount (stage) {
  const container = stage || document.body;
  const rect = container.getBoundingClientRect()
  const scene = new THREE.Scene()

  scene.add(mesh)

  const axesHelper = new THREE.AxesHelper(500)
  scene.add(axesHelper)
  const directionalLight = new THREE.DirectionalLight(0xffffff)
  directionalLight.position.set(300, 200, 400)
  scene.add(directionalLight)
  const ambientLight = new THREE.AmbientLight(0xffffff)
  scene.add(ambientLight)

  const width = rect.width
  const height = rect.height
  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000)
  camera.position.set(0, 500, 500)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const v = new THREE.Vector2(window.innerWidth, window.innerWidth);
  const outlinePass = new OutlinePass(v, scene, camera);
  composer.addPass(outlinePass);

  function render () {
    composer.render();
    // renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  container.append(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);

  renderer.domElement.addEventListener('click', (e) => {
    const y = -((e.offsetY / height) * 2 - 1);
    const x = (e.offsetX / width) * 2 - 1;
  
    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);
  
    const intersections = rayCaster.intersectObjects(mesh.children);
  
    intersections.forEach(item => {
      item.object.material.color.set('blue')
      outlinePass.selectedObjects = [intersections[0].object];
    });
  });

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