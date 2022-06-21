import * as THREE from './three/build/three.module.js';
import { MapControls }  from './three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import {RenderPass} from './three/examples/jsm/postprocessing/RenderPass.js';
/*
import {ShaderPass} from './three/examples/jsm/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from './three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutlinePass} from './three/examples/jsm/postprocessing/OutlinePass.js';
import {SMAAPass} from './three/examples/jsm/postprocessing/SMAAPass.js';
import {EffectComposer} from './three/examples/jsm/postprocessing/EffectComposer.js';
import {DRACOLoader} from './three/examples/jsm/loaders/DRACOLoader.js'; 
*/

let controlBool = false;
let useGui = false;
/*
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
*/
//document.body.appendChild(stats.dom)

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

const renderer = new THREE.WebGLRenderer({powerPreference: 'high-performance', antialias:false});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild( renderer.domElement );

if (controlBool) {
  let controls = new MapControls( camera, renderer.domElement );
}

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    finalComposer.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
    finalComposer.setPixelRatio(window.devicePixelRatio);
    scene.traverse( darkenNonBloomed );
    scene.background = black;
    bloomComposer.render();
    scene.background = originalBackground;
    scene.traverse( restoreMaterial );
    finalComposer.render();
}


/******************************** POSTPROCESSING ***********************************/
/*const myRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    encoding: THREE.sRGBEncoding,
  } );
  */
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
  bloomPass.strength = 2;
  bloomPass.radius = 1;
  
  const bloomComposer = new EffectComposer( renderer);
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
  outlinePass.hiddenEdgeColor.set( "#ffffff" );

  //const gammaCorrectionPass1 = new ShaderPass( GammaCorrectionShader );
  const smaaPass = new SMAAPass();
  
  const finalComposer = new EffectComposer(renderer, myRenderTarget);
  finalComposer.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
  finalComposer.setPixelRatio(window.devicePixelRatio);
  finalComposer.addPass( renderScene );
  finalComposer.addPass( finalPass );
  finalComposer.addPass( outlinePass );
  //finalComposer.addPass( smaaPass );
  //finalComposer.addPass( gammaCorrectionPass1 );
  
  let materials = {};
  let darkMaterial = new THREE.MeshBasicMaterial({color: 'black'});
  function darkenNonBloomed( obj ) {
    if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
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

/******************************** SCENE LOADING ***********************************/

var gLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'node_modules/three/examples/js/libs/draco/gltf/' );
gLoader.setDRACOLoader( dracoLoader );

const textureLoader = new THREE.TextureLoader();
let bakeOne = textureLoader.load('buildingOneBake.jpg');
bakeOne.flipY = false;
//bakeOne.encoding = sRGBEncoding;
let bakeOneMaterial = new THREE.MeshBasicMaterial({map: bakeOne});

let bakeTwo = textureLoader.load('buildingTwoBake.jpg');
bakeTwo.flipY = false;
//bakeTwo.encoding = sRGBEncoding;
let bakeTwoMaterial = new THREE.MeshBasicMaterial({map: bakeTwo});

let bakeThree = textureLoader.load('buildingThreeBake.jpg');
bakeThree.flipY = false;
//bakeThree.encoding = sRGBEncoding;
let bakeThreeMaterial = new THREE.MeshBasicMaterial({map: bakeThree});

let bakeFour = textureLoader.load('mainBuildingBake.jpg');
bakeFour.flipY = false;
//bakeFour.encoding = sRGBEncoding;
let bakeFourMaterial = new THREE.MeshBasicMaterial({map: bakeFour});

let bakeFive = textureLoader.load('mainBuildingBakeTwo.jpg');
bakeFive.flipY = false;
//bakeFive.encoding = sRGBEncoding;
let bakeFiveMaterial = new THREE.MeshBasicMaterial({map: bakeFive});

let bricksBake = textureLoader.load('bricksBake.jpg');
bricksBake.flipY = false;
//bricksBake.encoding = sRGBEncoding;
let brickBakeMaterial = new THREE.MeshBasicMaterial({map:  bricksBake});

let flowerBake = textureLoader.load('4kflowers.jpg');
flowerBake.flipY = false;
//bricksBake.encoding = sRGBEncoding;
let flowerBakeMaterial = new THREE.MeshBasicMaterial({map:  flowerBake});

