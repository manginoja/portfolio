import * as THREE from 'three';
import * as CANNON from 'cannon';
/*
import { MapControls }  from './three/examples/jsm/controls/OrbitControls.js';



import {GUI} from './three/examples/jsm/libs/lil-gui.module.min.js'

*/
import Stats from 'stats.js'
import {sRGBEncoding} from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'; 
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';


// TODOS:
// write content for the sections
// labels need ~flair~
// could even do a lil floating pic of me?

let controlBool = false;
let onText = false;
let useGui = false;

const stats = new Stats()
//document.body.appendChild(stats.dom)

// camera settings
let near = 1;
let far = 29;
let cameraPosition = new THREE.Vector3(0, 24, far - 2);
far = 600;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#02121c');

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, near, far );
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
let cameraTarget = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z - 1);
camera.lookAt(cameraTarget);

const renderer = new THREE.WebGLRenderer({powerPreference: 'high-performance', antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = sRGBEncoding;
renderer.sortObjects = false;
document.body.appendChild( renderer.domElement );
/*
renderer.shadowMap.enabled = false;
renderer.shadowMapSoft = true;
renderer.shadowCameraNear = camera.near;
renderer.shadowCameraFar = camera.far;
renderer.shadowCameraFov = 50;
renderer.shadowMapBias = .0039;
renderer.shadowMapDarkness = 0.5;
renderer.shadowMapWidth = 1024;
renderer.shadowMapHeight = 1024;
*/

if (controlBool) {
  let controls = new MapControls( camera, renderer.domElement );
  //controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  //controls.dampingFactor = 0.05;
}


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render( scene, camera );
}


/******************************** BLOOM ***********************************/
/*
const myRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, {
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  format: THREE.RGBAFormat,
  encoding: THREE.sRGBEncoding,
} );

const bloomLayer = new THREE.Layers();
bloomLayer.set( 1 );

const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = 1;
bloomPass.strength = 2;
bloomPass.radius = 1;

const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

bloomComposer.setSize(window.innerWidth, window.innerHeight);

const finalPass = new ShaderPass(
  new THREE.ShaderMaterial( {
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture },
    },
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
    defines: {},
    precision: 'mediump'
  } ), 'baseTexture'
);

finalPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer, myRenderTarget);
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );
finalComposer.setSize(window.innerWidth, window.innerHeight);
finalComposer.setPixelRatio(window.devicePixelRatio);

let materials = {};
let darkMaterial = new THREE.MeshBasicMaterial({color: 'black'});
let layerToCheck;
function darkenNonBloomed( obj ) {
  if ( obj.isMesh && layerToCheck.test( obj.layers ) === false ) {
    materials[ obj.uuid ] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterial( obj ) {
  if ( materials[ obj.uuid ] ) {
    obj.material = materials[ obj.uuid ];
   // delete materials[ obj.uuid ];
  }
}
*/
/******************************** WATER ***********************************/
/*
const waterGeometry = new THREE.CircleGeometry(3.2, 64);

let water = new Water(waterGeometry, {
  color: 0xaaaaaa,
  scale: 1,
  flowDirection: new THREE.Vector2(1, 1),
  textureWidth: 64,
  textureHeight: 64,
  encoding: THREE.sRGBEncoding
} );
water.position.set(-7, 4.08, 4.2)
water.rotation.x = - Math.PI / 2;
*/
/******************************** LIGHTS ***********************************/


const ambientLight = new THREE.AmbientLight(0xffffff,.2);
scene.add(ambientLight);

//const hemisphereLight = new THREE.HemisphereLight(0x00008b, 0x885500, 2);
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x0008b, .5);
scene.add(hemisphereLight);

const spotLight = new THREE.DirectionalLight(0xffffff, 0.3);
const spotLight3 = new THREE.SpotLight(0xffffff, 0.3);
spotLight.angle = .32
spotLight.position.set(-21, 18.5, 25);
//spotLight.position.set(-21, 18.5, -13);
spotLight.shadow.camera.far = 70
spotLight3.angle = 1.57
spotLight3.position.set(-5.56, -28, 13);
spotLight3.shadow.camera.far = 25;
let lights = [spotLight, spotLight3];
lights.forEach(light => {
  scene.add(light);  
  light.decay = 2;
  /*
  light.castShadow = true;
  light.shadow.camera.left = -12;
  light.shadow.camera.right = 2;
  light.shadow.camera.top = 12;
  light.shadow.camera.bottom = -22;
  light.shadow.bias = -.0001
  light.shadow.radius = 2
  */
})

