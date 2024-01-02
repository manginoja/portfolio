import './style.css'
import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import {OutlineEffect} from './three/examples/jsm/effects/OutlineEffect.js'; 
import { TWEEN } from './three/examples/jsm/libs/tween.module.min.js'
import {GUI} from './three/examples/jsm/libs/lil-gui.module.min.js'
import {DRACOLoader} from './three/examples/jsm/loaders/DRACOLoader.js'; 
import { MeshToonMaterial } from './three/build/three.module.js';
import Stats from './three/examples/jsm/libs/stats.module.js'

let statsOn = false;



window.threeStats = function ( renderer ) {

  var _rS = null;

  var _values = {
      'renderer.info.memory.geometries': {
          caption: 'Geometries'
      },
      'renderer.info.memory.textures': {
          caption: 'Textures'
      },
      'renderer.info.programs': {
          caption: 'Programs'
      },
      'renderer.info.render.calls': {
          caption: 'Calls'
      },
      'renderer.info.render.triangles': {
          caption: 'Faces',
          over: 40000
      },
      'renderer.info.render.points': {
          caption: 'Points'
      },
      'renderer.info.render.vertices': {
          caption: 'Vertices'
      }
  };

  var _groups = [ {
      caption: 'Three.js - Memory',
      values: [ 'renderer.info.memory.geometries', 'renderer.info.programs', 'renderer.info.memory.textures' ]
  }, {
      caption: 'Three.js - Render',
      values: [ 'renderer.info.render.calls', 'renderer.info.render.triangles', 'renderer.info.render.points', 'renderer.info.render.vertices' ]
  } ];

  var _fractions = [];

  function _update () {

      _rS( 'renderer.info.memory.geometries' ).set( renderer.info.memory.geometries );
      //_rS( 'renderer.info.programs' ).set( renderer.info.programs.length );
      _rS( 'renderer.info.memory.textures' ).set( renderer.info.memory.textures );
      _rS( 'renderer.info.render.calls' ).set( renderer.info.render.calls );
      _rS( 'renderer.info.render.triangles' ).set( renderer.info.render.triangles );
      _rS( 'renderer.info.render.points' ).set( renderer.info.render.points );
      _rS( 'renderer.info.render.vertices' ).set( renderer.info.render.lines );

  }

  function _start () {}

  function _end () {}

  function _attach ( r ) {
      _rS = r;
  }

  return {
      update: _update,
      start: _start,
      end: _end,
      attach: _attach,
      values: _values,
      groups: _groups,
      fractions: _fractions
  };

};

let parallax = true;
let cameraPosition = new THREE.Vector3(8, 5, 14);
let daytime = true;

let aboutCameraTarget = new THREE.Vector3(-3, .58, 4.26);
let projectCameraTarget = new THREE.Vector3(-.58, 1.06, 2.06)


let upperYLimit = 10;
let lowerYLimit = 2;
let upperZLimit = 17;
let lowerZLimit = 13;





//TODO:
// set up max/min camera locations for parallax
// add a night mode button
// fill in inside
// branches inside trees
// brighten lamps at night--they could flicker on?
// clouds?
// bird needs to line up with crumb animation
// only do raycaster when needed!
//fans and power box on the side
// menu on table that moves up to eye level for projects?
// bicicyle
// flower pots along side building
// mailbox for contact me?

// lighting settings
let shadow = true;

// render settings
const sceneFile = 'bakery.glb';

const scene = new THREE.Scene();
scene.background = new THREE.Color(.52,.8,.92);
//scene.background = new THREE.Color(0xffb3b3);

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 2, 40 );
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
let cameraTarget = new THREE.Vector3(0, 2, 0);
camera.lookAt(cameraTarget);


let pixelRatio = window.devicePixelRatio
let AA = true
if (pixelRatio > 1) {
  //AA = false
}

const renderer = new THREE.WebGLRenderer({antialias: AA, powerPreference: "high-performance"});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
if (shadow) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  //renderer.shadowMap.autoUpdate = false;
}
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild( renderer.domElement );

let tS = new threeStats( renderer ); // init after WebGLRenderer is created

if (statsOn) {
  let rS = new rStats( {
      values: {
          frame: { caption: 'Total frame time (ms)', over: 16 },
          fps: { caption: 'Framerate (FPS)', below: 30 },
          calls: { caption: 'Calls (three.js)', over: 3000 },
          raf: { caption: 'Time since last rAF (ms)' },
          rstats: { caption: 'rStats update (ms)' }
      },
      groups: [
          { caption: 'Framerate', values: [ 'fps', 'raf' ] },
          { caption: 'Frame Budget', values: [ 'frame', 'texture', 'setup', 'render' ] }
      ],
      fractions: [
          { base: 'frame', steps: [ 'action1', 'render' ] }
      ],
      plugins: [
          tS
      ]
  } );
}

