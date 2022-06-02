import './style.css'
import * as THREE from 'three';
import { MapControls }  from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'; 
import { sRGBEncoding } from 'three';
import { SpotLightHelper } from 'three';
import { MeshPhongMaterial } from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import { SpotLight } from 'three';
import { MeshBasicMaterial } from 'three';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { PointsMaterial } from 'three';

let pointHelper;
let layerToCheck;

const scene2 = new THREE.Scene();
var loader = new THREE.TextureLoader();
var backgroundTexture = loader.load('sunset-gradient-1.jpeg');
scene2.background = backgroundTexture;

const ambientLight2 =  new THREE.AmbientLight(0xf2ead0, .471);
scene2.add(ambientLight2);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 15000 );
camera.position.set(126.49, 48.68, -140.82);

const renderer = new THREE.WebGLRenderer({antialias: true,});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
document.body.appendChild( renderer.domElement );

let controls = new MapControls( camera, renderer.domElement );


const bloomLayer = new THREE.Layers();
bloomLayer.set( 1 );
const brightBloomLayer = new THREE.Layers();
brightBloomLayer.set( 2 );

const renderScene = new RenderPass( scene2, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = 0;
bloomPass.strength = 2;
bloomPass.radius = 1;

const brightBloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
brightBloomPass.threshold = 0;
brightBloomPass.strength = .1;
brightBloomPass.radius = 1;

const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

const brightBloomComposer = new EffectComposer( renderer );
brightBloomComposer.renderToScreen = false;
brightBloomComposer.addPass( renderScene );
brightBloomComposer.addPass( brightBloomPass );


const finalPass = new ShaderPass(
  new THREE.ShaderMaterial( {
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture }
    },
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
    defines: {}
  } ), 'baseTexture'
);
finalPass.needsSwap = true;


const finalPass2 = new ShaderPass(
  new THREE.ShaderMaterial( {
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: brightBloomComposer.renderTarget2.texture }
    },
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
    defines: {}
  } ), 'baseTexture'
);
finalPass2.needsSwap = true;


const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );
finalComposer.addPass( finalPass2 );

let materials = {};
let darkMaterial = new THREE.MeshBasicMaterial({color: 'black'});

function darkenNonBloomed( obj ) {

  if ( obj.isMesh && layerToCheck.test( obj.layers ) === false ) {
    materials[ obj.uuid ] = obj.material;
    obj.material = darkMaterial;

  }

}

function restoreMaterial( obj ) {

  if ( materials[ obj.uuid ] ) {

    obj.material = materials[ obj.uuid ];
    delete materials[ obj.uuid ];

  }

}
/*
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'node_modules/three/examples/js/libs/draco/gltf/' );
gLoader.setDRACOLoader( dracoLoader );*/