const cameraHelper = new THREE.CameraHelper(spotLight3.shadow.camera)
//scene.add(cameraHelper)

/******************************** PHYSICS & LETTERS ***********************************/
const world = new CANNON.World();
world.gravity.set(0, - 9.82, 0);
//var cannonDebugRenderer = new CannonDebugRenderer( scene, world );

const physicalObjects = [];
const loader = new FontLoader();
// pink, yellow, green
const colors = [0xe0bbe4, 0xaff8db, 0xffffd1];
let colorMaterials = [];
colors.forEach(color => {
  colorMaterials.push(new THREE.MeshPhongMaterial({color: color}))
})

let ventY = -11.7;
let ventZ = 4.6;
let floorOffset = 3.6;

let texts = [];
for (let i = 97; i < 110; i++) {
  texts.push(String.fromCharCode(i));
}

loader.load( 'node_modules/three/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {
  let textGeo;
  let i = 0;
  let target = new THREE.Object3D();
  scene.add(target)
  target.position.set(0, ventY - 1, ventZ);
  spotLight.target =  target;
  for (let text of texts) {
    let boxX = Math.random() * 2 - 1;
    let boxZ = Math.random() * 0.2;
    let boxMesh;
    textGeo = new TextGeometry(text, {
        font: font,
        size: 1,
        height: .1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: .1,
        bevelSize: .01,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const textMat = colorMaterials[i % colors.length]
    boxMesh = new THREE.Mesh(textGeo, textMat);
    /*boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;*/
    //boxMesh.position.set(boxX, ventY, ventZ + boxZ);

    textGeo.computeBoundingBox();
    let x = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
    let y = textGeo.boundingBox.max.y - textGeo.boundingBox.min.y;
    let z = textGeo.boundingBox.max.z - textGeo.boundingBox.min.z;
    const boxShape = new CANNON.Box(new CANNON.Vec3(x * 0.5,y * 0.5, z * 0.5));
    const boxBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(boxX, ventY, ventZ + boxZ),
      shape: boxShape
    });      
    i++;
    physicalObjects.push({
      body: boxBody, 
      mesh: boxMesh, 
      x: x, 
      y: y, 
      time: i * 500, 
      startX: boxX, 
      startZ: ventZ + boxZ});
  }
} );


const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, ventY - floorOffset, ventZ),
  shape: floorShape
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 
world.addBody(floorBody);

const wallShape = new CANNON.Plane()
const wallBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, ventY - floorOffset, 4.2),
  shape: wallShape
});
world.addBody(wallBody)

const frontWallShape = new CANNON.Plane()
const frontWallBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, ventY - floorOffset - 2.8, 5.5),
  shape: frontWallShape
});
frontWallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI) 
world.addBody(frontWallBody)

const ventFrontShape = new CANNON.Plane()
const ventFrontBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, ventY - floorOffset + 7.4, 2.8),
  shape: ventFrontShape
});
ventFrontBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), 3.73221) 
world.addBody(ventFrontBody)

/******************************** SCENE LOADING ***********************************/

var gLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'node_modules/three/examples/js/libs/draco/gltf/' );
gLoader.setDRACOLoader( dracoLoader );

const textureLoader = new THREE.TextureLoader();

let simpleMap = textureLoader.load('simpleBackgroundCompressed.jpg');
simpleMap.flipY = false;
simpleMap.encoding = sRGBEncoding;

let backMap = textureLoader.load('simpleMain.jpg');
backMap.flipY = false;
backMap.encoding = sRGBEncoding;

let textMap = textureLoader.load('textTextureCompressed.jpg');
textMap.flipY = false;
textMap.encoding = sRGBEncoding;

let extraMap = textureLoader.load('simpleExtrasCompressed.jpg');
extraMap.flipY = false;
extraMap.encoding = sRGBEncoding;

//let mainMaterial = new THREE.MeshBasicMaterial({color: 0x87ceeb});
let mainMaterial = new THREE.MeshBasicMaterial({map: simpleMap});
let backMaterial = new THREE.MeshBasicMaterial({map: backMap});
//backMaterial = mainMaterial;
let textMaterial = new THREE.MeshBasicMaterial({map: textMap});
//textMaterial = mainMaterial;
let extraMaterial = new THREE.MeshBasicMaterial({map: extraMap});

