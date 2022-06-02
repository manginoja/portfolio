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



let waterMovement = true;
// camera settings
let near = 2;
let far = 15000;
let parallax = true;
let logPosition = false;

// lighting settings
let shadow = false;

// render settings
let render = true;
const sceneFile = 'miner.glb';
let loaded = false;

// bloom settings
let layerToCheck;



const scene2 = new THREE.Scene();
var loader = new THREE.TextureLoader();
var backgroundTexture = loader.load('sunset-gradient-1.jpeg');
scene2.background = backgroundTexture;
//scene2.background = new THREE.Color(.52,.8,.92);

const ambientLight2 =  new THREE.AmbientLight(0xf2ead0, .471);
scene2.add(ambientLight2);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, near, far );
camera.position.set(125, 100, 170);
let cameraTarget = new THREE.Vector3(-178, 80, 29);
camera.lookAt(cameraTarget);
let cameraCoords = new THREE.Vector3(125, 100, 170);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
if (shadow) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
renderer.outputEncoding = sRGBEncoding;
renderer.physicallyCorrectLights = true;
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

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderTarget.setSize(
      window.innerWidth * pixelRatio,
      window.innerHeight * pixelRatio
    );
    water.material.uniforms.resolution.value.set(
      window.innerWidth * pixelRatio,
      window.innerHeight * pixelRatio
    );
    renderer.render( scene2, camera );
}

const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;

/******************************** OUTLINE ***********************************/

const myRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  encoding: THREE.sRGBEncoding,
} );

const renderScene = new RenderPass( scene2, camera );
let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene2, camera);
const planeComposer = new EffectComposer(renderer, myRenderTarget);
planeComposer.addPass(renderScene)
planeComposer.addPass(outlinePass);

/******************************** LIGHTS ***********************************/

const sun = new THREE.DirectionalLight(0xdf8972, 3.81);
sun.position.set(300, 300, 0);
if (shadow) {
  sun.castShadow = true;

  sun.shadow.camera.near = 0.5;       
  sun.shadow.camera.far = 5000;      
  sun.shadow.camera.left = -500;
  sun.shadow.camera.bottom = -500;
  sun.shadow.camera.right = 500;
  sun.shadow.camera.top = 500;
}
scene2.add(sun);

const hemilight = new THREE.HemisphereLight( 0xc88051, 0x080820, 0.968 );
scene2.add( hemilight );

const pierLight = new THREE.SpotLight(0xf7beab, 1600, Infinity, 1.188);
if (shadow) {
  pierLight.castShadow = true;
}
pierLight.angle = Math.PI;
pierLight.decay = 1.188;


scene2.add(pierLight);
pierLight.position.set(-300, 300, 1000);

let rectLookX = 0;
let rectLookY = 0;
let rectLookZ = 0;
/*
const rectLight2 = new THREE.RectAreaLight( 0xec9e32, 20, 200, 10 );
rectLight2.position.set( -120, 17, -23 );
rectLight2.lookAt( -552, 45, 1000);
scene2.add( rectLight2 )

const rectLight3 = new THREE.RectAreaLight( 0xec9e32, 50, 300, 10 );
rectLight3.position.set( -54, 13, -139);
rectLight3.lookAt( 532, 0, -187);
scene2.add( rectLight3 )

const rectLight4 = new THREE.RectAreaLight( 0xec9e32, 50, 20, 10 );
rectLight4.position.set( -288, 83, 14);
rectLight4.lookAt( -254, 223, -400);
scene2.add( rectLight4 );

const rectLight5 = new THREE.RectAreaLight( 0x0091ff, 165, 20, 10 );
rectLight5.position.set( -219, 83, 14);
rectLight5.lookAt( -254, 223, -400);
scene2.add( rectLight5 );


*/



/******************************** SCENE LOADER ***********************************/

// scene loader
var gLoader = new GLTFLoader();

