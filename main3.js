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

// camera settings
let near = 2;
let far = 1500;
let parallax = true;
let logPosition = false;
let cameraPosition = new THREE.Vector3(189, 25.6, 31.8);

// lighting settings
let shadow = false;

// render settings
const sceneFile = 'uw.glb';

// fountain settings
let fountainX = -70;
let fountainY = 0;
let fountainZ = 32.5;
let fountainHeight = 18;
let fountainWidth = 0.6;
let fountainCount = 2000;

// seaplane settings
let planeX = 94;
let planeY = 70;
let planeZ = 40;
let planeOffset = 5;

// rain settings
let raining = false;



const scene3 = new THREE.Scene();
scene3.background = new THREE.Color(.52,.8,.92);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, near, far );
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
let cameraTarget = new THREE.Vector3(-1000, 10, 20);
camera.lookAt(cameraTarget);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
if (shadow) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
}
renderer.outputEncoding = sRGBEncoding;
//renderer.physicallyCorrectLights = true;
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


/******************************** OUTLINE ***********************************/

const myRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  encoding: THREE.sRGBEncoding,
} );

const renderScene = new RenderPass( scene3, camera );
let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene3, camera);
const planeComposer = new EffectComposer(renderer, myRenderTarget);

planeComposer.addPass(renderScene);
planeComposer.addPass(outlinePass);


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
scene3.add(sun);

const hemilight = new THREE.HemisphereLight( 0xc88051, 0x080820, 0.968 );
scene3.add( hemilight );

const ambientLight =  new THREE.AmbientLight(0xf2ead0, .471);
scene3.add(ambientLight);

/******************************** scene3 LOADER ***********************************/

// scene3 loader
var gLoader = new GLTFLoader();
let clouds = [];

// for decompreession
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'node_modules/three/examples/js/libs/draco/gltf/' );
gLoader.setDRACOLoader( dracoLoader );
gLoader.load(
  // resource URL
  sceneFile,
  // called when resource is loaded
  function ( object ) {
    scene3.add(object.scene);
    object.scene.traverse( function( child ) { 
        if (child.isMesh) { 
            if (shadow) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
            let color = child.material.color;
            const colors = new Uint8Array(3);
            for (let i = 0; i <= colors.length; i++) {
            colors[i] =  (i / colors.length) * 256;
            }
            console.log(child.name);
            const gradientMap = new THREE.DataTexture(colors, colors.length, 1, format);
            gradientMap.needsUpdate = true;
            let childMaterial = new THREE.MeshToonMaterial({color: color, gradientMap: gradientMap});
            if (!child.name.includes("Icosphere")) {
              childMaterial.side = THREE.DoubleSide;
            } else if (child.name.includes('Icosphere0') && !child.name.includes("001") && !child.name.includes("002")) {
              clouds.push(child);
            }
            if (child.name == "Plane004") {
              childMaterial = new THREE.MeshPhysicalMaterial({color: child.material.color, clearcoat: 1});
            }
            child.material= childMaterial;
        }
    } );
    if (shadow) {
        object.scene.castShadow = true;
        object.scene.receiveShadow = true; 
    }
  },
  // called when loading is in progress
  function ( xhr ) {
    //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  // called when loading has errors
  function ( error ) {
    console.log(error );
  }
);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render( scene3, camera );
}

/******************************** SEAPLANE ***********************************/

let seaplane;
let propellors;
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
  scene3.add(object.scene);
  // position in water
  //object.scene.position.set(-500, -15, 300);
  
  let animationTime = 4000;
  object.scene.position.set(planeX, planeY, planeZ);
  object.scene.rotateY(Math.PI/4);
  let down = new TWEEN.Tween(object.scene.position).to({x: planeX, y: planeY - planeOffset, z: planeZ}, animationTime / 2).easing(TWEEN.Easing.Sinusoidal.InOut)
  let up = new TWEEN.Tween(object.scene.position).to({x: planeX, y: planeY, z: planeZ}, animationTime / 2).easing(TWEEN.Easing.Sinusoidal.InOut)
  let turnDown = new TWEEN.Tween(object.scene.rotation).to({x: Math.PI / 32, y:Math.PI/4, z:0}, animationTime / 4).easing(TWEEN.Easing.Sinusoidal.Out)
  let turnDownSettle = new TWEEN.Tween(object.scene.rotation).to({x: 0, y:Math.PI/4, z:0}, animationTime / 4).easing(TWEEN.Easing.Sinusoidal.In)
  let turnUp = new TWEEN.Tween(object.scene.rotation).to({x: -Math.PI / 32, y:Math.PI/4, z:0}, animationTime / 4).easing(TWEEN.Easing.Sinusoidal.Out)
  let turnUpSettle = new TWEEN.Tween(object.scene.rotation).to({x: 0, y:Math.PI/4, z:0}, animationTime / 4).easing(TWEEN.Easing.Sinusoidal.In)
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