let glass;
gLoader.load('simple.glb', function(object) {
  scene.add(object.scene);
  object.scene.traverse(function( child ) { 
    if (child.isMesh) {
      //child.castShadow = true;
      //child.receiveShadow = true;
      if (child.name.includes("background")) {
        child.material = backMaterial;
        //child.material = mainMaterial;
      } else if (child.name.includes("Text")) {
          //child.material = new THREE.MeshLambertMaterial({color: 'white'});
          child.material = textMaterial;
          //child.layers.enable(1);
      } else if (child.name.includes("Glass")) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            roughness: .3,
            transmission: 0,
            thickness: 0.5
          })
          glass = child;
          //child.material = backMaterial;
      } else if (child.name.includes("phone") || child.name.includes("Cylinder001")) {
        if (child.name.includes("Cylinder001")) {
          child.material = new THREE.MeshStandardMaterial({
            color: 'white',
            metalness: 1,
            roughness: 0.2
          });
        } else {
          child.material = new THREE.MeshStandardMaterial({
            color: child.material.color,
            metalness: 0,
            roughness: 0.2
          });
        }        
      } else if (child.name.includes("envelope")) {
        child.material = new THREE.MeshLambertMaterial({color: 'white'});
        let target = new THREE.Object3D();
        target.position.copy(child.position);
        spotLight3.target = target;
      } else if (child.name.includes("holder")) {
        child.material = mainMaterial;
      } else {
        child.material = extraMaterial;
      }
    }
    
  })
},
function ( xhr ) {
  //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
},
// called when loading has errors
function ( error ) {
  console.log(error );
});

/******************************** DRESSER & EXTRAS ***********************************/
let testLight;

/*

let dresserMap = textureLoader.load('dresser.jpg');
dresserMap.flipY = false;
dresserMap.encoding = sRGBEncoding;
let dresserNormal = textureLoader.load('dresserNormal.jpg');
dresserNormal.flipY = false;
let dresserRough = textureLoader.load('dresserGlossy.jpg');
dresserRough.flipY = false;
let knobMap = textureLoader.load('knobs.jpg');
//knobMap.flipY = true;
knobMap.encoding = sRGBEncoding;


let dresser;
let phone;
let envelope;
gLoader.load('dresser.glb', function(object) {
  //scene.add(object.scene);
  dresser = object.scene;
  spotLight3.target= dresser;
  //testLight = dresser;
  object.scene.traverse(function( child ) { 
    if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.name == "dresser") {
          child.material = new THREE.MeshStandardMaterial({
            map: dresserMap,
            normalMap: dresserNormal,
            roughnessMap: dresserRough,
            normalMap: dresserNormal,
          });
          child.material.normalScale.flipY = true;
        } else {
          scene.remove(child)
          child.material = new THREE.MeshPhysicalMaterial({
            color: 'black',
            metalness: 1,
            roughness: 0
          });
        }
    } 
  })

  renderer.compile(scene, camera)
  setAllCulled(scene, false);
  renderer.render(scene, camera);
  setAllCulled(scene, true);
  object.scene.position.set(-5.08, -41, 6.72);
  object.scene.scale.set(.64, .64, .64)
  object.scene.rotation.y = Math.PI/4;
  gLoader.load('phone.glb', function(object) {
    //scene.add(object.scene);
    phone = object.scene;
    let phoneColors = {}
    spotLight3.target = phone;
    //testLight = phone
    object.scene.traverse(function( child ) { 
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // TODO: this isn't working properly--it's thinking anything that is an object is the same thing
        let colorEntry = {r: child.material.color.r, b: child.material.color.b, g: child.material.color.g}
        if (!(colorEntry in phoneColors)) {
          phoneColors[colorEntry] = new THREE.MeshStandardMaterial({
            color: child.material.color,
            metalness: 0,
            roughness: 0.2
          });
        }
        child.material = phoneColors[colorEntry]
      } 
    })
    object.scene.position.set(dresser.position.x + .58, dresser.position.y + 1.4, dresser.position.z - 0.46);
    object.scene.scale.set(.2984, .2984, .2984)
    object.scene.rotation.y = Math.PI;
  },
  function ( xhr ) {
    //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
  },
  // called when loading has errors
  function ( error ) {
    console.log(error );
  });
  gLoader.load('envelope.glb', function(object) {
    //scene.add(object.scene);
    envelope = object.scene;
    //testLight = envelope;
    let envelopeColors = {}
    object.scene.traverse(function( child ) { 
      if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (!(child.material.color in envelopeColors)) {
            envelopeColors[child.material.color] = new THREE.MeshPhongMaterial({
              color: child.material.color
            });
          }
          child.material = envelopeColors[child.material.color]
      } 
    })
    object.scene.position.set(dresser.position.x, dresser.position.y + 1, dresser.position.z + 1);
    object.scene.scale.set(.3, .3, .3)
    object.scene.rotation.y = Math.PI / 2;
    
  },
  function ( xhr ) {
    //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

  },
  // called when loading has errors
  function ( error ) {
    console.log(error );
  });
},
function ( xhr ) {
  //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  if (xhr.loaded == xhr.total) {
    console.log('hooray!')
  }
},
// called when loading has errors
function ( error ) {
  console.log(error );
});
*/

