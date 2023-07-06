import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as TWEEN from '../plugins/tween.js'
import { GUI } from 'dat.gui'

/**
 * A class to set up some basic scene elements to minimize code in the
 * main execution file.
 */
export default class BasicScene extends THREE.Scene{
  // Setups a model name
  private ModelName: string
  constructor(ModelName: string)  {
    super()
    this.ModelName = ModelName
  }
  // A dat.gui class debugger that is added by default
  private debugger: GUI
  // Setups a canvas camera
  private canvas: HTMLCanvasElement
  // Setups a plug camera
  private plug: HTMLDivElement
  // Setups a scene camera
  private camera: THREE.PerspectiveCamera
  // Setup renderer
  private renderer: THREE.Renderer
  // Setup Orbitals
  private orbitals: OrbitControls
  // Setup spotLight
  private spotLight: THREE.SpotLight
  // Get some basic params
  private width = window.innerWidth
  private height = window.innerHeight
  // Some loaders
  private loaderModel = new GLTFLoader()
  private loaderMaterial = new THREE.MaterialLoader()
  private loaderTexture = new THREE.TextureLoader()
  // Setup model
  private model: THREE.Group
  // Setup textures
  private textures: any = {
    none: null
  }
  // Setup texture name
  private texturesName: string[] = [
    'none',
    'disturb.jpg',
    'colors.png',
    'uv_grid_opengl.jpg',
    'M_Wood_BaseColor.png',
    'M_Wood_Normal.png'
  ]
  // Setup helpers
  private spotLightHelper: any
  /**
   * Initializes the scene by adding lights, and the geometry
   */
  public initialize(debug: boolean = true, addGridHelper: boolean = true){
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, .1, 1000)
    this.camera.position.set(7, 4, 1)
    // Setup html
    this.canvas = (document.getElementById('app') as HTMLCanvasElement)
    this.plug = (document.getElementById('plug') as HTMLDivElement)
    this.plug.style.backgroundImage = `url(assets/${this.ModelName}/plug.png)`
    this.plug.addEventListener('click', () => {
      if(this.orbitals && this.model) {
        this.plug.style.display = 'none'
        // this.orbitals.autoRotate = true
        this.model.visible = true
        setTimeout(() => {
          this.plug.style.display = 'block'
          // this.orbitals.autoRotate = false
          this.orbitals.maxPolarAngle = Math.PI / 2

          const strMime = 'image/jpeg'
          const imgData = this.renderer.domElement.toDataURL(strMime);

          this.plug.style.backgroundImage = `url(${imgData})`
          this.model.visible = false
        }, 15000)
      }
    })
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      alpha: true
    })
    ;(this.renderer as any).shadowMap.enabled = true
    ;(this.renderer as any).shadowMap.type = THREE.PCFSoftShadowMap
    ;(this.renderer as any).toneMapping = THREE.ACESFilmicToneMapping
    ;(this.renderer as any).toneMappingExposure = 1
    this.renderer.setSize(this.width, this.height)
    // Add window resizing
    BasicScene.addWindowResizing(this.camera, this.renderer)
    // Sets up the camera's orbital controls
    this.orbitals = new OrbitControls(this.camera, this.renderer.domElement)
    this.orbitals.minDistance = 2
    this.orbitals.maxDistance = 10
    this.orbitals.maxPolarAngle = Math.PI / 2
    this.orbitals.target.set(0, 1, 0)
    this.orbitals.enableZoom = false
    this.orbitals.enablePan = false
    this.orbitals.enableDamping = false
    this.orbitals.enabled = false
    // this.orbitals.an
    // Set global illumination
    const ambient = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 0.15 )
    this.add( ambient )
    // Adds an origin-centered grid for visual reference
    if (addGridHelper){
      // Adds a grid
      this.add(new THREE.GridHelper(10, 10, 'red'))
      // Adds an axis-helper
      this.add(new THREE.AxesHelper(3))
    }
    // Set path textures
    const loader = new THREE.TextureLoader().setPath( '../assets/textures/' )
    for (const filename of this.texturesName) {
      const texture = loader.load(filename)
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.colorSpace = THREE.SRGBColorSpace
      this.textures[filename] = texture
    }
    // Set the spot light
    this.spotLight = new THREE.SpotLight(0xffffff, 100)
    this.spotLight.position.set(2.5, 5, 2.5)
    this.spotLight.angle = Math.PI / 6
    this.spotLight.penumbra = 1
    this.spotLight.decay = 2
    this.spotLight.distance = 0
    this.spotLight.map = this.textures[this.texturesName[1]]
    this.spotLight.castShadow = true
    this.spotLight.shadow.mapSize.width = 2
    this.spotLight.shadow.mapSize.height = 2
    this.spotLight.shadow.mapSize.width = 1024
    this.spotLight.shadow.mapSize.height = 1024
    this.spotLight.shadow.camera.near = 1
    this.spotLight.shadow.camera.far = 10
    this.spotLight.shadow.focus = 1
    this.spotLight.shadow.camera.fov = 1
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight, 0xff9900)
    this.add(this.spotLight)
    this.add(this.spotLightHelper)
    // Creat floor
    const planeGeometry = new THREE.PlaneGeometry(20, 20)
    const planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc})
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.position.set( 0, 0, 0 )
    plane.rotation.x = - Math.PI / 2
    plane.receiveShadow = true
    this.add(plane)
    const hlight = new THREE.AmbientLight (0x404040, 1);
    this.add(hlight);

    //??????????????????????? test
    // const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
    // directionalLight.position.set(-1000,1000,1000);
    // this.add( directionalLight );

    // const dirlight2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
    // dirlight2.position.set( -1000,-1000,-1000 );
    // this.add( dirlight2 );

    // const light3 = new THREE.PointLight( 0xffffff, 0.3, 10000 );
    // light3.position.set( 1000,-1000,1000 );
    // this.add( light3 );

    // Set the background color
    this.background = new THREE.Color(0xcccccc)
    // Load model
    this.loaderModel.load(`../assets/${this.ModelName}/scene.gltf`,
      gltf => {
        this.model = gltf.scene
        this.model.rotation.y = - Math.PI / 2
        // this.model.visible = false
        this.model.traverse(() => {
          this.setModeleTexture(this.textures['M_Wood_BaseColor.png'])
        })
        // this.camera.lookAt(this.model.position)
        this.add(this.model)
      },
      xhr => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded model' )
      },
      err => {
        console.error(err)
      }
    )
    // Setup Debugger
    if (debug) {
      const params = {
        'texture spot light': this.texturesName[1],
        'texture model': 'M_Wood_BaseColor.png',
        'color spot light': this.spotLight.color.getHex(),
        'color background': this.background.getHex(),
        intensity: this.spotLight.intensity,
        distance: this.spotLight.distance,
        angle: this.spotLight.angle,
        penumbra: this.spotLight.penumbra,
        decay: this.spotLight.decay,
        focus: this.spotLight.shadow.focus,
        shadows: true
      }
      this.debugger =  new GUI()
      // Add camera to debugger
      const cameraGroup = this.debugger.addFolder('Camera')
      cameraGroup.add(this.camera, 'fov', 20, 80)
      cameraGroup.add(this.camera, 'zoom', 0, 1)
      cameraGroup.open()
      this.debugger.addFolder
      // Add color background to debugger
      const backgroundGroup = this.debugger.addFolder('Background')
      backgroundGroup.addColor(params, 'color background').onChange( color => {
        this.background = new THREE.Color(color)
      })
      backgroundGroup.open()
      const modelGroup = this.debugger.addFolder('Changing model parameters')
      modelGroup.add(params, 'texture model', this.texturesName).onChange( textureName => {
        this.setModeleTexture(this.textures[textureName])
      })
      modelGroup.open()
      // Add spot light to debugger
      const spotLightGroup = this.debugger.addFolder('Spot light')
      spotLightGroup.add(params, 'texture spot light', this.texturesName).onChange( textureName => {
        this.spotLight.map = this.textures[textureName]
      })
      spotLightGroup.addColor(params, 'color spot light').onChange( color => {
        this.spotLight.color.setHex(color)
      })
      spotLightGroup.add(params, 'intensity', 0, 500).onChange( intensity => {
        this.spotLight.intensity = intensity
      })
      spotLightGroup.add(params, 'distance', 50, 200).onChange( distance => {
        this.spotLight.distance = distance
      })
      spotLightGroup.add(params, 'angle', 0, Math.PI / 3).onChange( angle => {
        this.spotLight.angle = angle
      })
      spotLightGroup.add(params, 'penumbra', 0, 1).onChange( penumbra => {
        this.spotLight.penumbra = penumbra
      })
      spotLightGroup.add(params, 'decay', 1, 2).onChange( decay => {
        this.spotLight.decay = decay
      })
      spotLightGroup.add(params, 'focus', 0, 1).onChange( focus => {
        this.spotLight.shadow.focus = focus
      })
      spotLightGroup.add(params, 'shadows').onChange( shadow => {
        (this.renderer as any).shadowMap.enabled = shadow
        this.traverse( (child) => {
          if ((child as THREE.Mesh).isMesh) {
            ((child as THREE.Mesh).material as any).needsUpdate = true
          }
        })
      })
      spotLightGroup.open()
    }
  }
  private setModeleTexture(texture: THREE.Texture) {
    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const material = new THREE.MeshLambertMaterial({
          map: texture
        })
        ;(child as THREE.Mesh).material = material
        ;(child as THREE.Mesh).castShadow = true
        ;(child as THREE.Mesh).receiveShadow = true
      }
    })
  }
  public render() {
    this.camera.updateProjectionMatrix()
    this.renderer.render(this, this.camera)
    TWEEN.update()
    this.orbitals.update()
    this.spotLightHelper.update()
  }
  public tween(light: THREE.SpotLight) {
    new TWEEN.Tween(light).to( {
      angle: (Math.random() * 0.7) + 0.1,
      penumbra: Math.random() + 1
    }, Math.random() * 3000 + 2000)
      .easing(TWEEN.Easing.Quadratic.Out).start();

    new TWEEN.Tween( light.position ).to({
      x: (Math.random() * 1) + 1.5,
      // y: ( Math.random() * 1 ) + 1.5,
      z: (Math.random() * 1) + 1.5,
    }, Math.random() * 3000 + 2000)
      .easing(TWEEN.Easing.Quadratic.Out).start();
  }
  public animate = () => {
    this.tween(this.spotLight)
    setTimeout(this.animate, 3000)
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
      // camera.updateProjectionMatrix()
      renderer.setSize( window.innerWidth, window.innerHeight )
    }
  }
}