gLoader.load(
  // resource URL
  'miner.glb',
  // called when resource is loaded
  function ( object ) {
    scene2.add(object.scene);
    object.scene.scale.set(10, 10, 10);
    object.scene.traverse( function( child ) { 
      console.log(child.name);
      if ( child.isMesh) { 
        child.castShadow = true;
        child.receiveShadow = true;
        
      }
      if (child.name.includes("Bloom") || child.name.includes("to_bloom")) {
        child.layers.enable(2);
      } else if (child.name.includes("bloom")) {
        child.layers.enable(1);
      } else if (child.name.includes("light")) {
        child.geometry = new THREE.SphereGeometry(.5, 10, 10);
        child.material = new THREE.MeshBasicMaterial({color: 0xffaa00});
        child.layers.enable(1);
      } else if (child.name == "Cylinder032" || child.name == "Circle011") {
        child.material = new MeshBasicMaterial({color: 0x00ff00});
        let ferrisDirectional = new THREE.SpotLight(0x00ff00, 0.471);
        ferrisDirectional.shadow.radius = 8;
        ferrisDirectional.angle = 1;
        ferrisDirectional.penumbra = 0.05;
        ferrisDirectional.decay = 1.2;
        ferrisDirectional.distance = Infinity;
        ferrisDirectional.position.set(10 * child.position.x, 10 * child.position.y, 10 * child.position.z);
        let ferrisTarget = new THREE.Object3D();
        ferrisTarget.position.set(0, 0, 0);
        scene2.add(ferrisTarget);
        ferrisDirectional.target = ferrisTarget;
        scene2.add(ferrisDirectional);
        let ferrisHelper = new THREE.SpotLightHelper(ferrisDirectional);
        scene.add(ferrisHelper);
        child.layers.enable(1);
        let ferrisTween1 = new TWEEN.Tween(child.material.color).to({r: 0, g: 0, b: 1}, 10000);
        let ferrisTween2 = new TWEEN.Tween(child.material.color).to({r: 1, g: 0, b: 0}, 10000);
        let ferrisTween3 = new TWEEN.Tween(child.material.color).to({r: 0, g: 1, b: 0}, 10000);
        let ambientTween1 = new TWEEN.Tween(ferrisDirectional.color).to({r: 0, g: 0, b: 1}, 10000);
        let ambientTween2 = new TWEEN.Tween(ferrisDirectional.color).to({r: 1, g: 0, b: 0}, 10000);
        let ambientTween3 = new TWEEN.Tween(ferrisDirectional.color).to({r: 0, g: 1, b: 0}, 10000);
        ferrisTween1.chain(ferrisTween2);
        ferrisTween2.chain(ferrisTween3);
        ferrisTween3.chain(ferrisTween1);
        ambientTween1.chain(ambientTween2);
        ambientTween2.chain(ambientTween3);
        ambientTween3.chain(ambientTween1);
        ferrisTween1.start();
        ambientTween1.start();
      }
  } );
  object.scene.castShadow = true;
  object.scene.receiveShadow = true; 
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


var supportsDepthTextureExtension = !!renderer.extensions.get(
  "WEBGL_depth_texture"
);

const mylight = new THREE.DirectionalLight(0xdf8972, 1.98);
mylight.position.set(300, 300, 0);
mylight.castShadow = true;

mylight.shadow.camera.near = 0.5;       
mylight.shadow.camera.far = 5000;      
mylight.shadow.camera.left = -500;
mylight.shadow.camera.bottom = -500;
mylight.shadow.camera.right = 500;
mylight.shadow.camera.top = 500;

    
scene2.add(mylight);

const hemilight = new THREE.HemisphereLight( 0xc88051, 0x080820, 0.968 );
scene2.add( hemilight );

const point = new THREE.SpotLight(0xffaa00, 5700, Infinity, 2);
point.castShadow = true;
point.angle = Math.PI;
point.decay = 2;
scene2.add(point);
point.position.set(40, 65, -85);

const point2 = new THREE.SpotLight(0xffaa00, 5700, Infinity, 2);
point2.angle = Math.PI;
point2.decay = 2;
point2.castShadow = true;
scene2.add(point2);
point2.position.set(-70, 65, -5);

const point3 = new THREE.SpotLight(0xffaa00, 5700, Infinity, 2);
point3.angle = Math.PI;
point3.decay = 2;
point3.castShadow = true;
scene2.add(point3);
point3.position.set(40, 65, -180);

const point4 = new THREE.SpotLight(0xffaa00, 5700, Infinity, 2);
point4.castShadow = true;
point4.angle = Math.PI;
point4.decay = 2;

scene2.add(point4);
point4.position.set(40, 65, -180);
const pointTarget = new THREE.Object3D();
pointTarget.position.set(40, 64, -180);
point4.target = pointTarget;
pointHelper = new THREE.SpotLightHelper(point4);
scene2.add(pointHelper);

let point5 = new THREE.SpotLight(0xffffff, 1500, Infinity, 1.53);
point5.castShadow = true;
point5.angle = Math.PI;
point5.decay = 2;
point5.penumbra = 1;
scene2.add(point5);
point5.position.set(81, 27, 65);
let pointTarget5 = new THREE.Object3D();
pointTarget5.position.set(81, 26, 65);
point5.target = pointTarget5;

for (let i = 0; i < 5; i++) {
    let side = new THREE.SpotLight(0xffaa00, 5940, Infinity, 2);
    side.castShadow = true;
    side.angle = Math.PI;
    side.decay = 2;
    side.penumbra = 1;
    scene2.add(side);
    side.position.set(-422 + i * 80, 27, 65);
    let sideTarget = new THREE.Object3D();
    sideTarget.position.set(-422 + i * 80, 26, 65);
    side.target = sideTarget;
}



    



const gui = new GUI();

const params = {
    /*'light color': hemilight.color.getHex(),
    'ground color': hemilight.groundColor.getHex(),
    intensity: hemilight.intensity,
    'sun intensity': mylight.intensity,
    'ambient intensity': ambientLight2.intensity,
    'ambient color': ambientLight2.color.getHex(),*/
    'x': point4.position.x,
    'y': point4.position.y,
    'z': point4.position.z,
    'point intensity': point4.intensity,
    'point decay': point4.decay,
    'point penumbra': point4.penumbra,
    'point angle': point4.angle,

    //'water color': pugetMaterial.color.getHex()
};

    /*gui.addColor( params, 'light color' ).onChange( function ( val ) {
      hemilight.color.setHex( val );
    } );
    gui.addColor( params, 'ground color' ).onChange( function ( val ) {
      hemilight.groundColor.setHex( val );
    } );
    gui.addColor( params, 'ambient color' ).onChange( function ( val ) {
      ambientLight2.color.setHex( val );
    } );
    gui.addColor( params, 'water color' ).onChange( function ( val ) {
      pugetMaterial.color.setHex( val );
    } );
    gui.add( params, 'intensity', 0, 2).onChange( function ( val ) {
      hemilight.intensity = val;
    } );
    gui.add( params, 'sun intensity', 0, 30 ).onChange( function ( val ) {
      mylight.intensity = val;
    } );
    gui.add( params, 'ambient intensity', 0, 1 ).onChange( function ( val ) {
      ambientLight2.intensity = val;
    } );*/
    gui.add( params, 'x', -600, 200 ).onChange( function ( val ) {
      point4.position.x = val;
      pointTarget.position.x = val - 1;
      pointHelper.update();
      renderer.render(scene2, camera);
    } );
    gui.add( params, 'y', -10, 400).onChange( function ( val ) {
      point4.position.y = val;
      pointTarget.position.y = val;
      pointHelper.update();
      renderer.render(scene2, camera);
    } );
    gui.add( params, 'z', -400, 400).onChange( function ( val ) {
      point4.position.z = val;
      pointTarget.position.z = val;
      pointHelper.update();
      renderer.render(scene2, camera);
    } );
    gui.add( params, 'point intensity', 0, 10000 ).onChange( function ( val ) {
      point4.intensity = val;
      pointHelper.update();
      renderer.render(scene2, camera);
    } );
    gui.add( params, 'point decay', 0, 2 ).onChange( function ( val ) {
      point4.decay = val;
      pointHelper.update();
      renderer.render(scene2, camera);
    } );
    gui.add( params, 'point penumbra', 0, 1 ).onChange( function ( val ) {
      point4.penumbra= val;
      pointHelper.update();
      renderer.render(scene2, camera);
    } );
    gui.add( params, 'point angle', 0, Math.PI ).onChange( function ( val ) {
      point4.angle = val;
      pointHelper.update();
      renderer.render(scene2, camera);
    } );

//

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
    value: new THREE.Color(0x02122c)
  }
};