/******************************** DUCK ***********************************/


let duck;
gLoader.load('duck.glb', function(object) {
  scene.add(object.scene);
  duck = object.scene;
  //testLight = duck;
  object.scene.traverse(function( child ) { 
    if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // TODO: could be standard if we can afford
        child.material = new THREE.MeshPhongMaterial({
          color: child.material.color,
          //metalness: 0,
          //roughness: 0.4
        });
    }
  })
  object.scene.position.set(-7.8, 6.7, 4.8);
  object.scene.scale.set(.3, .3, .3)
  object.scene.rotation.y = 5.8;
  renderer.shadowMap.autoUpdate = false;
  //object.scene.rotateX(Math.PI/6);
},
function ( xhr ) {
  //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
},
// called when loading has errors
function ( error ) {
  console.log(error );
});


/******************************** GUI ***********************************/
if (useGui) {
  const gui = new GUI();
  testLight = spotLight3;
  const params = {
    'x': testLight.position.x,
    'y': testLight.position.y,
    'z': testLight.position.z,
    /*
    'scaleX': testLight.position.x,
    'scaleY': testLight.position.x,
    'scaleZ': testLight.position.x,
    */
    'rx': testLight.rotation.x,
    'ry': testLight.rotation.y,
    'rz': testLight.rotation.z,
    /*
    'scale' : testLight.position.x,
    'azi' : azi,
    'angle': angle,
    'point intensity': testLight.intensity,
    'point decay': testLight.decay,
    'point penumbra': testLight.penumbra,
    'point angle': testLight.angle,
    */
      
  };

  gui.add( params, 'x', -20, 20).onChange( function ( val ) {
    testLight.position.x = val;
  } );
  gui.add( params, 'y', -50, 30).onChange( function ( val ) {
    testLight.position.y = val;
  } );
  gui.add( params, 'z', -20, 20).onChange( function ( val ) {
    testLight.position.z = val;
  } );
  /*
  gui.add( params, 'scaleX', 0, 2*Math.PI).onChange( function ( val ) {
    frontWallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), val) 
  } );
  gui.add( params, 'scaleY', 0, 2*Math.PI).onChange( function ( val ) {
    frontWallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), val) 
  } );
  gui.add( params, 'scaleZ', 0, 2*Math.PI).onChange( function ( val ) {
    frontWallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, -1), val) 
  } );
  */
  gui.add( params, 'rx', 0,2* Math.PI).onChange( function ( val ) {
    testLight.rotation.x = val;
  } );
  gui.add( params, 'ry', 0,2* Math.PI).onChange( function ( val ) {
    testLight.rotation.y = val;
  } );
  gui.add( params, 'rz', 0,2* Math.PI).onChange( function ( val ) {
    testLight.rotation.z = val;
  } );
  /*
  gui.add( params, 'scale',0, 1).onChange( function ( val ) {
    testLight.scale.set(val, val, val);
  } );
  gui.add( params, 'azi', 0, 180).onChange( function ( val ) {
    azi = val;
    phi = THREE.MathUtils.degToRad( 90 - val );
    sun.setFromSphericalCoords( 1, phi, theta );  
    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
  water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();
  scene.environment = pmremGenerator.fromScene( sky ).texture;
  } );
  gui.add( params, 'angle', 0, 180).onChange( function ( val ) {
    angle = val;
    theta = THREE.MathUtils.degToRad(val);
    sun.setFromSphericalCoords( 1, phi, theta );  
    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
  water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();
  scene.environment = pmremGenerator.fromScene( sky ).texture;
  } );
  gui.add( params, 'point intensity', 0, 5700 ).onChange( function ( val ) {
    testLight.intensity = val;
  } );

  gui.add( params, 'point decay', 0, 2 ).onChange( function ( val ) {
    testLight.decay = val;
  } );
  gui.add( params, 'point penumbra', 0, 1 ).onChange( function ( val ) {
    testLight.penumbra= val;
  } );
  gui.add( params, 'point angle', 0, Math.PI /2 ).onChange( function ( val ) {
    testLight.angle = val;
  } );
  */
}
/******************************** UTILS ***********************************/

