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
import {GammaCorrectionShader} from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
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

let controlBool = true;
let useGui = false;
let selectedObjects = [];

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

// camera settings
let near = 1;
let far = 50;
let cameraPosition = new THREE.Vector3(20.21, 4.88, -7);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#02121c');

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, near, far );
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
let cameraTarget = new THREE.Vector3(-20, 4.4, 3.76);
camera.lookAt(cameraTarget);

const renderer = new THREE.WebGLRenderer({powerPreference: 'high-performance'});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild( renderer.domElement );

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
/******************************** SCENE ***********************************/

let sphereGeo = new THREE.BoxGeometry(10, 10, 10, 1, 1, 1);
let sphereMat = new THREE.MeshBasicMaterial({color: 'red'});
let sphere = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphere);
sphere.position.copy(cameraTarget);
sphere.layers.enable(1)

/******************************** BLOOM ***********************************/
const myRenderTarget = new THREE.WebGLRenderTarget( 800, 600, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    encoding: THREE.sRGBEncoding,
  } );
  
  const bloomLayer = new THREE.Layers();
  bloomLayer.set( 1 );
  
  const renderScene = new RenderPass( scene, camera );
  
  const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
  bloomPass.threshold = 0;
  bloomPass.strength = .5;
  bloomPass.radius = 1;
  
  const bloomComposer = new EffectComposer( renderer );
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass( renderScene );
  bloomComposer.addPass( bloomPass );
  
  bloomComposer.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
  
  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial( {
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: document.getElementById( 'vertexshader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
      defines: {},
      precision: 'lowp'
    } ), 'baseTexture'
  );
  
  finalPass.needsSwap = true;

  let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio), scene, camera);
  outlinePass.visibleEdgeColor.set( "#ffffff" );
  
  const finalComposer = new EffectComposer(renderer, myRenderTarget);
  finalComposer.addPass( renderScene );
  finalComposer.addPass( finalPass );
  finalComposer.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
  finalComposer.setPixelRatio(window.devicePixelRatio);
  const gammaCorrectionPass1 = new ShaderPass( GammaCorrectionShader );
  finalComposer.addPass( gammaCorrectionPass1 );


  const outlineComposer = new EffectComposer(renderer, myRenderTarget);
  outlineComposer.addPass( renderScene );
  outlineComposer.addPass( outlinePass );
  outlineComposer.addPass( gammaCorrectionPass1 );
  outlineComposer.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
  outlineComposer.setPixelRatio(window.devicePixelRatio);
  
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
/******************************** UTILS ***********************************/
const mouse = new THREE.Vector2();
const rayMouse = new THREE.Vector2();
//renderer.domElement.addEventListener( 'pointermove', onPointerMove );
function onPointerMove( event ) {
    if ( event.isPrimary === false ) return;
    rayMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    rayMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    checkIntersection();
}

function addSelectedObject( object ) {
    selectedObjects = [];
    selectedObjects.push( object );
}

function checkIntersection() {

    raycaster.setFromCamera( rayMouse, camera );

    const intersects = raycaster.intersectObject( scene, true );

    if ( intersects.length > 0 ) {

        const selectedObject = intersects[ 0 ].object;
        addSelectedObject( selectedObject );
        outlinePass.selectedObjects = selectedObjects;

    } else {

        outlinePass.selectedObjects = [];

    }

}
if (!controlBool) {
  window.addEventListener('wheel', (event) => {
    if (camera.position.y + 0.01 * event.wheelDelta < 30) {
      camera.position.y += 0.01 * event.wheelDelta;
    }
  })
}

/******************************** ANIMATE ***********************************/
let black = new THREE.Color(0, 0, 0);
let originalBackground = new THREE.Color('#000205');
const raycaster = new THREE.Raycaster();
layerToCheck = bloomLayer;
let i = 0;
function animate() {
  requestAnimationFrame( animate );
  //console.log(camera.position);
  stats.begin();
  camera.lookAt(cameraTarget);
  //renderer.render(scene, camera);
  //TWEEN.update();
  
  //spotlightHelper.update();
    /*
  raycaster.setFromCamera(rayMouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0 && intersects[0].object == sphere) {
    outlinePass.selectedObjects = [sphere];
    body.style.cursor = "pointer";
  } else {
    body.style.cursor = "default";
    outlinePass.selectedObjects = [];
  }
  */
    
  if (i < 100) {
      
    scene.traverse( darkenNonBloomed );
    bloomComposer.render();
    scene.traverse( restoreMaterial );
    finalComposer.render();
    //outlineComposer.render();
    i++;
    console.log(i);
  } else {
    finalComposer.render();
    //renderer.render(scene, camera);
  }
  stats.end();
};

animate();