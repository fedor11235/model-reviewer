import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'
/**
 * A class to set up some basic scene elements to minimize code in the
 * main execution file.
 */
export default class BasicScene extends THREE.Scene{
  // A dat.gui class debugger that is added by default
  private debugger: GUI
  // Setups a scene camera
  private camera: THREE.PerspectiveCamera
  // setup renderer
  private renderer: THREE.Renderer
  // setup Orbitals
  private orbitals: OrbitControls
  // Holds the lights for easy reference
  private lights: Array<THREE.Light> = []
  // Number of PointLight objects around origin
  private lightCount: number = 6
  // Distance above ground place
  private lightDistance: number = 3
  // Get some basic params
  private width = window.innerWidth
  private height = window.innerHeight
  // Some loaders
  private loaderModel = new GLTFLoader()
  private loaderMaterial = new THREE.MaterialLoader()
  private loaderTexture = new THREE.TextureLoader()
  /**
   * Initializes the scene by adding lights, and the geometry
   */
  public initialize(debug: boolean = true, addGridHelper: boolean = true){
    // setup camera
    this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, .1, 1000)
    this.camera.position.z = 12
    this.camera.position.y = 12
    this.camera.position.x = 12
    // setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('app') as HTMLCanvasElement,
      alpha: true
    })
    this.renderer.setSize(this.width, this.height)
    // add window resizing
    BasicScene.addWindowResizing(this.camera, this.renderer)
    // sets up the camera's orbital controls
    this.orbitals = new OrbitControls(this.camera, this.renderer.domElement)
    // Adds an origin-centered grid for visual reference
    if (addGridHelper){
      // Adds a grid
      this.add(new THREE.GridHelper(10, 10, 'red'))
      // Adds an axis-helper
      this.add(new THREE.AxesHelper(3))
    }
    // set the background color
    this.background = new THREE.Color(0xefefef)
    // create the lights
    for (let i = 0; i < this.lightCount; i++){
      // Positions evenly in a circle pointed at the origin
      const light = new THREE.PointLight(0xffffff, 1)
      let lightX = this.lightDistance * Math.sin(Math.PI * 2 / this.lightCount * i)
      let lightZ = this.lightDistance * Math.cos(Math.PI * 2 / this.lightCount * i)
      // Create a light
      light.position.set(lightX, this.lightDistance, lightZ)
      light.lookAt(0, 0, 0)
      this.add(light)
      this.lights.push(light)
      // Visual helpers to indicate light positions
      this.add(new THREE.PointLightHelper(light, .5, 0xff9900))
    }
    this.loaderModel.load('../assets/tumba/scene.gltf',
      gltf => {
        const model = gltf.scene
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            this.loaderTexture.load('../assets/tumba/M_Wood_BaseColor.png',
              texture => {
                (child as THREE.Mesh).material = new THREE.MeshBasicMaterial({
                  map: texture
                })
              },
              xhr => {
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded material' )
              },
              err => {
                console.log(err)
              }
            )
          }
        })
        this.add(model)
      },
      xhr => {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded model' )
      },
      err => {
        console.error(err)
      }
    )
    // setup Debugger
    if (debug) {
      this.debugger =  new GUI()
      // Debug group with all lights in it.
      const lightGroup = this.debugger.addFolder('Lights')
      for(let i = 0; i < this.lights.length; i++){
        lightGroup.add(this.lights[i], 'visible', true)
      }
      lightGroup.open()
      // Add camera to debugger
      const cameraGroup = this.debugger.addFolder('Camera')
      cameraGroup.add(this.camera, 'fov', 20, 80)
      cameraGroup.add(this.camera, 'zoom', 0, 1)
      cameraGroup.open()
    }
  }
  public cameraUpdateProjectionMatrix() {
    this.camera.updateProjectionMatrix()
  }
  public rendererRender() {
    this.renderer.render(this, this.camera)
  }
  public orbitalsUpdate() {
    this.orbitals.update()
  }
  /**
   * Given a ThreeJS camera and renderer, resizes the scene if the
   * browser window is resized.
   * @param camera - a ThreeJS PerspectiveCamera object.
   * @param renderer - a subclass of a ThreeJS Renderer object.
   */
  static addWindowResizing(camera: THREE.PerspectiveCamera, renderer: THREE.Renderer){
    window.addEventListener( 'resize', onWindowResize, false )
    function onWindowResize(){
      // uses the global window widths and height
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize( window.innerWidth, window.innerHeight )
    }
  }
}