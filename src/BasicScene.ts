import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'
type test = {
  materialModel: THREE.Material | null
  textureModel: THREE.Texture | null
}
/**
 * A class to set up some basic scene elements to minimize code in the
 * main execution file.
 */
export default class BasicScene extends THREE.Scene{
  // A dat.gui class debugger that is added by default
  private debugger: GUI
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
  // Params model
  private model: THREE.Group
  private modelParams:test = {
    materialModel: null,
    textureModel: null
  }
  // Options for change
  private options = {
    colors: {
      green: '#C9F76F',
      red: '#E667AF'
    },
    textures: {
      base: 'M_Wood_BaseColor',
      normal: 'M_Wood_Normal',
    }
  }
  /**
   * Initializes the scene by adding lights, and the geometry
   */
  public initialize(debug: boolean = true, addGridHelper: boolean = true){
    // setup camera
    this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, .1, 1000)
    this.camera.position.set( 7, 4, 1 )
    // setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('app') as HTMLCanvasElement,
      alpha: true
    });

    (this.renderer as any).shadowMap.enabled = true
    ;(this.renderer as any).shadowMap.type = THREE.PCFSoftShadowMap
    ;(this.renderer as any).toneMapping = THREE.ACESFilmicToneMapping
    ;(this.renderer as any).toneMappingExposure = 1

    this.renderer.setSize(this.width, this.height)
    // add window resizing
    BasicScene.addWindowResizing(this.camera, this.renderer)
    // sets up the camera's orbital controls
    this.orbitals = new OrbitControls(this.camera, this.renderer.domElement)
    this.orbitals.minDistance = 2;
    this.orbitals.maxDistance = 10;
    this.orbitals.maxPolarAngle = Math.PI / 2;
    this.orbitals.target.set( 0, 1, 0 );
    // ??
    const ambient = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 0.15 );
    this.add( ambient );
    // Adds an origin-centered grid for visual reference
    if (addGridHelper){
      // Adds a grid
      this.add(new THREE.GridHelper(10, 10, 'red'))
      // Adds an axis-helper
      this.add(new THREE.AxesHelper(3))
    }
    // set path textures
    const loader = new THREE.TextureLoader().setPath( '../assets/textures/' )
    const filenames = [ 'disturb.jpg', 'colors.png', 'uv_grid_opengl.jpg' ]

    const textures: any = { none: null };
    
    for ( let i = 0; i < filenames.length; i ++ ) {
      const filename = filenames[ i ];
      const texture = loader.load( filename );
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      textures[ filename ] = texture;
    }
    // set the spot light
    this.spotLight = new THREE.SpotLight(0xffffff, 100)
    this.spotLight.position.set(2.5, 5, 2.5)
    this.spotLight.angle = Math.PI / 6
    this.spotLight.penumbra = 1
    this.spotLight.decay = 2
    this.spotLight.distance = 0
    this.spotLight.map = textures[ 'disturb.jpg' ]
    this.spotLight.castShadow = true
    this.spotLight.shadow.mapSize.width = 2
    this.spotLight.shadow.mapSize.height = 2
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.spotLight.shadow.camera.near = 1;
    this.spotLight.shadow.camera.far = 10;
    this.spotLight.shadow.focus = 1;
    // this.spotLight.shadow.camera.fov = 1
    this.add(this.spotLight)
    this.add(new THREE.SpotLightHelper(this.spotLight, 0xff9900))
    // creat floor
    const planeGeometry = new THREE.PlaneGeometry(20, 20)
    const planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc})
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.position.set( 0, 0, 0 )
    plane.rotation.x = - Math.PI / 2
    plane.receiveShadow = true
    this.add(plane)
    // set the background color
    this.background = new THREE.Color(this.options.colors.green)
    // load model
    this.loaderModel.load('../assets/tumba/scene.gltf',
      gltf => {
        // gltf.scale( 0.0024, 0.0024, 0.0024 );
        // gltf.computeVertexNormals();

        // const material = new THREE.MeshLambertMaterial();
        // const mesh = new THREE.Mesh( gltf, material );

        this.model = gltf.scene
        this.model.rotation.y = - Math.PI / 2;
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.model.traverse(() => {
          // this.setModeleTexture(this.options.textures.base)
        })
        this.add(this.model)
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
      const params = {
        map: textures[ 'disturb.jpg' ],
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
      backgroundGroup.addColor(params, 'color background').onChange( val => {
        this.background = new THREE.Color(val)
      })
      backgroundGroup.open()
      const modelGroup = this.debugger.addFolder('Changing model parameters')
      modelGroup.add(this.modelParams, 'textureModel', this.options.textures)
        .onChange((texture) => this.setModeleTexture(texture))
      modelGroup.open()
      // Add spot light to debugger
      const spotLightGroup = this.debugger.addFolder('Spot light')
      spotLightGroup.add( params, 'map', textures ).onChange( val => {
        this.spotLight.map = val
      })
      spotLightGroup.addColor( params, 'color spot light' ).onChange( val => {
        this.spotLight.color.setHex(val)
      })
      spotLightGroup.add( params, 'intensity', 0, 500 ).onChange( val => {
        this.spotLight.intensity = val
      })
      spotLightGroup.add( params, 'distance', 50, 200 ).onChange( val => {
        this.spotLight.distance = val
      })
      spotLightGroup.add( params, 'angle', 0, Math.PI / 3 ).onChange( val => {
        this.spotLight.angle = val
      })
      spotLightGroup.add( params, 'penumbra', 0, 1 ).onChange( val => {
        this.spotLight.penumbra = val
      })
      spotLightGroup.add( params, 'decay', 1, 2 ).onChange( val => {
        this.spotLight.decay = val
      })
      spotLightGroup.add( params, 'focus', 0, 1 ).onChange( val => {
        this.spotLight.shadow.focus = val;
      })
      spotLightGroup.add( params, 'shadows' ).onChange( val => {
        (this.renderer as any).shadowMap.enabled = val;
        this.traverse( (child) => {
          if ((child as THREE.Mesh).isMesh) {
            ((child as THREE.Mesh).material as any).needsUpdate = true;
          }
        })
      })
      spotLightGroup.open()
    }
  }
  private setSceneColor(color: string) {
    this.background = new THREE.Color(color)
  }
  private setModeleTexture(texture: string) {
    this.loaderTexture.load(`../assets/tumba/${texture}.png`,
      texture => {
        this.modelParams.textureModel = texture
        this.model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            ;(child as THREE.Mesh).material = new THREE.MeshBasicMaterial({
              map: this.modelParams.textureModel
            })
          }
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