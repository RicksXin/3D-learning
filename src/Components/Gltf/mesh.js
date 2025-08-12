import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

const mesh = new THREE.Group();

// 使用正确的相对路径，从当前文件位置到GLTF文件
loader.load("./Pug.gltf", function (gltf) {
  mesh.add(gltf.scene);
  gltf.scene.traverse((obj) => {
    if (obj.isMesh) {
      // obj.material.color.set(0x00ff00);
      console.log('obj', obj);
      
      if (obj.name === 'Cylinder') {
        obj.material.color.set(new THREE.Color('white'));
      } else if (obj.name === 'Cylinder_1') {
        obj.material.color.set(new THREE.Color('pink'));
      }
    }
  })
  const obj = gltf.scene.getObjectByName('Cylinder')
  // obj.material.wireframe = true
  obj.material = new THREE.MeshBasicMaterial({
    color: 'white',
    wireframe: true
  })
}, undefined, function (error) {
  console.error('加载GLTF文件失败:', error);
});



export default mesh;