function moveCamera(x, y, z, targetX, targetY, targetZ, duration) {
  new TWEEN.Tween(camera.position).to({x: x, y: y, z: z}, duration).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(cameraTarget).to({x: targetX, y: targetY, z: targetZ}, duration).easing(TWEEN.Easing.Quadratic.InOut).start();
}

//window.addEventListener( 'mousemove', onMouseMove, false );
const mouse = new THREE.Vector2();
const rayMouse = new THREE.Vector2();
function onMouseMove( event ) {
    rayMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    rayMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    mouse.x = ( event.clientX - window.innerWidth/2) / 100;
    mouse.y = ( event.clientY - window.innerHeight/2 ) / 100;
}

if (!controlBool) {
  window.addEventListener('wheel', (event) => {
    if (camera.position.y + 0.01 * event.wheelDelta < 30) {
      camera.position.y += 0.01 * event.wheelDelta;
    }
  })
}

function prerender() {
  renderer.compile(scene, camera)
  setAllCulled(scene, false);
  renderer.render(scene, camera);
  setAllCulled(scene, true);
}
/******************************** HTML ***********************************/

// TODO: add a fade to a different color for the currently selected item

const aboutSection = Symbol("About");
const birdSection = Symbol("Bird");
const textSection = Symbol("Text");
const choreSection = Symbol("Chore");
const contactSection = Symbol("Contact");

let curType = aboutSection;

function italicize(item) {
  let children = Array.from(buttons.children)
  children.forEach(child => {
    if (child.classList.contains("italicize")) {
      child.classList.remove("italicize");
      child.classList.add("deitalicize");
    }
  })
  item.classList.add("italicize");
}

let hamburger = document.getElementById("hamburger");
hamburger.addEventListener('click', function() {
  fadeButtonsAway(0);
  fadeSectionsIn(true, 0);
  //projectToNormal(true, false, false, 0)
}, false);

let title = document.getElementById("title");
let hiddenHamburger = document.getElementById("hiddenHamburger");

let aboutSpan = document.createElement("span");
aboutSpan.innerHTML = "about";
aboutSpan.classList.add("clickable");
aboutSpan.addEventListener('click', function() {
  if (lastClicked != aboutSpan) {
    scrollTo(aboutSection);
  } else {
    fadeButtonsAway(0);
    fadeHamburgerIn(false, 500);
    //projectToNormal(true, true, false, 0)
  }
  lastClicked = aboutSpan;
}, false);

let lastClicked = aboutSpan;

let projectSpan = document.createElement("span");
projectSpan.innerHTML = "projects"
projectSpan.classList.add("clickable");
projectSpan.addEventListener('click', function() {
  moveProjects();
}, false);

let contactSpan = document.createElement("span");
contactSpan.innerHTML = "contact me"
contactSpan.classList.add("clickable");
contactSpan.addEventListener('click', function() {
  if (lastClicked != contactSpan) {
    scrollTo(contactSection);
  } else {
    fadeButtonsAway(0);
    fadeHamburgerIn(false, 500);
    //projectToNormal(true, true, false, 0)
  }
  lastClicked = contactSpan;
}, false);

let buttons = document.getElementById("buttons")
let projectNames = ["bird classifier", "autocomplete", "portfolio", "back"];
let projectClicks = [birdSection, textSection, choreSection, choreSection];

