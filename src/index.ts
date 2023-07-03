import BasicScene from "./BasicScene";
// sets up the scene
let scene = new BasicScene();
scene.initialize();
// loops updates
function loop(){
  scene.cameraUpdateProjectionMatrix()
  scene.rendererRender()
  scene.updateElements()
  requestAnimationFrame(loop)
}
// runs a continuous loop
loop()