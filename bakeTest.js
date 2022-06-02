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
import { MeshToonMaterial } from 'three';

// camera settings
let near = 1;
let far = 2000;
let cameraPosition = new THREE.Vector3(30, 10, 15);

const scene4 = new THREE.Scene();
//scene4.background = new THREE.Color(.13,.2,.23);
scene4.background = new THREE.Color('#02121c');

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, near, far );
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
let cameraTarget = new THREE.Vector3(0, 20, 0);
camera.lookAt(cameraTarget);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = sRGBEncoding;
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
}

const textureLoader = new THREE.TextureLoader();

function processTexture(fileName) {
  const texture = textureLoader.load(fileName);
  texture.encoding = THREE.sRGBEncoding;
  texture.flipY = false;
  texture.minFilter = THREE.LinearMipMapNearestFilter;
  texture.magFilter = THREE.NearestFilter;
  const bakedMaterial = new THREE.MeshBasicMaterial({map: texture});
  return bakedMaterial;
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
let starCount = 4000;
let starRadius = 1500;
let starVertices = [];
for (let i = 0; i < starCount; i++) {
  let [x,y,z] = randomSpherePoint(0, 0, 0, starRadius);
  starVertices.push(x);
  starVertices.push(y);
  starVertices.push(z);
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

/******************************** SEAPLANE ***********************************/
var gLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'node_modules/three/examples/js/libs/draco/gltf/' );
gLoader.setDRACOLoader( dracoLoader );

let pierBottom = processTexture("pierFloor.jpg");
let signHolderSide = processTexture("signHolder.jpg");
let frontMetalRoof = processTexture("metalRoofAndPanels.jpg");
let sidebake = processTexture("sideFront copy.jpg");
let sidefront = processTexture("sideFront.jpg");
let roof = processTexture("roof.jpg");
let pierside = processTexture("pierside.jpg");
let sideBottomWall = processTexture("sideBottomWall.jpg");

let objectNames = ["plants", "road", "icecream", "doorAndColumns", "firstStorefront", "banners", "mainFront", "backside",
                  "piercolumns", "umbrellas", "ferris", "topRoof", "newSideFront", "ticketLogs", "ticketRoof"];

gLoader.load('miner.glb', function(object) {
  object.scene.traverse(function (child) {
      if (child.name.includes("signHolderSide")) {
        child.material = signHolderSide;
      } else if (child.name.includes("Plane006")) {
        child.material = pierBottom;
      } else if (child.name == "frontMetalRoof" || child.name.includes("Panels")){
        child.material = frontMetalRoof;
      } else if (child.name.includes("(sideBake)")) {
        child.material = sidebake;
      } else if (child.name.includes("sidefront")) {
        child.material = sidefront;
        //child.material = new THREE.MeshBasicMaterial({color: 'white'});
      } else if (child.name.includes("mainRoof") || child.name.includes("main_roof_vents")) {
        console.log(child.name)
        child.material = roof;
      } else if (child.name.includes("pierside")) {
        child.material = pierside;
      } else if (child.name.includes("sideBottomWall(sideBake)")) {
        child.material = sideBottomWall;
      }

  })
  for (let i = 0; i < objectNames.length; i++) {
    let mesh = object.scene.children.find((child) => child.name === objectNames[i]);
    let material = processTexture(objectNames[i] + ".jpg");
    if (objectNames[i] == "road") {
      const texture = textureLoader.load("roadRoughness.jpg");
      texture.encoding = THREE.sRGBEncoding;
      texture.flipY = false;
      texture.minFilter = THREE.LinearMipMapNearestFilter;
      texture.magFilter = THREE.NearestFilter;
      material.roughnessMap = texture;
    }
    if (objectNames[i] == "ticketLogs" || objectNames[i] == "ticketRoof" || objectNames[i] == "sideBottomWall") {
      mesh.material = material;
    } else {
      for (let j = 0; j < mesh.children.length; j++) {
        mesh.children[j].material = material;
      }
    }
  }

  scene4.add(object.scene);
},
function ( xhr ) {
  //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
},
// called when loading has errors
function ( error ) {
  console.log(error );
});

const ambientLight =  new THREE.AmbientLight(0xf2ead0,.471);
//scene4.add(ambientLight);

/******************************** GUI ***********************************/

const gui = new GUI();

const params = {
    'color': scene4.background
};

gui.addColor(params, 'color').onChange( function ( val ) {
  scene4.background.set(val)
} );



/******************************** WATER ***********************************/
let puget;
//if (waterMovement) {
    var supportsDepthTextureExtension = !!renderer.extensions.get(
        "WEBGL_depth_texture"
    );

    var pixelRatio = renderer.getPixelRatio();

    let renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth * pixelRatio,
    window.innerHeight * pixelRatio
    );
    renderTarget.texture.minFilter = THREE.NearestFilter;
    renderTarget.texture.magFilter = THREE.NearestFilter;
    renderTarget.texture.generateMipmaps = false;
    renderTarget.stencilBuffer = false;

    if (supportsDepthTextureExtension === true) {
      renderTarget.depthTexture = new THREE.DepthTexture();
      renderTarget.depthTexture.type = THREE.UnsignedShortType;
      renderTarget.depthTexture.minFilter = THREE.NearestFilter;
      renderTarget.depthTexture.maxFilter = THREE.NearestFilter;
    }

    let depthMaterial = new THREE.MeshDepthMaterial();
    depthMaterial.depthPacking = THREE.RGBADepthPacking;
    depthMaterial.blending = THREE.NoBlending;

    // water

    var dudvMap = new THREE.TextureLoader().load(
    "https://i.imgur.com/hOIsXiZ.png"
    );
    dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;

    var uniforms = {
    time: {
        value: 0
    },
    threshold: {
        value: 0.1
    },
    tDudv: {
        value: null
    },
    tDepth: {
        value: null
    },
    cameraNear: {
        value: 0
    },
    cameraFar: {
        value: 0
    },
    resolution: {
        value: new THREE.Vector2()
    },
    foamColor: {
        value: new THREE.Color(1, 1, 1)
    },
    waterColor: {
        value: new THREE.Color(0x000205)
    }
    };

    var waterGeometry = new THREE.PlaneBufferGeometry(20000, 10000);
    var waterMaterial = new THREE.ShaderMaterial({
    defines: {
        DEPTH_PACKING: supportsDepthTextureExtension === true ? 0 : 1,
        ORTHOGRAPHIC_CAMERA: 0
    },
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib["fog"], uniforms]),
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
    fog: true
    });

    waterMaterial.uniforms.cameraNear.value = near / 10;
    waterMaterial.uniforms.cameraFar.value = far;
    waterMaterial.uniforms.resolution.value.set(
    window.innerWidth * pixelRatio,
    window.innerHeight * pixelRatio
    );
    waterMaterial.uniforms.tDudv.value = dudvMap;
    waterMaterial.uniforms.tDepth.value =
    supportsDepthTextureExtension === true
        ? renderTarget.depthTexture
        : renderTarget.texture;

    let water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI * 0.5;
    water.position.set(-50, -5, 0);
    //scene4.add(water);
//} else {
    /**************** FALLBACK WATER ******************/
    var pugetMaterial = new THREE.MeshBasicMaterial({color: 0x000205});
    puget = new THREE.Mesh(waterGeometry, pugetMaterial);
    puget.rotation.x = -Math.PI * 0.5;
    puget.position.set(-50, -10, 0);
    scene4.add(puget);
    /**************************************************/
//}


/******************************** ANIMATE ***********************************/
let clock = new THREE.Clock();
function animate() {
  requestAnimationFrame( animate );
  //camera.lookAt(cameraTarget);
  /*
  water.visible = false; // we don't want the depth of the water
  scene4.overrideMaterial = depthMaterial;

  renderer.setRenderTarget(renderTarget);
  renderer.render(scene4, camera);
  renderer.setRenderTarget(null);

  scene4.overrideMaterial = null;
  water.visible = true;
  let time = clock.getElapsedTime();
  water.material.uniforms.time.value = time;*/
  renderer.render(scene4, camera);
  controls.update();
};

animate();