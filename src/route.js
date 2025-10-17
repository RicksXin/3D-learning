export const caseLoaders = {
  gltf: () => import('./Components/Gltf/index.js'),
  barchart: () => import('./Case/BarChart/index.js'),
  cloudspace: () => import('./Case/CloudSpace/index.js'),
  clickbox: () => import('./Case/ClickBox/index.js'),
};