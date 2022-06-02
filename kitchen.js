import './style.css'
import * as THREE from 'three';
import CANNON from 'cannon';
import CannonDebugRenderer from './CannonDebugRenderer.js'
import * as easing from '@popmotion/easing'
import { MapControls }  from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Water } from './Water2';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {BlendFunction, HueSaturationEffect, EffectPass} from 'postprocessing';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {LuminosityShader} from 'three/examples/jsm/shaders/LuminosityShader.js'
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader.js'; 
import {OutlineEffect} from 'three/examples/jsm/effects/OutlineEffect.js'; 
import { ACESFilmicToneMapping, CineonToneMapping, LinearToneMapping, ObjectSpaceNormalMap, ReinhardToneMapping, sRGBEncoding} from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'; 
import Stats from 'stats.js'

// TODOS:
// write content for the sections
// make a simpler dresser that goes with style
// bake with objects in scene
// labels need ~flair~


let controlBool = true;
let useGui = true;

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

// camera settings
let near = 1;
let far = 29;
let cameraPosition = new THREE.Vector3(6.5, 6.3, 6);
far = 6000;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#02121c');

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, near, far );
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
let cameraTarget = new THREE.Vector3(0, 0, 0);
camera.lookAt(cameraTarget);

const renderer = new THREE.WebGLRenderer({powerPreference: 'high-performance', antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = sRGBEncoding;
renderer.sortObjects = false;
document.body.appendChild( renderer.domElement );

renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowCameraNear = camera.near;
renderer.shadowCameraFar = camera.far;
renderer.shadowCameraFov = 50;
renderer.shadowMapBias = 0;
renderer.shadowMapDarkness = 0.5;
renderer.shadowMapWidth = 1024;
renderer.shadowMapHeight = 1024;

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

/******************************** LIGHTS ***********************************/


const ambientLight = new THREE.AmbientLight(0xffffff,.2);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.angle = .32;
spotLight.position.set(-21, 18.5, 25);
spotLight.shadow.camera.far = 70;
let lights = [spotLight];
lights.forEach(light => {
  scene.add(light);
  
  light.decay = 2;
  light.castShadow = true;
  light.shadow.camera.left = -12;
  light.shadow.camera.right = 2;
  light.shadow.camera.top = 12;
  light.shadow.camera.bottom = -22;
  
  
  light.shadow.bias = -.001
  light.shadow.radius = 2
})

const cameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
scene.add(cameraHelper)

let spotLightTarget = new THREE.Object3D();
spotLightTarget.position.set(0, 0, 0);
scene.add(spotLightTarget);
spotLight.target = spotLightTarget;

let spotlightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotlightHelper);

/******************************** SCENE LOADING ***********************************/

var gLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'node_modules/three/examples/js/libs/draco/gltf/' );
gLoader.setDRACOLoader( dracoLoader );

const textureLoader = new THREE.TextureLoader();
let bakeOne = textureLoader.load('bakeOne.jpg');
bakeOne.flipY = false;
bakeOne.encoding = sRGBEncoding;
let bakeOneMaterial = new THREE.MeshBasicMaterial({map: bakeOne});

let bakeTwo = textureLoader.load('bakeTwo.jpg');
bakeTwo.flipY = false;
bakeTwo.encoding = sRGBEncoding;
let bakeTwoMaterial = new THREE.MeshBasicMaterial({map: bakeTwo});

gLoader.load('kitchen.glb', function(object) {
  scene.add(object.scene);
  object.scene.traverse(function( child ) {
      if (child.isMesh) {
        console.log(child.name)
          //child.castShadow = true;
          //child.receiveShadow = true;
          if (child.name.includes("bakeOne")) {
            child.material = bakeOneMaterial;
          } else if (child.name.includes("bakeTwo")) {
            child.material = bakeTwoMaterial;
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
/******************************** GUI ***********************************/
if (useGui) {
  const gui = new GUI();
  testLight = spotLight;
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

/******************************** ANIMATE ***********************************/

function animate() {
  requestAnimationFrame( animate );
  //console.log(camera.position)
  stats.begin();
  renderer.render(scene, camera);
  TWEEN.update();
  stats.end();
  spotlightHelper.update();
};

animate();