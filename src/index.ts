import BasicScene from './BasicScene'
// Get name model
const params = (new URL(window.location as any)).searchParams
const modelName = params.get('model')

// Setup up the scene
let scene = new BasicScene(modelName)
scene.initialize()
scene.animate()
// Loops updates
function loop(){
  scene.render()
  requestAnimationFrame(loop)
}
// Runs a continuous loop
loop()