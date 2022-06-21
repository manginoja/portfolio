import './style.css'
import * as THREE from 'three';
import * as easing from '@popmotion/easing'
import { MapControls }  from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {GammaCorrectionShader} from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import {SMAAPass} from 'three/examples/jsm/postprocessing/SMAAPass.js';
import {BlendFunction, HueSaturationEffect, EffectPass, Resolution} from 'postprocessing';
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
import { MeshToonMaterial } from 'three';
import { DirectionalLight } from 'three';

const curve = easing.createMirroredEasing(
  easing.createExpoIn(4)
)
// camera settings
let near = 1;
let far = 6000;
let cameraPosition = new THREE.Vector3(30, 10, 15);
cameraPosition = new THREE.Vector3(2276, 0, 2276);

const scene4 = new THREE.Scene();
scene4.background = new THREE.Color('#000205');

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, near, far );
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
let cameraTarget = new THREE.Vector3(0, 10, 0);
camera.lookAt(cameraTarget);

const renderer = new THREE.WebGLRenderer({powerPreference: 'high-performance'});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.LinearEncoding;
//renderer.sortObjects = false;
//renderer.debug = false;
document.body.appendChild( renderer.domElement );


let controls = new MapControls( camera, renderer.domElement );
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render( scene4, camera );
    composer.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
}

let numLoaded = 0;
const textureLoader = new THREE.TextureLoader();

const myRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, {
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  format: THREE.RGBAFormat,
  encoding: THREE.sRGBEncoding,
} );

const bloomLayer = new THREE.Layers();
bloomLayer.set( 1 );

const renderScene = new RenderPass( scene4, camera );

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
    precision: 'mediump'
  } ), 'baseTexture'
);

finalPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer, myRenderTarget);
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );
finalComposer.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
finalComposer.setPixelRatio(window.devicePixelRatio);
const gammaCorrectionPass1 = new ShaderPass( GammaCorrectionShader );
finalComposer.addPass( gammaCorrectionPass1 );

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

/******************************** STAR CREATION ***********************************/
//https://stackoverflow.com/questions/5531827/random-point-on-a-given-sphere
function randomSpherePoint(x0,y0,z0,radius){
  var u = Math.random();
  var v = Math.random();
  var theta = 2 * Math.PI * u;
  var phi = Math.acos(2 * v - 1);
  var x = x0 + (radius * Math.sin(phi) * Math.cos(theta));
  var y = y0 + (radius * Math.sin(phi) * Math.sin(theta));
  var z = z0 + (radius * Math.cos(phi));
  return [x,y,z];
}
let starCount = 10000;
let starRadius = 1500;
let starVertices = [];
let starWeights = [];
for (let i = 0; i < starCount; i++) {
  let [x,y,z] = randomSpherePoint(0, 0, 0, starRadius);
  starVertices.push(x);
  starVertices.push(y);
  starVertices.push(z);
  starWeights.push(Math.random() * .01);
}

let starMaterial = new THREE.PointsMaterial({
  color: 0x666666,
  size: 5,
  transparent: true
});
let starArray = Float32Array.from(starVertices);
let starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starArray, 3));
let stars = new THREE.Points(starGeo, starMaterial);
scene4.add(stars);
//stars.layers.enable(1);

function updatePointsGeometry(points) {
  for (var i = 0; i < points.geometry.attributes.position.count * 3; i += 3) {
      points.geometry.attributes.position.array[i+0] +=  starWeights[i / 3] * points.geometry.attributes.position.array[i+0];
      points.geometry.attributes.position.array[i+1] +=  starWeights[i / 3] * points.geometry.attributes.position.array[i+1];
      points.geometry.attributes.position.array[i+2] +=  starWeights[i / 3] * points.geometry.attributes.position.array[i+2];
  }
  points.geometry.attributes.position.needsUpdate = true;
}

/******************************** SCENE LOADING ***********************************/
var gLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'node_modules/three/examples/js/libs/draco/gltf/' );
gLoader.setDRACOLoader( dracoLoader );