/******************************** FOUNTAIN CREATION ***********************************/

let fountainWater = new THREE.CircleGeometry(12, 10);
let waterMaterial = new THREE.MeshPhongMaterial({color: 0x006994, transparent: true, opacity: 0.5});
let fountainMesh = new THREE.Mesh(fountainWater, waterMaterial);
scene3.add(fountainMesh);
fountainMesh.rotateX(3*Math.PI / 2);
fountainMesh.position.set(fountainX + .1, fountainY + 1, fountainZ);


let fountainAngles = [];
let fountainWidths = []
let fountainVertices = []
for (let i = 0; i < fountainCount; i++) {
  fountainAngles.push(Math.random() * 2 * Math.PI);
  if (i < fountainCount/16) {
    fountainWidths.push(.05);
  } else {
    fountainWidths.push(Math.random() * fountainWidth + .05);
  }
  let y = (Math.random() * fountainHeight) + fountainY;
  let x = fountainWidths[i]*Math.sqrt(fountainHeight - (y - fountainY))*Math.cos(fountainAngles[i]) + fountainX;
  let z = fountainWidths[i]*Math.sqrt(fountainHeight - (y - fountainY))*Math.sin(fountainAngles[i]) + fountainZ;
  fountainVertices.push(x)
  fountainVertices.push(y)
  fountainVertices.push(z)
}
let fountainArray = Float32Array.from(fountainVertices)
let fountainGeo = new THREE.BufferGeometry();
fountainGeo.setAttribute('position', new THREE.BufferAttribute(fountainArray, 3));
let fountainMaterial = new THREE.PointsMaterial({
  color: 0x006994,
  size: .4,
  transparent: true,
  opacity: 0.5
});
let fountain = new THREE.Points(fountainGeo,fountainMaterial);
scene3.add(fountain);

/******************************** RAIN CREATION ***********************************/

let rainCount = 15000;
let vertices = [];
for(let i=0;i<rainCount;i++) {
  vertices.push(Math.random() * 400 -200);
  vertices.push(Math.random() * 500 - 250);
  vertices.push(Math.random() * 400 - 200);
}
let floatArray = Float32Array.from(vertices);
let rainGeo = new THREE.BufferGeometry();
rainGeo.setAttribute('position', new THREE.BufferAttribute(floatArray, 3));
let rainMaterial = new THREE.PointsMaterial({
  color: 0x666666,
  size: .1,
  transparent: true
});
let rain = new THREE.Points(rainGeo,rainMaterial);
let velocities = [];
for (let i = 0; i < rainCount; i++) {
  velocities.push(0);
}

document.getElementById("input").addEventListener('focusin', () => {rainy()});

