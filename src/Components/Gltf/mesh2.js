import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

const mesh = new THREE.Group();

loader.load("./gltf1/DamagedHelmet.gltf", function (gltf) {
    console.log(gltf);
    gltf.scene.scale.set(4, 4, 4);
    mesh.add(gltf.scene);
    gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.material.wireframe = true
            obj.material.color.set(new THREE.Color('#08f'));
            obj.material.map = null
        }
    })
})
loader.load("./gltf1/DamagedHelmet.glb", function (gltf) {
  mesh.add(gltf.scene);

  gltf.scene.scale.set(4, 4, 4);
  gltf.scene.translateX(10);

  gltf.scene.traverse(obj => {
      if(obj.isMesh) {
          obj.material.wireframe = true;
          obj.material.color.set('lightgreen');
          obj.material.map = null;
      }
  })
});
export default mesh;