function moveProjects() {
  /*let children = Array.from(buttons.children)
  children.forEach(child => {
    child.classList.remove("fadein");
    child.classList.add("fadeaway")
  })*/
  fadeButtonsAway(0);
  setTimeout(() => {
    /*children.forEach(child => {
      child.style.opacity = 0;
      buttons.removeChild(child)
   })*/
   
    for (let i = 0; i < projectNames.length; i++) {
      let toAdd = document.createElement("span");
      toAdd.innerHTML = projectNames[i];
      toAdd.style.opacity = 0;
      // if this isn't the back button
      if (i != projectNames.length - 1) {
        toAdd.addEventListener('click', function() {
         // italicize(toAdd);
          if (lastClicked == null || lastClicked.innerHTML != toAdd.innerHTML) {
            scrollTo(projectClicks[i]);
          } else {
            fadeButtonsAway(0);
            fadeHamburgerIn(false, 500);
            //projectToNormal(true, true, false, 0)
          }
          lastClicked = toAdd;
        }, false);
      } else {
        toAdd.addEventListener('click', function() {
          if (lastClicked == null || lastClicked.innerHTML != toAdd.innerHTML) {
            fadeButtonsAway(1000);
            fadeSectionsIn(false, 1000);
            //projectToNormal(false, false, false, 1000)          
          } else {
            fadeButtonsAway(0);
            fadeHamburgerIn(false, 500);
            //projectToNormal(true, true, false, 0)
          }
          lastClicked = toAdd;
        }, false);
        //toAdd.classList.add("back")
      }
      toAdd.classList.add("clickable");
      setTimeout(() => {
        toAdd.classList.add("fadein");
      }, 1000 * ((i + 1) / projectNames.length));
      buttons.appendChild(toAdd);
    }
  }, 500);
}

function fadeButtonsAway(timeToFadeOut) {
  let buttonChildren =[...buttons.children];
  for (let i = 0; i < buttonChildren.length; i++) {
    //TODO check if fade in is part of class list here
    buttonChildren[i].classList.remove("fadein");
    buttonChildren[i].style.opacity = 1;
    setTimeout(() => {
      buttonChildren[i].classList.add("fadeaway");
    }, ((buttonChildren.length - i) * timeToFadeOut) / buttonChildren.length);
  }
  setTimeout(() => {
    for (let i = 0; i < buttonChildren.length; i++) {
      buttons.removeChild(buttonChildren[i]);
    }
  }, timeToFadeOut + 500)
}

function fadeSectionsIn(hamburger, timeToFadeIn) {
  setTimeout(() => {
    if (hamburger) {
      buttons.classList.toggle("buttons");
      buttons.classList.toggle("menuContainer");
    }
    buttons.appendChild(projectSpan);
    buttons.appendChild(aboutSpan);
    buttons.appendChild(contactSpan);
    aboutSpan.classList.remove("fadeaway");
    projectSpan.classList.remove("fadeaway")
    contactSpan.classList.remove("fadeaway");
    aboutSpan.classList.add("fadein");
    projectSpan.classList.add("fadein")
    contactSpan.classList.add("fadein");
  }, timeToFadeIn + 500)
}

function fadeHamburgerIn(about, timeToFadeIn) {
  setTimeout(() => {
    buttons.classList.toggle("buttons");
    buttons.classList.toggle("menuContainer");
    buttons.appendChild(hamburger);
    hamburger.classList.remove("fadeaway");
    hamburger.classList.add("fadein");
    if (about) {
      buttons.appendChild(title);
      title.classList.remove("fadeaway");
      title.classList.add("fadein")
      buttons.appendChild(hiddenHamburger);
    }
  }, timeToFadeIn);
}