// for decompreession
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'node_modules/three/examples/js/libs/draco/gltf/' );
gLoader.setDRACOLoader( dracoLoader );
gLoader.load(
  // resource URL
  sceneFile,
  // called when resource is loaded
  function ( object ) {
    scene2.add(object.scene);
    object.scene.scale.set(10, 10, 10);
    object.scene.traverse( function( child ) { 

      //console.log(child.name);
      if (child.isMesh && !child.name.includes("crab") && !child.name.includes("pot")) { 
        
        if (shadow) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
        
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
      if (child.name.includes("Bloom") || child.name.includes("to_bloom")) {
        child.layers.enable(2);
      } else if (child.name.includes("bloom")) {
        child.layers.enable(1);
      } else if (child.name == "Cylinder032" || child.name == "Circle011") {
        child.material = new MeshBasicMaterial({color: 0x666666});
        child.layers.enable(1);
        /*let ferrisTween1 = new TWEEN.Tween(child.material.color).to({r: 0, g: 0, b: 1}, 10000);
        let ferrisTween2 = new TWEEN.Tween(child.material.color).to({r: 1, g: 0, b: 0}, 10000);
        let ferrisTween3 = new TWEEN.Tween(child.material.color).to({r: 0, g: 1, b: 0}, 10000);
        ferrisTween1.chain(ferrisTween2);
        ferrisTween2.chain(ferrisTween3);
        ferrisTween3.chain(ferrisTween1);
        ferrisTween1.start();*/
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


/******************************** SEAPLANE ***********************************/

let seaplane;
let propellors;
let seaplaneHolderGeo = new THREE.BoxGeometry(100, 100, 100);
let seaplaneHolderMat = new THREE.MeshBasicMaterial({color: 0xffffff, alphaTest: 0.5, opacity: 0.4});
let seaplaneHolderMesh = new THREE.Mesh(seaplaneHolderGeo, seaplaneHolderMat);
//scene2.add(seaplaneHolderMesh);
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
  object.scene.scale.set(10, 10, 10);
  scene2.add(object.scene);
  // position in water
  //object.scene.position.set(-500, -15, 300);
  let planeX = -700;
  let planeZ = 300;
  let animationTime = 7500;
  object.scene.position.set(planeX, 300, planeZ);
  object.scene.rotateY(Math.PI/4);
  let down = new TWEEN.Tween(object.scene.position).to({x: planeX, y: 250, z: planeZ}, animationTime / 2).easing(TWEEN.Easing.Sinusoidal.InOut)
  let up = new TWEEN.Tween(object.scene.position).to({x: planeX, y: 300, z: planeZ}, animationTime / 2).easing(TWEEN.Easing.Sinusoidal.InOut)
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
  seaplaneHolderMesh.position.set(seaplane.position.x, seaplane.position.y, seaplane.position.z);
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


/******************************** FERRY ***********************************/

let ferry;
gLoader.load('ferry.glb', function(object) {
  scene2.add(object.scene);
  ferry = object.scene;
  object.scene.scale.set(50, 50, 50);
  object.scene.position.set(-1000, -60.5, 300);
  object.scene.rotateY(Math.PI/8);
  object.scene.traverse(function (child) {
    
    if (child.isMesh) {  
      console.log("ferry" + child.name); 
      if (shadow) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      
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
    
  });
  loaded = true;
},
function ( xhr ) {
  //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
},
// called when loading has errors
function ( error ) {
  console.log(error );
});

/******************************** GUI ***********************************/
/*

let testLight = pierLight;
const pointTarget = pierTarget;

const gui = new GUI();

const params = {
    'light color': hemilight.color.getHex(),
    'ground color': hemilight.groundColor.getHex(),
    intensity: hemilight.intensity,
    'sun intensity': sun.intensity,
    'sun color': sun.color.getHex(),
    'ambient intensity': ambientLight2.intensity,
    'ambient color': ambientLight2.color.getHex(),
    /*
    'x': testLight.position.x,
    'y': testLight.position.y,
    'z': testLight.position.z,
    'rx': rectLookX,
    'ry': rectLookY,
    'rz': rectLookZ,*/
    //'point intensity': testLight.intensity,
    //'point decay': testLight.decay,
    //'point penumbra': testLight.penumbra,
    //'point angle': testLight.angle,
    
    //'water color': pugetMaterial.color.getHex()
//};

/*
gui.addColor( params, 'light color' ).onChange( function ( val ) {
  hemilight.color.setHex( val );
} );

gui.addColor( params, 'ground color' ).onChange( function ( val ) {
  hemilight.groundColor.setHex( val );
} );

gui.addColor( params, 'ambient color' ).onChange( function ( val ) {
  ambientLight2.color.setHex( val );
} );
gui.addColor( params, 'sun color' ).onChange( function ( val ) {
  sun.color.setHex( val );
} );
gui.add( params, 'intensity', 0, 2).onChange( function ( val ) {
  hemilight.intensity = val;
} );

gui.add( params, 'sun intensity', 0, 30 ).onChange( function ( val ) {
  sun.intensity = val;
} );

gui.add( params, 'ambient intensity', 0, 1 ).onChange( function ( val ) {
  ambientLight2.intensity = val;
} );
/*
gui.add( params, 'x', -300, 100 ).onChange( function ( val ) {
  testLight.position.x = val;
} );
gui.add( params, 'y', -10, 800).onChange( function ( val ) {
  testLight.position.y = val;
} );
gui.add( params, 'z', -400, 100).onChange( function ( val ) {
  testLight.position.z = val;
} );
gui.add( params, 'rx', -1000, 1000 ).onChange( function ( val ) {
    //pointTarget.position.x = val;
    rectLookX = val;
    testLight.lookAt(rectLookX, rectLookY, rectLookZ);
  } );
gui.add( params, 'ry', -400, 400).onChange( function ( val ) {
    //pointTarget.position.y = val;
    rectLookY = val;
    testLight.lookAt(rectLookX, rectLookY, rectLookZ);
} );
gui.add( params, 'rz', -400, 1000).onChange( function ( val ) {
    //pointTarget.position.z = val;
    rectLookZ = val;
    testLight.lookAt(rectLookX, rectLookY, rectLookZ);
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
gui.add( params, 'point angle', 0, Math.PI ).onChange( function ( val ) {
  testLight.angle = val;
} );*/


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
        value: new THREE.Color(0x02122c)
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
    water.position.set(-500, -50, 0);
    scene2.add(water);
//} else {
    /**************** FALLBACK WATER ******************/
    var pugetMaterial = new THREE.MeshPhongMaterial({color: 0x02122c});
    puget = new THREE.Mesh(waterGeometry, pugetMaterial);
    puget.rotation.x = -Math.PI * 0.5;
    puget.position.set(-500, -60, 0);
    scene2.add(puget);
    /**************************************************/
//}


// should pause the TWEEN
document.getElementById("input").addEventListener('focusin', () => {loadOtherPage("main2", "main3.js")});
document.getElementById("input").addEventListener('focusout', () => {render = true});
document.getElementById("body").addEventListener('click', clickCheck);


function loadOtherPage(from, to) {
  // https://stackoverflow.com/questions/45455397/three-js-how-to-do-a-fade-scene-transition
  setTimeout(() => {
    let curtain = document.getElementById("curtain");
    curtain.classList.add("screen-change");
  }, 1500);

  setTimeout(() => {
    let script = document.createElement("script");
    let toRemove = document.getElementById(from);
    script.src = to;
    script.type = "module";
    document.body.appendChild(script);
    document.body.removeChild(toRemove);
  }, 2500);
}


function clickCheck() {
  if (outlinePass.selectedObjects.includes(seaplane)) {
    aboutTransition();
  } else if (outlinePass.selectedObjects.includes(ferry)) {
    projectTransition();
  }
}

function aboutTransition() {

}

function projectTransition() {
  let cameraMove = new TWEEN.Tween(camera.position).to({x: 125, y: 27, z: 65}, 1000).easing(TWEEN.Easing.Quadratic.In);
  let cameraMove2 = new TWEEN.Tween(camera.position).to({x:-700, y: 27, z: 65}, 2000).easing(TWEEN.Easing.Quadratic.Out);
  cameraMove.chain(cameraMove2);
  new TWEEN.Tween(cameraTarget).to({x: -900, y: 27, z: 65}, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
  cameraMove.start();
  loadOtherPage("main2", "main3.js")
}

/******************************** ANIMATE ***********************************/
const raycaster = new THREE.Raycaster();
let clock = new THREE.Clock();
let i = 0;
let body = document.getElementById("body")
function animate() {
  if (i < 100) {
    i++;
  }
  requestAnimationFrame( animate );
  
  raycaster.setFromCamera( rayMouse, camera );
  const intersects = raycaster.intersectObjects(scene2.children);

  if (intersects.length > 0 && intersects[0].object.name.includes("Circle00")) {
    //console.log(intersects[0].object);
    outlinePass.selectedObjects = [seaplane];
    body.style.cursor = "pointer";
  } else if (intersects.length > 0 && intersects[0].object.name.includes("ferry")) {
    outlinePass.selectedObjects = [ferry];
    body.style.cursor = "pointer";
  } else {
    body.style.cursor = "default";
    outlinePass.selectedObjects = [];
  }

  // MOUSE PARALLAX
  if (parallax) {
    camera.position.x += (cameraCoords.x + mouse.x - camera.position.x) * .06 ;
    camera.position.y += (cameraCoords.y - mouse.y - camera.position.y) * .06 ;
  }
  camera.lookAt(cameraTarget);
  

  // WATER MOVEMENT

  
  if (render) {
    water.visible = false; // we don't want the depth of the water
    scene2.overrideMaterial = depthMaterial;

    renderer.setRenderTarget(renderTarget);
    renderer.render(scene2, camera);
    renderer.setRenderTarget(null);

    scene2.overrideMaterial = null;
    water.visible = true;
    let time = clock.getElapsedTime();
    water.material.uniforms.time.value = time;
    // ok so??????  only this config works: renderer then planeComposer, where planeComposer
    // has renderScene then outline pass.  BUT it's slow >:((((( WHY doeszn't it work if I do

    // ok so if i first render using renderer and then later just use the planeComposer with only the outlinePass
    // it works BUT that means that the goddamn water stops working 
    if (i < 100) {
      renderer.render(scene2, camera);
    } 
    planeComposer.render();
    TWEEN.update();
  }
  


  // BLOOM PASSES
 /*if (render) {
    layerToCheck = bloomLayer;
    scene2.traverse( xNonBloomed );
    scene2.background = new THREE.Color(0, 0, 0);
    bloomComposer.render();
    scene2.traverse( restoreMaterial );

    layerToCheck = brightBloomLayer;
    scene2.traverse( darkenNonBloomed );
    brightBloomComposer.render();
    scene2.background = backgroundTexture;
    scene2.traverse( restoreMaterial );
    finalComposer.render();
    
  } else {
    finalComposer.render();
  }*/
  
  

  if (logPosition) {
    console.log(camera.position);
  }
};

animate();