let basicMat = new THREE.MeshBasicMaterial({color: 'white'})
let outlinedMeshes = [];
gLoader.load('newPike.glb', function(object) {
  scene.add(object.scene);
  object.scene.traverse(function( child ) {
      if (child.isMesh) {
        //console.log(child.name)
          //child.material = basicMat;
          if (child.name.includes("Text")) {
              child.layers.enable(1);
              console.log(child.name);
          }
          if (child.name.includes("meetTheProducer_bakeThree_2") || child.name.includes("contact") || child.name.includes("project")) {
              outlinedMeshes.push(child);
          }
            child.castShadow = false;
            child.receiveShadow = false;
            
            if (child.name.includes("bakeOne")) {
                child.material = bakeOneMaterial;
            } else if (child.name.includes("bakeTwo")) {
                child.material = bakeTwoMaterial;
            } else if (child.name.includes("bakeThree")) {
                child.material = bakeThreeMaterial;
            } else if (child.name.includes("bakeFour")) {
                child.material = bakeFourMaterial;
            } else if (child.name.includes("bakeFive")) {
                child.material = bakeFiveMaterial;
            } else if (child.name.includes("brickFloorBack")) {
                child.material = brickBakeMaterial;
            } else if (child.name.includes("bakeSix")) {
              child.material = flowerBakeMaterial;
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

/******************************** UTILS ***********************************/

window.addEventListener( 'mousemove', onMouseMove, false );
const rayMouse = new THREE.Vector2();
function onMouseMove( event ) {
  if (rendertoScreen) {
    rayMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    rayMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera(rayMouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0 && 
        (intersects[0].object.name.includes("meet") ||
        intersects[0].object.name.includes("arket") ||
        intersects[0].object.name.includes("info") || 
        intersects[0].object.name.includes("contact"))) {
      body.style.cursor = "pointer";
    } else {
      body.style.cursor = "default";
    }
  } else {
    body.style.cursor = "default";
  }
}

window.addEventListener( 'mousedown', onMouseDown, false);
function onMouseDown( event ) {
  if (rendertoScreen) {
    raycaster.setFromCamera(rayMouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      if (intersects[0].object.name.includes("meet")) {
        aboutClicked();
      } else if (intersects[0].object.name.includes("project") ||
                intersects[0].object.name.includes("farmersMarket")) {
        projectClicked();
      } else if (intersects[0].object.name.includes("info") ||
                 intersects[0].object.name.includes("contact")) {
        contactClicked();
      }
    } 
  }
}

function haltRender() {
  rendertoScreen = false;
}

function startRender(timeout) {
  setTimeout(() => {
    rendertoScreen = true;
  }, timeout)
}

function aboutClicked() {
  haltRender();
  scrollUp(500, aboutSection);
}

function projectClicked() {
  haltRender();
  scrollUp(500, projectSection);
}

function contactClicked() {
  haltRender();
  scrollUp(500, contactSection);
}

function back() {
  let projectText = document.getElementById("project-text")
  projectText.classList.remove("scroll-up");
  projectText.classList.add("scroll-down");
  startRender(500);
}

const aboutSection = Symbol("About");
const projectSection = Symbol("Project")
const contactSection = Symbol("Contact");

function scrollUp(timeout, type) {
  setTimeout(() => {
    let firstColumn = document.getElementById("first-column-wrapper");
    let secondColumn = document.getElementById("second-column-wrapper");
    firstColumn.innerHTML = "";
    secondColumn.innerHTML = "";
    let firstClasses = []
    let secondClasses = []
    // titles
    let aboutHtml = `
    <div class='green-column aboutWrapper scroll-up' id='project-text'>
      <div class='content'>
        <h1 class='heading'><b>ABOUT ME</b></h1>
        <hr>
        <p>I am a recent graduate from the University of Washington - Seattle with a double degree in Computer Science and Linguistics. As showcased in this portfolio, I have experience with a multitude of software development fields, including Machine Learning and Web Design. This portfolio was made over the course of a month, and is intended to showcase my current and previous projects that I have made or helped create throughout my computer science career.</p>
      </div>
      <div class="footer"><h2>close</h2></div>
    </div>`
    let projectHtml = `
    <div class='green-column aboutWrapper scroll-up' id='project-text'>
      <div class='content'>
        <h1 class='heading'><b>PROJECTS</b></h1>
        <hr>
        <h1 class='left'><i>BIRD CLASSIFIER</i></h1>
        <embed type='text/html' width='100%' height='100%' src='https://manginoja.github.io/455/'>
        <br>
        <br>
        <h1 class='right'><i>TEXT PREDICTION</i></h1>
        <p>
          &emsp;In the spring of 2021, in a University of Washington Natural Language Processing class,
          a team of three including myself was tasked with creating a text prediction system. This system
          would not be aware of the input language, and would be required to produce 3 predictions as to what
          the next character in a given input line of text would be.
          In order to accomplish this, we chose to support ten of the most widely spoken languages in the world,
          and did so through creating ten LSTM models, each designed to perform predictions for their given
          language. 
          <br>
          &emsp;This program first performed langauge detection through identifying language-unique tokens in the input text,
          (in the future, we also planned to include detection of language-unique characters). Once the input language was determined,
          the input text was fed into the corresponding LSTM model. This model was trained on a large corpus of preprocessed
          data in the models language, where the data was converted into random-length n-gram tokens, and where length was specified
          as the number of characters in the token. 
        </p>
        <br>
        <br>
        <h1 class='left'><i>PORTFOLIO</i></h1>
        <p>
          This portfolio is a milestone in my journey to learn the ins and outs of 3D modeling, and
          more specifically learning how to use the three.js javascript library to create an interactive,
          three dimensional website.
          <br>
          I began working on a website to show my skills X months ago. I started out with a massive goal, and
          soon realized that it was too big in scope. From there, I scaled it down a bit, but continued to struggle
          with scope issues. At one point, I actually scrapped the entire thing, and did something completely
          different, but then recognized that I wasn't showing any of my abilities.
          The website I present to you takes into consideration the lessons I've learned along the way, which are:
          <ul>
            <li>
              Using the Minimum Viable Product, while still showing my skills and abilities
            </li>
            <li>
              Having several iterations helped me see what the best user experience was
            </li>
            <li>
              What might be MY user experience may not be the same user experience that someone else
              may have
            </li>
            <li>
              Knowing that my product may need multiple tweaks along the way 
            </li>
            <li>
              Testing with others helped me see things I hadn't noticed originally
            </li>
            <li>
            Breaking up the parts of the website made it easier to see my errors and fix them, and not be so
            overwhelmed with everything
            </li>
          </ul>
          <p>
          These lessons are not all-inclusive; I know that while I repeat some of them in the future, I hope to learn
          from them and become a better developer, tester and end user.
          </p>
        </p>
      </div>
      <div class="footer"><h2>close</h2></div>
    </div>`
    let contactHtml = `
    <div class='green-column aboutWrapper scroll-up' id='project-text'>
      <div class='content'>
        <h1 class='heading'><b>CONTACT ME</b></h1>
        <hr>
        <p>If you would like to get in touch, please email me at <a href='mailto:jamangino@gmail.com' target='_blank'>jamangino@gmail.com</a></p>
      </div>
      <div class="footer"><h2>close</h2></div>
    </div>`
    
    switch (type) {
      case (aboutSection):
        firstClasses = ["about", "first-column-wrapper", "column"]
        secondClasses = ["about", "second-column-wrapper", "column"]
        firstColumn.innerHTML = aboutHtml;
        break;
      case(projectSection):
        firstClasses = ["project", "first-column-wrapper", "column"]
        secondClasses = ["project", "second-column-wrapper", "column"]
        firstColumn.innerHTML = projectHtml;
        break;
      case(contactSection):
        firstClasses = ["contact", "first-column-wrapper", "column"]
        secondClasses = ["contact", "second-column-wrapper", "column"]
        secondColumn.innerHTML = contactHtml;
        break;
      default:
        console.log('oops')
    }
    let footer = document.getElementsByClassName("footer");
    footer[0].addEventListener('click', back, false);
    firstColumn.classList = []
    secondColumn.classList = []
    firstColumn.classList.add(...firstClasses);
    secondColumn.classList.add(...secondClasses);
  }, timeout)
}

function prerender() {
  renderer.compile(scene, camera)
  setAllCulled(scene, false);
  renderer.render(scene, camera);
  setAllCulled(scene, true);
}

/******************************** ANIMATE ***********************************/
let black = new THREE.Color(0, 0, 0);
let originalBackground = new THREE.Color('#02121c');
const raycaster = new THREE.Raycaster();
let i = 0;
let rendertoScreen = true;
outlinePass.selectedObjects = outlinedMeshes;
function animate() {
  i++;
  //stats.begin();
  requestAnimationFrame( animate );
  camera.lookAt(cameraTarget);
    
  if (rendertoScreen && i < 50) {
    scene.traverse( darkenNonBloomed );
    scene.background = black;
    bloomComposer.render();
    scene.background = originalBackground;
    scene.traverse( restoreMaterial );
    finalComposer.render();
  } else if (rendertoScreen) {
    finalComposer.render();
  }

  if (i % 100 < 50) {
    outlinePass.edgeStrength = (i % 100) / 10.0
  } else {
    outlinePass.edgeStrength = 5 - (((i % 100) - 50) / 10.0)
  }
 // stats.end();
};

animate();