function processTexture(fileName) {
    const texture = textureLoader.load(fileName, function() {numLoaded++;});
    texture.encoding = THREE.sRGBEncoding;
    texture.flipY = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    const bakedMaterial = new THREE.MeshBasicMaterial({map: texture});
    bakedMaterial.transparent = true;
    return bakedMaterial;
}

const ambientLight = new THREE.AmbientLight(0xf2ead0,.471);
scene4.add(ambientLight);

const spotLight = new THREE.SpotLight(0xeec61f, 1);
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene4.add(spotLight);
spotLight.position.set(23, 8.2, -.6);
spotLight.angle = .32;
spotLight.castShadow = true;

const loader = new FontLoader();
let textMesh;
let textMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, transparent: true});
let texts = ["loading.", "loading..", "loading...", "click to enter"];
let textGeos = [];

loader.load( 'node_modules/three/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {
  
  texts.forEach(text => {
    let textGeo = new TextGeometry(text, {
      font: font,
      size: 80,
      height: 5,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 10,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 5
    } );
    textGeos.push(textGeo)
  })
  
  textMesh = new THREE.Mesh(textGeos[0], textMaterial);
  scene4.add(textMesh);
  textMesh.position.set(1300, 0, -1300);
} );



let mixer;
let bird;
let birdAnimations;
gLoader.load('birdtest.glb', function(object) {
  bird = object.scene;
  spotLight.target = bird;
  bird.receiveShadow = true;
  bird.castShadow = true;
  object.scene.scale.set(0.1, 0.1, 0.1)
  object.scene.position.set(19.3, 9, 5.4);
  object.scene.rotateY(Math.PI)
  scene4.add(object.scene);
  //testLight = bird
  birdAnimations = object.animations;

  object.scene.traverse(function( child ) { 
    if (child.name.includes("Cube")) {
      child.material = new THREE.MeshStandardMaterial({transparent: true, opacity: 0})
    }
  })
})

let objectNames = ["info", "mainBuilding", "building1test", "building2", "building3", "building4",
  "building1TopWindows", "building1BottomWindows", "trashes", "meetTheProducer", "building1Balcony", "building2Windows", "building3Windows",
  "building4TopWindows", "building4BottomWindows", "columns", "fishAndCases", "mainbuildingwindows", "building4Bricks1", "building4Bricks2", "building4Bricks3",
  "building4Bricks4", "building4Bricks5", "farmersMarket",
  "building4Balcony", "frontTulips", "middleTulips", "backTulips", "frontPlanters", "plantersBack",
  "name", "signHolder", "greenboys", "bookshelf", "bookstoreExtras", "building4BricksLeft",
  "building4BricksRight", "brickFloorFron", "brickFloorBack", "countersFishBoards", "building4Lights", "platform", "edgeBricks",
  "sidewalk1", "sidewalk2", "sidewalk3", "sidewalk4", "sidewalk5", "bookstore", "garage", "mainBuildingCeiling", "insideBricks1",
  "lastStore", "middleStore", "garageBricks", "lamps", "dots", "raling"];
let infoMesh;
let pikeMeshes = [];
gLoader.load('pike (1) (1).glb', function(object) {
  for (let i = 0; i < objectNames.length; i++) {
    let mesh = object.scene.children.find((child) => child.name === objectNames[i]);
    let material = processTexture(objectNames[i] + "saturated.jpg");;
    if (objectNames[i] == "info") {
      infoMesh = mesh;
    } else if (objectNames[i] == "name") {
      mesh.layers.enable(1);
    }
    if (mesh == null) {
      console.log(objectNames[i])
    } else {
      mesh.material = material;
    }
    if (mesh != null && !mesh.isMesh) {
      for (let j = 0; j < mesh.children.length; j++) {
          mesh.children[j].material = material;
      }
    }

  }
  object.scene.traverse(function( child ) { 
    pushChildren(child);
  })
  scene4.add(object.scene);

},
function ( xhr ) {
  //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
},
// called when loading has errors
function ( error ) {
  console.log(error );
});