function rainy() {
  setTimeout(() => {scene3.add(rain)}, 1300);
  for (let i = 0; i < clouds.length; i++) {
    new TWEEN.Tween(clouds[i].material.color).to({r:.325, g:.408, b:.447}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  }
  new TWEEN.Tween(scene3.background).to({r:.325, g:.408, b:.447}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(sun).to({intensity: .1}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(sun.color).to({r: 1, g: 1, b: 1}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(hemilight).to({intensity: 0}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(ambientLight).to({intensity: .2}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  raining = true;
}

function updateRain() {
  // RAIN https://redstapler.co/three-js-realistic-rain-tutorial/
  if (raining) {
    for (let i = 0; i < rainCount; i++) {
      velocities[i] -=  0.05 + Math.random() * 0.1
      let y = rainGeo.attributes.position.getY(i) + velocities[i];
      if (y < -200) {
        y = 200;
        velocities[i] = 0;
      }
      rainGeo.attributes.position.setXYZ(i, rainGeo.attributes.position.getX(i), y, rainGeo.attributes.position.getZ(i));
    }
    rainGeo.attributes.position.needsUpdate = true;
    rain.rotation.y +=0.002;
    let lightning = Math.random();
    if (lightning < 0.01) {
      let lightningDuration= 300 + Math.random() * 200;
      let cloudNum = parseInt(Math.random() * (clouds.length))
      let strike = new TWEEN.Tween(clouds[cloudNum].material.color).to({r:1, g:1, b:1}, lightningDuration).easing(TWEEN.Easing.Elastic.InOut);
      let end = new TWEEN.Tween(clouds[cloudNum].material.color).to({r:.325, g:.408, b:.447}, lightningDuration).easing(TWEEN.Easing.Elastic.InOut);
      let lightBangStart = new TWEEN.Tween(sun).to({intensity: 1}, lightningDuration).easing(TWEEN.Easing.Elastic.InOut);
      let lightBangEnd = new TWEEN.Tween(sun).to({intensity: 0}, lightningDuration).easing(TWEEN.Easing.Elastic.InOut);
      strike.chain(end);
      lightBangStart.chain(lightBangEnd);
      strike.start();
      lightBangStart.start();
    }
  }
}

/******************************** SUN (WEATHER) ***********************************/


function sunny() {
  new TWEEN.Tween(scene3.background).to({r:.52, g:.8, b:.92}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  for (let i = 0; i < clouds.length; i++) {
    new TWEEN.Tween(clouds[i].material.color).to({r:1, g:1, b:1}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  }
  new TWEEN.Tween(sun).to({intensity: 1}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(sun.color).to({r: 0.8745, g: 0.5373, b: 0.447}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(hemilight).to({intensity: .968}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(ambientLight).to({intensity: .471}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  raining = false;
  setTimeout(() => {scene3.remove(rain), 1800});
}

/******************************** GUI ***********************************/
/*
const gui = new GUI();

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
*/

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

document.getElementById("body").addEventListener('click', clickCheck);
function clickCheck() {
  if (outlinePass.selectedObjects.includes(clouds[0])) {
    if (!raining) {
      rainy();
    } else {
      sunny();
    }
  }
}

/******************************** ANIMATE ***********************************/
let i = 0;
const raycaster = new THREE.Raycaster();
let fading = false;

function animate() {
  i++;
  requestAnimationFrame( animate );
  // MOUSE PARALLAX
  if (parallax) {
      camera.position.z += (cameraPosition.z + mouse.x - camera.position.z) * .02 ;
      camera.position.y += (cameraPosition.y - mouse.y - camera.position.y) * .02 ;
  }
  camera.lookAt(cameraTarget);

  
  raycaster.setFromCamera( rayMouse, camera );
  const intersects = raycaster.intersectObjects(scene3.children);

  // TODO fix so the rain doesn't get in the way :)
  if (intersects.length > 0 && intersects[0].object.name.includes("Icosphere0")) {
    outlinePass.selectedObjects = clouds;
    body.style.cursor = "pointer";
    if (!fading) {
      fadeTextIn("change the weather?");
      fading = true;
    }
  } else {
    body.style.cursor = "default";
    outlinePass.selectedObjects = [];
    if (fading) {
      fadeTextOut();
    }
    fading = false;
  }

  
  if (logPosition) {
      console.log(camera.position);
  }

  // RAIN https://redstapler.co/three-js-realistic-rain-tutorial/
  updateRain();

  // fountain
  for (let i = 0; i < fountainCount; i++) {
    let y = fountainGeo.attributes.position.getY(i) - 0.1;
    if (y < fountainY) {
      y = fountainY + fountainHeight;
    }
    let x = fountainWidths[i] * Math.sqrt(fountainHeight - (y - fountainY))*Math.cos(fountainAngles[i]) + fountainX;
    let z = fountainWidths[i] * Math.sqrt(fountainHeight - (y - fountainY))*Math.sin(fountainAngles[i]) + fountainZ;
    fountainGeo.attributes.position.setXYZ(i, x, y, z);
  }
  fountainGeo.attributes.position.needsUpdate = true;


  // no clue why but setting to null makes it so the outline doesn't fuck with the colors
  renderer.setRenderTarget(null);
  if (i < 200) {
    renderer.render(scene3, camera);
  }
  planeComposer.render();
  TWEEN.update();
};

animate();