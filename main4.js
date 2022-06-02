import './style.css'
import * as THREE from 'three';
import { MapControls }  from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {LuminosityShader} from 'three/examples/jsm/shaders/LuminosityShader.js'
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader.js'; 
import {OutlineEffect} from 'three/examples/jsm/effects/OutlineEffect.js'; 
import { ACESFilmicToneMapping, CineonToneMapping, LinearToneMapping, ObjectSpaceNormalMap, ReinhardToneMapping, sRGBEncoding} from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import { MeshBasicMaterial } from 'three';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'; 
import { MeshPhysicalMaterial } from 'three';
import { Plane } from 'three';

// camera settings
let near = 0.1;
let far = 1500;
let parallax = false;
let logPosition = false;
let cameraPosition = new THREE.Vector3(0, 0, 0);


// lighting settings
let shadow = false;

// render settings
const sceneFile = 'seaplane.glb';

// seaplane settings
let planeX = 20;
let planeY = 0;
let planeZ = 20;
let planeOffset = 1;

//TODO: Spawn random clouds in and have them move across the screen to create the
// illusion of motion ????????

const scene4 = new THREE.Scene();
scene4.background = new THREE.Color(.52,.8,.92);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, near, far );
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
let cameraTarget = new THREE.Vector3(planeX, planeY, planeZ);
camera.lookAt(cameraTarget);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
if (shadow) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
}
renderer.outputEncoding = sRGBEncoding;
document.body.appendChild( renderer.domElement );

let controls = new MapControls( camera, renderer.domElement );

window.addEventListener( 'mousemove', onMouseMove, false );
const mouse = new THREE.Vector2();
const rayMouse = new THREE.Vector2();
function onMouseMove( event ) {
    rayMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    rayMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    mouse.x = ( event.clientX - window.innerWidth/2) / 100;
    mouse.y = ( event.clientY - window.innerHeight/2 ) / 100;
}

const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;


/******************************** LIGHTS ***********************************/
//Do i want PCL with intensity 3.81, or not PCL with intensity .3?
const sun = new THREE.DirectionalLight(0xdf8972, .3);
sun.position.set(300, 300, 100);
if (shadow) {
  sun.castShadow = true;

  sun.shadow.camera.near = 0.5;       
  sun.shadow.camera.far = 5000;      
  sun.shadow.camera.left = -500;
  sun.shadow.camera.bottom = -500;
  sun.shadow.camera.right = 500;
  sun.shadow.camera.top = 500;
}
scene4.add(sun);

const hemilight = new THREE.HemisphereLight( 0xc88051, 0x080820, 0.968 );
scene4.add( hemilight );

const ambientLight =  new THREE.AmbientLight(0xf2ead0, .471);
scene4.add(ambientLight);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render( scene4, camera );
}