function pushChildren(child) {
  if (child.isMesh) {
    child.material.transparent = true;
    pikeMeshes.push(child);
  } else if (child.children.length > 0) {
    for (let i = 0; i < child.children.length; i++) {
      pushChildren(child.children[i])
    }
  }
}

let birdDown;
let birdUp;
let projectText = document.getElementById("project-text");

function birdFly() {
  // TODO check if we need to scroll down
  //scrollDown();
  mixer = new THREE.AnimationMixer(bird);
  let getUp = mixer.clipAction(birdAnimations[1]);
  getUp.loop = THREE.LoopOnce;
  getUp.time = 0.5;
  getUp.play();
  console.log(birdAnimations)
  mixer.clipAction(birdAnimations[3]).play();
  let birdTransitionTime = 2000;
  setTimeout(() => {
    moveCamera(11.74, 9.65, 0.4, 19.3, 11, 0.4, 2000)
    fadeScene(0);
    new TWEEN.Tween(bird.position).to({y: bird.position.y + 2, z: bird.position.z - 5}, 1500).easing(TWEEN.Easing.Quadratic.InOut).start();
    /*let birdTiltUp = TWEEN.Tween(bird.rotation).to({x: bird.rotation.x + .4}, 750).easing(TWEEN.Easing.Quadratic.InOut);
    let birdTiltDown = new TWEEN.Tween(bird.rotation).to({x: bird.rotation.x - .4}, 750).easing(TWEEN.Easing.Quadratic.InOut);
    birdTiltUp.chain(birdTiltDown);
    birdTiltUp.start();*/
  }, birdTransitionTime - 1500 + 62.5);
  setTimeout(() => {
    birdDown = new TWEEN.Tween(bird.position).to({y: bird.position.y - .4}, 833).easing(TWEEN.Easing.Quadratic.InOut);
    birdUp = new TWEEN.Tween(bird.position).to({y: bird.position.y + .4}, 833).easing(TWEEN.Easing.Quadratic.InOut);
    birdDown.chain(birdUp);
    birdUp.chain(birdDown);
    birdDown.start();
    birdFlying = true;
  }, birdTransitionTime + 62.5);
  textObjects[0].removeEventListener('click', birdFly);
  scrollUp(birdTransitionTime + 500);
}

function zoomOut() {
  scrollDown()
  setTimeout(() => {
    if (birdFlying) {
      mixer = new THREE.AnimationMixer(bird);
      mixer.clipAction(birdAnimations[3]).stop();
      birdDown.stop();
      birdUp.stop();
      textObjects[0].addEventListener('click', birdFly);
      birdFlying = false;
    }
    let zoomtime = 2000;
    moveCamera(62.26, 12.237, -13.196, -39.7, 10, -21.3, zoomtime)
    fadeScene(1);
    scrollUp(zoomtime + 250);
  }, 500)
}

function autocomplete() {
  fadeScene(0);
  moveCamera(13.33, 1.704, -3.563, 13.33, 1.704, -3, 2000);
  scrollUp(2000);
}

function goBack() {
  scrollDown();
  fadeScene(1);
  birdFlying = false;
  moveCamera(29.4, 5.44, -8.46, 0, 10, 0, 833)
  // TODO; move bird back to start >:(
  projectToNormal();
}

function scrollUp(timeout) {
  setTimeout(() => {
    projectText.classList.remove("scroll-down");
    projectText.classList.add("scroll-up");
  }, timeout)
}

function scrollDown() {
  projectText.classList.remove("scroll-up");
  projectText.classList.add("scroll-down");
}