/*
function projectToNormal(hamChecked, toHamburger, toAbout, timeToFadeOut) {
  //fade out subprojects or hamburger
  let buttonChildren =[...buttons.children];
  for (let i = 0; i < buttonChildren.length; i++) {
    //TODO check if fade in is part of class list here
    buttonChildren[i].classList.remove("fadein");
    buttonChildren[i].style.opacity = 1;
    setTimeout(() => {
      buttonChildren[i].classList.add("fadeaway");
    }, ((buttonChildren.length - i) * timeToFadeOut) / buttonChildren.length);
  }
  setTimeout(() => {
    for (let i = 0; i < buttonChildren.length; i++) {
      buttons.removeChild(buttonChildren[i]);
    }
    if (hamChecked) {
      buttons.classList.toggle("buttons");
      buttons.classList.toggle("menuContainer");
    }
    // if we are reverting back to the hamburger after the click
    // i.e. we haven't clicked back or the hamburger itself
    if (toHamburger) {
      buttons.appendChild(hamburger);
      hamburger.classList.remove("fadeaway");
      hamburger.classList.add("fadein")
    } else {
      buttons.appendChild(projectSpan);
      buttons.appendChild(aboutSpan);
      buttons.appendChild(contactSpan);
      aboutSpan.classList.remove("fadeaway");
      projectSpan.classList.remove("fadeaway")
      contactSpan.classList.remove("fadeaway");
      aboutSpan.classList.add("fadein");
      projectSpan.classList.add("fadein")
      contactSpan.classList.add("fadein");
    }
    if (toAbout) {
      buttons.appendChild(title);
      title.classList.remove("fadeaway");
      title.classList.add("fadein")
      buttons.appendChild(hiddenHamburger);
    }
  }, timeToFadeOut + 500)
  //remove them from DOM
  //add back 0 opacity about and contact
  // fade in
}*/

function scrollUp(timeout, type) {
  setTimeout(() => {
    let thirdColumn = document.getElementById("third-column-wrapper");
    let row = document.getElementById("row");
    if (thirdColumn != null) {
      row.removeChild(thirdColumn);
    }
    if (type == textSection) {
      row.innerHTML += "<div class='column third-column-wrapper' id='third-column-wrapper'><div class='green-column scroll-up' id='project-text2'><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p></div>/div>"
    }
    let firstColumn = document.getElementById("first-column-wrapper");
    let secondColumn = document.getElementById("second-column-wrapper");
    firstColumn.innerHTML = "";
    secondColumn.innerHTML = "";
    let firstClasses = []
    let secondClasses = []
    let aboutHtml = "<div class='green-column aboutWrapper scroll-up' id='project-text'><p>I am a recent graduate from the University of Washington - Seattle with a double degree in Computer Science and Linguistics. As showcased in this portfolio, I have experience with a multitude of software development fields, including Machine Learning and Web Design. This portfolio was made over the course of a month, and is intended to showcase my current and previous projects that I have made or helped create throughout my computer science career.</p></div>"
    let textHtml = "<div class='green-column scroll-up' id='project-text'><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p></div>"
    let birdHtml = "<div class='green-column scroll-up' id='project-text'><embed type='text/html' width='100%' height='100%' src='https://manginoja.github.io/455/'></div>"
    let portfolioHtml = "<div class='green-column scroll-up' id='project-text'><p>This portfolio was created over the course of a month. It consists of a culmination of 6 months of self-teaching both 3D modeling using the software Blender, and the Javascript library that powers this website, three.js. In a compromise for the sake of performance and a shorter production timeline, I ended up choosing a minimalist style that still exposes 3D elements without being confusing to navigate or overwhelming to look at. To the right is the 3D model being used on the website.</p></div>"
    let contactHtml = "<div class='green-column scroll-up' id='project-text'><p>If you would like to get in touch, please email me at <a href='mailto:jamangino@gmail.com' target='_blank'>jamangino@gmail.com</a></p></div>"
    switch (type) {
      case (aboutSection):
        firstClasses = ["about", "first-column-wrapper", "column"]
        secondClasses = ["about", "second-column-wrapper", "column"]
        firstColumn.innerHTML = aboutHtml;
        break;
      case(birdSection):
        firstClasses = ["bird", "first-column-wrapper", "column"]
        secondClasses = ["bird", "second-column-wrapper", "column"]
        secondColumn.innerHTML = birdHtml;
        break;
      case(textSection):
        firstClasses = ["text", "first-column-wrapper", "column"]
        secondClasses = ["text", "second-column-wrapper", "column"]
        firstColumn.innerHTML = textHtml;
        break;
      case(choreSection):
        firstClasses = ["chore", "first-column-wrapper", "column"]
        secondClasses = ["chore", "second-column-wrapper", "column"] 
        firstColumn.innerHTML = portfolioHtml;
        break;
      case(contactSection):
        firstClasses = ["contact", "first-column-wrapper", "column"]
        secondClasses = ["contact", "second-column-wrapper", "column"]
        secondColumn.innerHTML = contactHtml;
        break;
      default:
        console.log('oops')
    }
    firstColumn.classList = []
    secondColumn.classList = []
    firstColumn.classList.add(...firstClasses);
    secondColumn.classList.add(...secondClasses);
  }, timeout)
}