let effect = new OutlineEffect(renderer, {
  defaultThickness: 0.003
})

const renderTarget = new THREE.WebGLRenderTarget(
  window.innerWidth * renderer.getPixelRatio(),
  window.innerHeight * renderer.getPixelRatio(),
  {format: THREE.RGBAFormat,
	encoding: THREE.sRGBEncoding}
)

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

const raycaster = new THREE.Raycaster();


const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;

let stats = new Stats();
//document.body.appendChild(stats.dom)

/******************************** LIGHTS ***********************************/
const ambientLight =  new THREE.AmbientLight(0xf2ead0, .471);
scene.add(ambientLight);

let particleLight = new THREE.Mesh(
    new THREE.SphereGeometry( .1, 8, 8 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff, transparent:true, opacity:0} )
);
particleLight.position.set(0, 3, 3)
scene.add( particleLight );

const pointLight = new THREE.PointLight(0xff0000, 1, 10, .5);
pointLight.position.set(2.5, 0, 10)
particleLight.add(pointLight)
pointLight.castShadow = true;

const lanternLeft = new THREE.PointLight(0xceba5a, 0, 7.6, .156);
lanternLeft.position.set(-1.3, 2.54, 2.8)
scene.add(lanternLeft)
//lanternLeft.castShadow = true
lanternLeft.shadow.normalBias = 1e-2;

const lanternRight = new THREE.PointLight(0xffae00, 0, 4.5, .106);
lanternRight.position.set(2.62, 2.3, 1.1)
scene.add(lanternRight)
//lanternRight.castShadow = true
lanternRight.shadow.normalBias = 1e-2;

const directionalLight = new THREE.SpotLight(0xff643d, 1)
directionalLight.color.set(0xf2f2f2);
scene.add(directionalLight)
const lightTarget = new THREE.Object3D()
lightTarget.position.set(0, 0, 0)
//scene.add(lightTarget)
directionalLight.target = lightTarget
//sunset location
directionalLight.position.set(15.9, 5.5, 12.4)
//daytime location
directionalLight.position.set(12.27, 12.62, 20)
// ? location
directionalLight.position.set(-9.87, 6.48, 5.24);
directionalLight.color.set(0xffcccc);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;


const hemisphereLight = new THREE.HemisphereLight(0xff7777, 0xaaaaff, .9)
//scene.add(hemisphereLight)


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render( scene, camera );
}


/******************************** BAKERY ***********************************/
var gLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'node_modules/three/examples/js/libs/draco/gltf/' );
gLoader.setDRACOLoader( dracoLoader );

let materialMap = {};

let mixer;
let animations = [];
let newspaperDoor;
let newspaperDoor1;
let read;
let read1;
let lanternLight;
let fan;

gLoader.load(sceneFile, function(object) {
  mixer = new THREE.AnimationMixer(object.scene)
  animations = object.animations;
  object.scene.traverse(function (child) {
      if (child.isMesh) {
        if (!(child.material.color.getHex in materialMap)) {
            const format = ( renderer.capabilities.isWebGL2 ) ? THREE.RedFormat : THREE.LuminanceFormat;
            const colors = new Uint8Array(4);
            for ( let c = 0; c <= colors.length; c ++ ) {
                colors[ c ] = ( c / colors.length ) * 256;
            }
            colors[1] = 90;
            colors[3] = 150;
            const gradientMap = new THREE.DataTexture( colors, colors.length, 1, format );
            gradientMap.needsUpdate = true
            let outlineColor = {};
            child.material.color.getHSL(outlineColor)
            outlineColor.l /= 4;
            let newColor = new THREE.Color(1, 1, 1);
            newColor.setHSL(outlineColor.h, outlineColor.s, outlineColor.l)
            materialMap[child.material.color.getHex()] = new MeshToonMaterial({color: child.material.color, gradientMap: gradientMap, side: THREE.FrontSide})
            materialMap[child.material.color.getHex()].userData.outlineParameters = {
              color: [newColor.r, newColor.g, newColor.b]
            }
            
        }
        child.material = materialMap[child.material.color.getHex()]
        if (child.name.includes("Text") || child.name.includes("bakery") && !child.name.includes("bakery001") || child.name.includes("treeFront")) {
          child.castShadow = true
        }
        console.log(child.name)
        child.receiveShadow = true
        if (child.name.includes("window")) {
          child.material.transparent = true;
          child.material.opacity = 0.7
        } else if (child.name.includes("doorWindow")) {
          child.material.transparent = true;
          child.material.opacity = 0.3
        } else if (child.name.includes("newspaperDoor003_1")) {
          newspaperDoor = child;
        } else if (child.name.includes("newspaperDoor003_2")) {
          newspaperDoor1 = child;
        } else if (child.name.includes("Text001_1")) {
          read = child;
          child.material.transparent = true;
          child.material.opacity = 0;
          child.receiveShadow = false
        } else if (child.name.includes("Text001")) {
          read1 = child;
          child.receiveShadow = false
          child.material.transparent = true;
          child.material.opacity = 0;
        } else if (child.name.includes("lanternLight")) {
          lanternLight = child;
        } else if (child.name.includes("fan")) {
          fan = child;
          startFan();
        }

        if (child.name.includes("Text") || child.name.includes("side")) {
          child.material.userData.outlineParameters = {
            color: [0, 0, 0]
          }
        }
        
      }
  })
  scene.add(object.scene);
  //startGUI();
  peck();
  child.matrixAutoUpdate = false;
},
function ( xhr ) {
  //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
},
// called when loading has errors
function ( error ) {
  console.log(error );
});