/******************************** SEAPLANE ***********************************/
var gLoader = new GLTFLoader();
let seaplane;
let propellors;
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'node_modules/three/examples/js/libs/draco/gltf/' );
gLoader.setDRACOLoader( dracoLoader );
gLoader.load('plane.glb', function(object) {
  object.scene.traverse(function (child) {
    if (child.isMesh) {
      let color = child.material.color;
      const colors = new Uint8Array(3);
      for (let i = 0; i <= colors.length; i++) {
        colors[i] =  (i / colors.length) * 256;
      }
      const gradientMap = new THREE.DataTexture(colors, colors.length, 1, format);
      gradientMap.needsUpdate = true;
      let childMaterial = new THREE.MeshToonMaterial({color: color, gradientMap: gradientMap});
      child.material= childMaterial;
    }
    if (child.name == 'Plane002') {
      propellors = child;
      child.material.color.setHex(0x444444);
    }
  });
  scene4.add(object.scene);
  // position in water
  //object.scene.position.set(-500, -15, 300);
  
  let animationTime = 4000;
  let planeRotationY = 3* Math.PI/4;
  object.scene.position.set(planeX, planeY, planeZ);
  object.scene.rotation.y = planeRotationY
  let down = new TWEEN.Tween(object.scene.position).to({x: planeX, y: planeY - planeOffset, z: planeZ}, animationTime / 2).easing(TWEEN.Easing.Sinusoidal.InOut)
  let up = new TWEEN.Tween(object.scene.position).to({x: planeX, y: planeY, z: planeZ}, animationTime / 2).easing(TWEEN.Easing.Sinusoidal.InOut)
  let turnDown = new TWEEN.Tween(object.scene.rotation).to({x: Math.PI / 100, y: planeRotationY, z:0}, animationTime / 4).easing(TWEEN.Easing.Sinusoidal.Out)
  let turnDownSettle = new TWEEN.Tween(object.scene.rotation).to({x: 0, y: planeRotationY, z:0}, animationTime / 4).easing(TWEEN.Easing.Sinusoidal.In)
  let turnUp = new TWEEN.Tween(object.scene.rotation).to({x: -Math.PI / 100, y: planeRotationY, z:0}, animationTime / 4).easing(TWEEN.Easing.Sinusoidal.Out)
  let turnUpSettle = new TWEEN.Tween(object.scene.rotation).to({x: 0, y: planeRotationY, z:0}, animationTime / 4).easing(TWEEN.Easing.Sinusoidal.In)
  down.chain(up);
  up.chain(down);
  down.start();
  turnDown.chain(turnDownSettle);
  turnDownSettle.chain(turnUp);
  turnUp.chain(turnUpSettle);
  turnUpSettle.chain(turnDown);
  turnDown.start();
  if (shadow) {
    object.scene.castShadow = true;
    object.scene.receiveShadow =  true;
  }
  seaplane = object.scene;
  flyPlane();
},
function ( xhr ) {
  //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
},
// called when loading has errors
function ( error ) {
  console.log(error );
});


function flyPlane() {
  //new TWEEN.Tween(seaplane.position).to({x: -500, y:200, z:1000}, 10000).easing(TWEEN.Easing.Quadratic.InOut).start();
  //new TWEEN.Tween(seaplane.rotation).to({x: "-" + Math.PI/16}, 10000).easing(TWEEN.Easing.Quadratic.InOut).start();
  let spin = new TWEEN.Tween(propellors.rotation).to({y: Math.PI/2}, 250);
  let spin2 = new TWEEN.Tween(propellors.rotation).to({y: 2*Math.PI}, 250);
  spin.chain(spin2);
  spin2.chain(spin);
  spin.start();
}

/******************************** GUI ***********************************/

const gui = new GUI();
let point = camera;

const params = {
    'x': point.position.x,
    'y': point.position.y,
    'z': point.position.z
};

gui.add( params, 'x', -100, 150).onChange( function ( val ) {
  point.position.x = val;
} );
gui.add( params, 'y', 0, 200).onChange( function ( val ) {
  point.position.y = val;
} );
gui.add( params, 'z', 0, 60).onChange( function ( val ) {
  point.position.z = val;
} );


/******************************** UI ELEMENTS ***********************************/
function fadeTextIn(str) {
  let bottomText = document.getElementById("bottomText")
  bottomText.innerHTML = str;
  bottomText.classList.remove("text-fade-out");
  bottomText.classList.add("text-fade-in");
}

function fadeTextOut() {
  let bottomText = document.getElementById("bottomText")
  bottomText.classList.remove("text-fade-in");
  bottomText.classList.add("text-fade-out");
}

/******************************** ANIMATE ***********************************/

function animate() {
  requestAnimationFrame( animate );
  // MOUSE PARALLAX
  if (parallax) {
      camera.position.z += (cameraPosition.z + mouse.x - camera.position.z) * .02 ;
      camera.position.y += (cameraPosition.y - mouse.y - camera.position.y) * .02 ;
  }
  camera.lookAt(cameraTarget);

  if (logPosition) {
      console.log(camera.position);
  }
  renderer.render(scene4, camera);
  TWEEN.update();
};

animate();