function scrollDown() {
  let projectText = document.getElementById("project-text");
  let projectText2 = document.getElementById("project-text2"); 
  projectText.classList.remove("scroll-up");
  projectText.classList.add("scroll-down");
  if (projectText2 != null) {
    projectText2.classList.remove("scroll-up");
    projectText2.classList.add("scroll-down");
  }
}

function resetTextPosition() {
  for (const object of physicalObjects) {
    object.mesh.position.set(object.startX, ventY, object.startZ);
    object.body.position.copy(object.mesh.position);
  }
}

function launchText() {
  for (const object of physicalObjects) {
    setTimeout(() => {
      scene.add(object.mesh);
      world.add(object.body);
    }, object.time)
  }
}

function setAllCulled(obj, culled) {
  obj.frustumCulled = culled;
  obj.children.forEach(child => setAllCulled(child, culled));
}

function scrollTo(type) {
  let y;
  let scrollDuration = 2000;
  let toAbout = false;
  prerender();
  // set up what needs to be in place when
  // we reach this section
  switch (type) {
    case (aboutSection):
      y = 24;
      toAbout = true;
      break;
    case(birdSection):
      y = 7.8;
      //setTimeout(() => {waterLevel(false)}, scrollDuration)
      break;
    case(textSection):
      y = -12;
      onText = true;
      resetTextPosition();
      // TODO: change duration here
      setTimeout(() => {launchText()}, scrollDuration + 500);
      break;
    case(choreSection):
      y = -27;
      break;
    case(contactSection):
      y = -46.24
      break;
    default:
      console.log('oops')
  }
  if (y != null) {
    let timeout = 0;
    /*if (curType == birdSection) {
      //waterLevel(true)
      //timeout = waterSinkTime;
    } else */
    if (curType == textSection) {
      onText = false;
    }
    fadeButtonsAway(0);
    setTimeout(() => {
      scrollDown();
      new TWEEN.Tween(camera.position).to({x: camera.position.x, y: y, z: camera.position.z}, scrollDuration - timeout).easing(TWEEN.Easing.Quadratic.InOut).start();
    }, timeout);
    setTimeout(() => {
      if (curType != type) {
        if (curType == textSection) {
          for (const object of physicalObjects) {
            scene.remove(object.mesh);
            object.mesh.geometry.dispose();
            object.mesh.material.dispose();
            world.remove(object.body);
          }
        }
      }
      scrollUp(0, type);
      curType = type;
      fadeHamburgerIn(toAbout, 0);
      //projectToNormal(true, true, toAbout, scrollDuration + timeout);
    }, scrollDuration)   
  }
 
}

/*
window.addEventListener('click', () => {
  new TWEEN.Tween(camera.position).to({x: camera.position.x, y: camera.position.y + 10, z: camera.position.z}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
})
*/
/******************************** ANIMATE ***********************************/


let clock = new THREE.Clock();
let oldElapsedTime = 0;
scrollUp(500, aboutSection)
function animate() {
  requestAnimationFrame( animate );
  stats.begin();
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime;
  if (onText) {
    world.step(1 / 60, deltaTime, 3)
    for (const object of physicalObjects) {
      object.mesh.position.copy(object.body.position);
      object.mesh.translateX(-object.x / 2)
      object.mesh.translateY(-object.y / 2);
      object.mesh.quaternion.copy(object.body.quaternion);
    }
  }
  



  //var delta = clock.getDelta();
 // cameraTarget = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z - 1);
  //camera.lookAt(cameraTarget);
  /*
  layerToCheck = bloomLayer;
  scene.traverse( darkenNonBloomed );
  scene.background = new THREE.Color(0, 0, 0);
  bloomComposer.render();
  scene.background = new THREE.Color('#02121c');
  scene.traverse( restoreMaterial );
  finalComposer.render();
  */

  renderer.render(scene, camera);
  //console.log(camera.position)
  TWEEN.update();
 // cannonDebugRenderer.update();
  stats.end();

};

animate();