/******************************** SMOKE ************************************/

let smokeGrowth = 1.005
let puffs = [];

function createSmoke() {
  //create sphere of random size
  let smokeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent:true, opacity:.7 } )
  let smokeSize = Math.random() * .1 + 0.07
  let smokeGeometry = new THREE.SphereGeometry(smokeSize, 8, 8);
  let smoke = new THREE.Mesh(
    smokeGeometry, smokeMaterial
  );
  let spawnX = Math.random() * .1 - 1.05
  let spawnZ = Math.random() * .1 -1.45
  smoke.position.set(spawnX, 6, spawnZ)
  scene.add(smoke)
  //add to array, (increase in animate function)
  puffs.push(smoke)
}

/******************************** FAN ***********************************/

function startFan() {
  new TWEEN.Tween(fan.rotation).to({x: 2 * Math.PI}, 2500).repeat(2500).start();
}

/******************************** GUI ***********************************/


function startGUI() {
  const gui = new GUI();
let point = lanternLeft
  const params = {
      'x': point.position.x,
      'y': point.position.y,
      'z': point.position.z,
      'bias': point.shadow.bias,
      'distance': lanternLeft.distance,
      'decay': lanternLeft.decay
  };

  gui.add( params, 'x', -10, 20).onChange( function ( val ) {
      point.position.x = val;
  } );
  gui.add( params, 'y', 0, 20).onChange( function ( val ) {
      point.position.y = val;
  } );
  gui.add( params, 'z', 0, 20).onChange( function ( val ) {
      point.position.z = val;
  } );
  gui.add( params, 'bias', -0.1, .013).onChange( function ( val ) {
    lanternRight.shadow.bias = val;
  } );
  gui.add( params, 'distance', 0, 50).onChange( function ( val ) {
    lanternLeft.distance = val;
  } );
  gui.add( params, 'decay', 0, 2).onChange( function ( val ) {
    lanternLeft.decay = val;
  } );
  gui.addColor(lanternLeft, 'color')
}

/******************************** DAY/NIGHT CYCLE ***********************************/


function timeChange() {
  let timeDelay = 1500
  new TWEEN.Tween(scene.background).to({r: .0325, g: .05, b: .0575}, timeDelay).start();
  new TWEEN.Tween(ambientLight).to({intensity: 0.3}, timeDelay).start()
  new TWEEN.Tween(ambientLight.color).to({r: .509, g: .702, b: .753}, timeDelay).start()
  new TWEEN.Tween(directionalLight).to({intensity: 0}, timeDelay).start()
  new TWEEN.Tween(pointLight).to({intensity: 0}, timeDelay).start()


  new TWEEN.Tween(lanternLeft).to({intensity: .8}, timeDelay + 2000).start()
  new TWEEN.Tween(lanternRight).to({intensity: .8}, timeDelay + 2000).start()
  new TWEEN.Tween(lanternLight.material.color).to({r: 1, g: 1, b: 1}, timeDelay + 2000).start();
}

document.getElementById("about").addEventListener('click', goToAbout)
document.getElementById("projects").addEventListener('click', goToProjects)
//document.body.addEventListener('click', timeChange)
/******************************** ANIMATE ***********************************/

function goToAbout() {
  //new TWEEN.Tween(cameraTarget).to({x: aboutCameraTarget.x, y: aboutCameraTarget.y, z: aboutCameraTarget.z}, 2500).start()
  new TWEEN.Tween(camera.position).to({x:8.33, y:.5, z:8.16}, 2500).easing(TWEEN.Easing.Quintic.InOut).start();
  setTimeout(openNewspaper, 2000)
}

function openNewspaper() {
  new TWEEN.Tween(newspaperDoor.rotation).to({z: -.5}, 1500).easing(TWEEN.Easing.Bounce.Out).start();
  new TWEEN.Tween(newspaperDoor1.rotation).to({z: -.5}, 1500).easing(TWEEN.Easing.Bounce.Out).start()
}