let pikeMaterials = [];
function fadeScene(op) {
  let i = 0
  pikeMeshes.forEach(mesh => {
    if (mesh.material) {
      if (op == 0) {
        //pikeMaterials.push(mesh.material);
        //mesh.material = new MeshBasicMaterial({color: 'white'});
        mesh.material.transparent = true;
      } else {
        //mesh.material = pikeMaterials[i];
        //mesh.material.opacity = 0;
      }
      new TWEEN.Tween(mesh.material).to({opacity: op}, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
      i++;
    }
  })
}

function fadeSceneWithException(op, exception) {
  pikeMeshes.forEach(mesh => {
    if (mesh.material && mesh.name != exception) {
      mesh.material.transparent = true;
      new TWEEN.Tween(mesh.material).to({opacity: op}, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
    }
  })
}

function moveCamera(x, y, z, targetX, targetY, targetZ, duration) {
  new TWEEN.Tween(camera.position).to({x: x, y: y, z: z}, duration).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(cameraTarget).to({x: targetX, y: targetY, z: targetZ}, duration).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function aboutClick() {
  fadeSceneWithException(0, "meetTheProducer");
  moveCamera(5.268, 9.517, -19.447, -50, 10.08, -10.2, 1000);
  scrollUp(1500);
}

let birdClass;
let portfolio;
let textPred;
let chore;
let textObjects = [birdClass, portfolio, textPred, chore]
let projectNames = ["bird classifier", "portfolio", "autocomplete", "chore app", "back"];
let projectClicks = [birdFly, zoomOut, autocomplete, zoomOut, goBack];
let aboutSpan = document.getElementById("about");
aboutSpan.addEventListener('click', aboutClick, false);
let projectSpan = document.getElementById("projects");
let contactSpan = document.getElementById("contact");
let buttons = document.getElementById("buttons")
aboutSpan.style.opacity = 0;
projectSpan.style.opacity = 0;
contactSpan.style.opacity = 0;
projectSpan.addEventListener('click', moveProjects, false);

function moveProjects() {
  aboutSpan.classList.remove("fadein");
  contactSpan.classList.remove("fadein");
  aboutSpan.classList.add("fadeaway");
  contactSpan.classList.add("fadeaway");
  setTimeout(() => {
    aboutSpan.style.opacity = 0;
    contactSpan.style.opacity = 0;
    buttons.removeChild(aboutSpan);
    buttons.removeChild(contactSpan);
    for (let i = 0; i < projectNames.length; i++) {
      let toAdd = document.createElement("span");
      toAdd.innerHTML = projectNames[i];
      if (i < projectNames.length - 1) {
        toAdd.classList.add("subitem")
      } else {
        toAdd.classList.add("back");
      }
      toAdd.style.opacity = 0;
      toAdd.style.width = '100%';
      toAdd.addEventListener('click', projectClicks[i], false);
      setTimeout(() => {
        toAdd.classList.add("fadein");
      }, 1000 * ((i + 1) / projectNames.length));
      buttons.appendChild(toAdd);
      textObjects[i] = toAdd;
    }
  }, 500);
}

function projectToNormal() {
  //fade out subprojects
  let buttonChildren =[...buttons.children];
  for (let i = 1; i < buttonChildren.length; i++) {
    //TODO check if fade in is part of class list here
    buttonChildren[i].classList.remove("fadein");
    buttonChildren[i].style.opacity = 1;
    setTimeout(() => {
      buttonChildren[i].classList.add("fadeaway");
    }, ((buttonChildren.length - i) * 1000) / buttonChildren.length);
  }
  setTimeout(() => {
    for (let i = 1; i < buttonChildren.length; i++) {
      buttons.removeChild(buttonChildren[i]);
    }
    buttons.appendChild(aboutSpan);
    buttons.appendChild(contactSpan);
    aboutSpan.classList.remove("fadeaway");
    contactSpan.classList.remove("fadeaway");
    aboutSpan.classList.add("fadein");
    contactSpan.classList.add("fadein");
  }, 1000)
  //remove them from DOM
  //add back 0 opacity about and contact
  // fade in
}


/******************************** GUI ***********************************/

const gui = new GUI();
let testLight = spotLight;
  const params = {
    'x': testLight.position.x,
    'y': testLight.position.y,
    'z': testLight.position.z,
    'rx': testLight.rotation.x,
    'ry': testLight.rotation.y,
    'rz': testLight.position.z,
    /*
    'point intensity': testLight.intensity,
    'point decay': testLight.decay,
    'point penumbra': testLight.penumbra,
    'point angle': testLight.angle,*/
    
};

gui.add( params, 'x', -50, 50).onChange( function ( val ) {
  testLight.position.x = val;
} );
gui.add( params, 'y', 0, 30).onChange( function ( val ) {
  testLight.position.y = val;
} );
gui.add( params, 'z', -50, 50).onChange( function ( val ) {
  testLight.position.z = val;
} );

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
gui.add( params, 'point intensity', 0, 5700 ).onChange( function ( val ) {
  testLight.intensity = val;
} );

gui.add( params, 'point decay', 0, 2 ).onChange( function ( val ) {
  testLight.decay = val;
} );
gui.add( params, 'point penumbra', 0, 1 ).onChange( function ( val ) {
  testLight.penumbra= val;
} );
gui.add( params, 'point angle', 0, Math.PI ).onChange( function ( val ) {
  testLight.angle = val;
} );
*/
window.addEventListener( 'mousemove', onMouseMove, false );
const mouse = new THREE.Vector2();
const rayMouse = new THREE.Vector2();
function onMouseMove( event ) {
    rayMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    rayMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    mouse.x = ( event.clientX - window.innerWidth/2) / 100;
    mouse.y = ( event.clientY - window.innerHeight/2 ) / 100;
}


const size = renderer.getSize( new THREE.Vector2() );
const _pixelRatio = renderer.getPixelRatio();
const _width = size.width;
const _height = size.height;
const renderTarget = new THREE.WebGLRenderTarget( _width * _pixelRatio, _height * _pixelRatio, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  encoding: THREE.sRGBEncoding
});
renderTarget.texture.name = 'EffectComposer.rt1';


const composer = new EffectComposer( renderer, renderTarget );
//const renderScene = new RenderPass(scene4, camera);
let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio), scene4, camera);
outlinePass.visibleEdgeColor.set( "#ffffff" );
composer.addPass(renderScene);
composer.addPass(outlinePass);