var waterGeometry = new THREE.PlaneBufferGeometry(20000, 10000);
var pugetMaterial = new THREE.MeshPhongMaterial({color: 0x006994, transparent: true, opacity: 1});
let puget = new THREE.Mesh(waterGeometry, pugetMaterial);
//scene2.add(puget);
puget.rotation.x = -Math.PI * 0.5;
puget.position.set(-500, -50, 0);

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

waterMaterial.uniforms.cameraNear.value = .01;
waterMaterial.uniforms.cameraFar.value = 200;
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
scene2.add(water);
water.position.set(-500, -50, 0);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render( scene2, camera );
}

let clock = new THREE.Clock();
function animate() {
    requestAnimationFrame( animate );
  
    let time = clock.getElapsedTime();
    water.visible = false; // we don't want the depth of the water
  scene2.overrideMaterial = depthMaterial;

  renderer.setRenderTarget(renderTarget);
  renderer.render(scene2, camera);
  renderer.setRenderTarget(null);

  scene2.overrideMaterial = null;
  water.visible = true;
  water.material.uniforms.time.value = time;




  layerToCheck = bloomLayer;
  scene2.traverse( darkenNonBloomed );
  scene2.background = new THREE.Color(0, 0, 0);
	bloomComposer.render();
  scene2.background = backgroundTexture;
  scene2.traverse( restoreMaterial );

  layerToCheck = brightBloomLayer;
  scene2.traverse( darkenNonBloomed );
  scene2.background = new THREE.Color(0, 0, 0);
	brightBloomComposer.render();
  scene2.background = backgroundTexture;
  scene2.traverse( restoreMaterial );

  finalComposer.render();
  

  
  TWEEN.update();
  //console.log(camera.position);
};

animate();