function goToProjects() {
  new TWEEN.Tween(cameraTarget).to({x: projectCameraTarget.x, y: projectCameraTarget.y, z: projectCameraTarget.z}, 2500).start()
  new TWEEN.Tween(camera.position).to({x:.66, y:1.8, z:5.5}, 2500).easing(TWEEN.Easing.Quintic.InOut).start();
}



// Update the mixer on each frame

let peckedTwice = false;
let mixerUpdateTime = .03

function update () {
  
	mixer.update( mixerUpdateTime );
  if (!peckedTwice && mixer.time % 24.875 >= 4) {
    peckedTwice = true;
    crumbsFly(false);
  } else if (mixer.time % 24.875 <= mixerUpdateTime * 2) {
    peckedTwice = false;
    crumbsFly(true)
  }
}

let donePecking = true;

function peck() {
  let ani = mixer.clipAction(animations[0]);
  ani.play();
  crumbsFly(true);
}



let crumbs = [];
function crumbsFly(left) {
  let crumbPosition;
  if (left) {
    crumbPosition = new THREE.Vector3(2.1, 0, 2)
  } else {
    crumbPosition = new THREE.Vector3(2.14, 0, 1.32)
  }
  let crumbGeometry = new THREE.SphereGeometry(.01, 8, 8)
  let crumbMaterial = new THREE.MeshToonMaterial({color: 0xB7916D, transparent: true, opacity: 1})
  for (let i = 0; i < 10; i++) {
    let crumb = new THREE.Mesh(crumbGeometry, crumbMaterial)
    new TWEEN.Tween(crumb.material).to({opacity: 0}, 5000).start()
    scene.add(crumb)
    crumb.position.set(crumbPosition.x, crumbPosition.y, crumbPosition.z);
    let crumbObject = {
      "mesh": crumb,
      "amplitude": Math.random() * -.4,
      "time": 0,
      "theta": Math.random() * 2 * Math.PI,
      "crumbPosition": crumbPosition
    }
    crumbs.push(crumbObject)
  }
}

function updateCrumbs() {
  for (let i = 0; i < crumbs.length; i++) {
    crumbs[i]["time"] += .03;
    let curTime = crumbs[i]["time"];
    let amp = crumbs[i]["amplitude"]
    let crumb = crumbs[i]["mesh"];
    let angle = crumbs[i]["theta"];
    let crumbPosition = crumbs[i]["crumbPosition"]
    if (crumb.position.y >= 0) {
      crumb.position.set(crumbPosition.x + 2*amp*curTime*Math.cos(angle), crumbPosition.y + (-1 * Math.pow((curTime + 1.5*amp), 2)) + Math.pow(1.5*amp, 2), crumbPosition.z + 2*amp*curTime*Math.sin(angle))
    }
    if (crumb.material.opacity <= 0.1) {
      scene.remove(crumb)
      crumb.geometry.dispose();
      crumb.material.dispose();
      crumbs.splice(i, 1)
    }
  }
}



function animate() {
  if (statsOn) {
    rS( 'frame' ).start();
    rS( 'rAF' ).tick();
    rS( 'FPS' ).frame();
  }
 requestAnimationFrame( animate );
    
    
  
  update();
  
  let smokeChance = Math.random()
  if (smokeChance < 0.1) {
    createSmoke();
  }

  if (crumbs.length > 0) {
    updateCrumbs();
  }

  puffs.forEach((puff) => {
    puff.position.y += .02;
    puff.scale.set(puff.scale.x * smokeGrowth, puff.scale.y * smokeGrowth, puff.scale.z * smokeGrowth)
    puff.material.opacity -= 0.005
    if (puff.material.opacity <= 0) {
      scene.remove(puff)
      puff.geometry.dispose()
      puffs.splice(puffs.indexOf(puff), 1)
    }
  });

  stats.begin()

  
  // MOUSE PARALLAX
  
  if (parallax) {
      let newZ = camera.position.z + (cameraPosition.z + mouse.x - camera.position.z) * .01 ;
      let newY = camera.position.y + (cameraPosition.y - mouse.y - camera.position.y) * .01 ;
      if (newZ < upperZLimit && newZ > lowerZLimit) {
        camera.position.z = newZ
      }
      if (newY < upperYLimit && newY > lowerYLimit) {
        camera.position.y = newY
      }
  }
  
  camera.lookAt(cameraTarget);
  effect.render(scene, camera);
  TWEEN.update();
  //stats.end()
  if (statsOn) {
    rS( 'frame' ).end();
    rS().update();
  }
  console.log(camera.position)
};

animate();