const gammaCorrectionPass = new ShaderPass( GammaCorrectionShader );
composer.addPass( gammaCorrectionPass );

/******************************** ANIMATE ***********************************/
let i = 0;
// whether camera has moved to the main position (looking at the model)
let tweened = false;
// whether stars should move
let update = false;
// whether scene movement is on
let parallax = false;
// whether the scene has loaded all the way
let loaded = false;
let birdFlying = false;

let birdSpeed = 0.002;
let birdTimeParam = 0;
let clock = new THREE.Clock();
let clockPeriod = 0;
let loadingCounter = 0;
let clockSet = .25;
let onProjects = false;

let infoIndex = 0;

let tweenInTime = 2000;
const raycaster = new THREE.Raycaster();
function animate() {
  requestAnimationFrame( animate );

  raycaster.setFromCamera(rayMouse, camera);
  const intersects = raycaster.intersectObjects(scene4.children);
  var delta = clock.getDelta();
  if (mixer != null) mixer.update(delta * 2);
  camera.lookAt(cameraTarget);

  if (intersects.length > 0 && intersects[0].object.name.includes("info")) {
    //console.log(intersects[0].object);
    outlinePass.selectedObjects = [infoMesh];
    body.style.cursor = "pointer";
  } else {
    body.style.cursor = "default";
    outlinePass.selectedObjects = [];
  }

  /** bloom */
  
  layerToCheck = bloomLayer;
  scene4.traverse( darkenNonBloomed );
  scene4.background = new THREE.Color(0, 0, 0);
  bloomComposer.render();
  scene4.background = new THREE.Color('#000205');
  scene4.traverse( restoreMaterial );
  finalComposer.render();

 
  //renderer.render(scene4, camera);
  //console.log(camera.position)
  controls.update();
  
  TWEEN.update();

  
  // if the movement is turned on, make sure to move screen with mouse
  if (parallax) {
    scene4.rotation.x += (mouse.x - scene4.rotation.x) * .001 ;
    scene4.rotation.y += (mouse.y - scene4.rotation.y) * .001 ;
  }

  // move the stars
  if (update && i < 500) {
    if (!tweened) {
      setTimeout(() => {
        parallax = false;
        new TWEEN.Tween(camera.position).to({x: 29.4, y: 5.44, z:-8.46}, tweenInTime).easing(curve).start();
        new TWEEN.Tween(scene4.rotation).to({x: 0, y: 0, z: 0}, tweenInTime).easing(curve).start();
      }, 1500);
      // fade in menu text
      setTimeout(() => {
        aboutSpan.classList.add("fadeinslow");
        projectSpan.classList.add("fadeinslow");
        contactSpan.classList.add("fadeinslow");
        textMesh.material.opacity = 0;
      }, 1750 + tweenInTime)
      setTimeout(() => {
        aboutSpan.classList.remove("fadeinslow");
        projectSpan.classList.remove("fadeinslow");
        contactSpan.classList.remove("fadeinslow");
        aboutSpan.style.opacity = 1;
        projectSpan.style.opacity = 1;
        contactSpan.style.opacity = 1;
      }, 2750 + tweenInTime)
      tweened = true;
    }
    updatePointsGeometry(stars);
    i++;
  }
  if (!loaded) {
    clockPeriod += delta;
    if (clockPeriod > clockSet) {
      clockPeriod = 0;
      loadingCounter++;
    }
    if (textMesh != null) {
      if (loadingCounter % 3 == 0) {
        textMesh.geometry = textGeos[0];
      } else if (loadingCounter % 3 == 1) {
        textMesh.geometry = textGeos[1];
      } else if (loadingCounter % 3 == 2) {
        textMesh.geometry = textGeos[2];
      }
    }
  }
  if (!loaded && numLoaded == objectNames.length) {
    loaded = true;
    // fade out the old text
    new TWEEN.Tween(textMesh.material).to({opacity: 0}, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
    // wait until old text has faded out
    setTimeout(() => {
      // update text
      textMesh.geometry = textGeos[3]
      // let scene move
      parallax = true;
      // add new listener
      window.addEventListener('click', 
        (() => {
          update = true;
        }), 
        false);
      // fade in the new text 
      new TWEEN.Tween(textMesh.material).to({opacity: 1}, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
    }, 1000);
  }
  if (birdFlying) {
    birdTimeParam -= birdSpeed;
    // bird is rotating around circle w radius 10 and center (9.3, 0.4)
    bird.position.x = 9.3 + 10 * Math.cos(birdTimeParam);
    bird.position.z = 0.4 + 10 * Math.sin(birdTimeParam);
    // set camera to a place on circle w/ radius 4 (smaller than bird's circle), and positioned a little
    // bit ahead of the bird to get an angled view
    camera.position.x = 9.3 + 2 * Math.cos(birdTimeParam -.5);
    camera.position.z = 0.4 + 2 * Math.sin(birdTimeParam -.5);
    // setting cameraTarget to where bird was before w/ parameter = .25, so it is centered on the left
    cameraTarget.set(9.3 + 10 * Math.cos(birdTimeParam + .25), 11, 0.4 + 10 * Math.sin(birdTimeParam + .25))
    // rotate the bird so it looks natural
    bird.rotation.y -= birdSpeed
  }
  clockPeriod += delta;
  if (clockPeriod > clockSet) {
    clockPeriod = 0;
    infoIndex++;
  }
  //informationText.geometry = informationGeos[infoIndex % informationGeos.length];
  //console.log(bird.position);
  //composer.render();
  //renderer.render(scene4, camera);
};

animate();