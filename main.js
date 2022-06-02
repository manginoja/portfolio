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
import { ReinhardToneMapping, sRGBEncoding } from 'three';
import { SpotLightHelper } from 'three';
import { MeshPhongMaterial } from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import { SpotLight } from 'three';
import { MeshBasicMaterial } from 'three';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { PointsMaterial } from 'three';

let cameraTarget;
let cameraCoords;
let onAbout = false;
let raining = false;
let night = false;
let planeIn = false;
let planeOn = false;
let fountainX = 98.5;
let fountainY = 31;
let fountainZ = -105;
let fountainHeight = 7;
let pointHelper;
let layerToCheck;
/******************************** SCENE SETUP ***********************************/

const scene = new THREE.Scene();
scene.background = new THREE.Color(.52,.8,.92);

const ambientLight = new THREE.AmbientLight(0xf2ead0, .3);
scene.add(ambientLight);


const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 15000 );
camera.position.set(126.49, 48.68, -140.82);
cameraTarget = new THREE.Vector3(scene.position.x, scene.position.y, scene.position.z);
cameraCoords = new THREE.Vector3(126.49, 48.68, -140.82)

const renderer = new THREE.WebGLRenderer({antialias: true,});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = sRGBEncoding;
document.body.appendChild( renderer.domElement );

let controls = new MapControls( camera, renderer.domElement );


/******************************** SCENE LOADING ***********************************/

let clouds = [];
let light;
let upperBridge = null;
let lowerBridge = null;
let upperBridgeBars = null;
let lowerBridgeBars = null;
let lightpost = null;


var gLoader = new GLTFLoader();
gLoader.load(
  // resource URL
  'realone.glb',
  // called when resource is loaded
  function ( object ) {
    scene.add(object.scene);
    object.scene.scale.set(10, 10, 10);
    object.scene.traverse( function( child ) { 
    let tar;
      if ( child.isMesh) {  
          //child.material.wireframe = true;
          child.castShadow = true;
          child.receiveShadow = true;
          //child.material.flatShading = true;
          if (child.name== 'Cube001') {
            child.geometry.computeVertexNormals();
            child.material = new MeshPhongMaterial({ color: 0x000000, specular: 0x333333, shininess: 1, side: THREE.BackSide, reflectivity: 1});
          } else if (child.name == 'Icosphere002_1' || child.name == 'Icosphere002_2') {
            child.material = new THREE.MeshPhongMaterial({color: new THREE.Color(0.056, .220, .056), shininess: 0.3});
            tar = child;
          } else if (child.name.includes('Icosphere0')) {
            child.material = new MeshPhongMaterial({color: 0xffffff, shininess:0, transparent: true, opacity: 0.9});
            clouds.push(child);
          } else if (child.name == "Plane002" || child.name == "Plane017" || child.name == "Plane016") {
            child.material = new MeshPhongMaterial({color: new THREE.Color(0.227, .227, .227), side: THREE.DoubleSide});
            if (child.name == "Plane016") {
              upperBridge = child;
            }
            if (child.name == "Plane017") {
              lowerBridge = child;
            }
          } else if (child.name == "Plane017_1") {
            lowerBridgeBars = child;

          } else if (child.name == "Plane016_1") {
            upperBridgeBars = child;
          } else if (child.name.includes("Cylinder0")) {
            child.material = new THREE.MeshPhongMaterial({color: 0x011401, shininess: 5,side: THREE.DoubleSide});
          } else if (child.name.includes("Circle")) {
            console.log(child.material)
          } else if (child.name.includes("Cube054")) {
            child.material = new THREE.MeshPhongMaterial({color: new THREE.Color(0.8, 0.679, 0.426), side: THREE.DoubleSide});
          }
          //console.log(child.name);
        }
  } );
    object.scene.castShadow = true;
    object.scene.receiveShadow = true; 
    //light = new THREE.SpotLight(0xfad6a5,1);
    light = new THREE.SpotLight(0xFD5E53,1);
    light.shadow.radius = 8;
    light.angle = 1;
    light.penumbra = 0.05;
    light.decay = .5;
    light.distance = 2000;
    //light.position.set(0,120,-60);
    //light.position.set(300, 500, -400);
    light.position.set(-300, 800, 400);
    light.castShadow = true;
    
    light.target = object.scene;
    
    scene.add(light);
    // everything is loaded, so add the rest
    boat.visible = true;
    planeMesh.visible = true;
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


let tryOutLight = new THREE.SpotLight(0xffffff, 2, 7, 5);
tryOutLight.position.set(80.3, 36.8, -127.3);
tryOutLight.angle = 0.75;
const lightTarget = new THREE.Object3D();
scene.add(lightTarget);
lightTarget.position.set(80.3, 36, -127.3);
tryOutLight.target = lightTarget;
//scene.add(tryOutLight);

const sphere = new THREE.SphereGeometry( 0.1, 16, 8 );
const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffbb00 } ) 

let light1 = new THREE.PointLight(0xffaa00, 1.5, 10);
light1.add( new THREE.Mesh( sphere, sphereMaterial ) );
//scene.add( light1 );
light1.position.set(98, 38, -112);

let light2 = new THREE.PointLight( 0xffaa00, 1.5, 10 );
light2.add( new THREE.Mesh( sphere, sphereMaterial) );
//scene.add( light2 );
light2.position.set(98, 38, -95);

let light3 = new THREE.PointLight(0xffaa00, 1.5, 10);
light3.add( new THREE.Mesh( sphere, sphereMaterial ) );
//scene.add( light3 );
light3.position.set(109.5, 38, -107.5);

let light4 = new THREE.PointLight( 0xffaa00, 1.5, 10 );
light4.add( new THREE.Mesh( sphere, sphereMaterial) );
//scene.add( light4 );
light4.position.set(89, 37, -104.5);



/******************************** BOAT LOADING ***********************************/

let boat;
gLoader.load(
  // resource URL
  'boat.glb',
  function (object) {
    scene.add(object.scene);
    boat = object.scene;
    boat.visible = false;
  },
  // called when loading is in progresses
  function ( xhr ) {
    //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  // called when loading has errors
  function ( error ) {
    console.log(error );
  }
);


/******************************** BIRD LOADING***********************************/

let bird;
let bird1;
let bird2;
gLoader.load(
  // resource URL
  'bird.glb',
  function (object) {
    object.scene.traverse( function(child) {
        let mesh = new THREE.Mesh(child.geometry, new THREE.MeshPhongMaterial({color: 0x000000, side: THREE.BackSide}));
        mesh.scale.set(0.1, 0.1, 0.1);
        mesh.position.set(-15, 10, -10);
        mesh.rotateX(Math.PI / 4);
        if (child.name == "Cube") {
          bird = mesh;
        }
        if (child.name == "Cube001") {
          bird1 = mesh;
        }
        if (child.name == "Cube002") {
          bird2 = mesh;
        }
    });
  },
  // called when loading is in progresses
  function ( xhr ) {
    //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  // called when loading has errors
  function ( error ) {
    console.log(error );
  }
);


/******************************** SEAPLANE LOADING & TWEEN SETTING ***********************************/

let spin;
let spin2;
let seaplane;

gLoader.load('plane (1).glb', function(object) {
  object.scene.traverse(function (child) {
    console.log(child.name);
    if (child.name == 'Plane002') {
      let propellors = child;
      spin = new TWEEN.Tween(propellors.rotation).to({y: Math.PI/2}, 250);
      spin2 = new TWEEN.Tween(propellors.rotation).to({y: 2*Math.PI}, 250);
      spin.chain(spin2);
      spin2.chain(spin);
      spin.start();
    }
  });
  seaplane = object.scene;
},
function ( xhr ) {
  //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
},
// called when loading has errors
function ( error ) {
  console.log(error );
});

/******************************** WATER PLANE ***********************************/

let plane = new THREE.PlaneGeometry(30, 30, 10, 10);
let cut = new THREE.PlaneGeometry(100, 20, 50, 10);
let vertData = [];
let v3 = new THREE.Vector3(); // for re-use
for (let i = 0; i < cut.attributes.position.count; i++) {
  v3.fromBufferAttribute(cut.attributes.position, i);
  vertData.push({
    initH: v3.y,
    amplitude: THREE.MathUtils.randFloatSpread(4),
    phase: THREE.MathUtils.randFloat(0, Math.PI)
  })
}
let planeMaterial = new THREE.MeshPhongMaterial({color: 0x006994, transparent: true, opacity: 0.5});
let planeMesh = new THREE.Mesh(plane, planeMaterial);
let cutMesh = new THREE.Mesh(cut, planeMaterial);
scene.add(planeMesh);
scene.add(cutMesh);
cutMesh.position.set(110, 30, -125);
planeMesh.position.set(10, 7, 0);
planeMesh.rotateX(3*Math.PI / 2);
cutMesh.rotateX(3*Math.PI / 2);
cutMesh.rotateZ(-Math.PI/4.2);
// so shit doesn't look weird when loading
planeMesh.visible = false;




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


/******************************** FOUNTAIN CREATION ***********************************/
let fountainWater = new THREE.CircleGeometry(4.6, 10);
let fountainMesh = new THREE.Mesh(fountainWater, planeMaterial);
scene.add(fountainMesh);
fountainMesh.rotateX(3*Math.PI / 2);
fountainMesh.position.set(fountainX + .1, fountainY + 1, fountainZ);

let fountainAngles = [];
let fountainWidths = []
let fountainCount = 4000;
let fountainVertices = []
for (let i = 0; i < fountainCount; i++) {
  fountainAngles.push(Math.random() * 2 * Math.PI);
  if (i < fountainCount/16) {
    fountainWidths.push(.05);
  } else {
    fountainWidths.push(Math.random() * 0.5 + .05);
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
  size: .1,
  transparent: true,
  opacity: 0.5
});
let fountain = new THREE.Points(fountainGeo,fountainMaterial);
scene.add(fountain);


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
let starCount = 3000;
let starRadius = 300;
let starVertices = [];
for (let i = 0; i < starCount; i++) {
  let [x,y,z] = randomSpherePoint(0, 0, 0, starRadius);
  starVertices.push(x);
  starVertices.push(y);
  starVertices.push(z);
}

let starMaterial = new THREE.PointsMaterial({
  color: 0x666666,
  size: .5,
  transparent: true
});
let starArray = Float32Array.from(starVertices);
let starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starArray, 3));
let stars = new THREE.Points(starGeo, starMaterial);



/******************************** LISTENERS & DOCUMENT ***********************************/

// for updating the raycaster mouse position and the mouse position for "parallax" movement
window.addEventListener( 'mousemove', onMouseMove, false );
const mouse = new THREE.Vector2();
const rayMouse = new THREE.Vector2();
function onMouseMove( event ) {
	rayMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	rayMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  mouse.x = ( event.clientX - window.innerWidth/2) / 100;
	mouse.y = ( event.clientY - window.innerHeight/2 ) / 100;
}

// for resizing
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render( scene, camera );
}

let oldTime = Math.PI;
window.addEventListener('wheel', function(e) {
  if (onAbout || onProjects) {
    /*
    if (document.body.scrollTop < 4117) {
      document.body.scrollTop = 4117;
    }
    */
    if (onProjects) {
      if (document.body.scrollTop > 4117 && flowerLoaded && texted) {
        var x_trig = Math.sin(oldTime);
        var z_trig = Math.cos(oldTime);
        var x_text_trig = Math.sin(oldTime - Math.PI / 2);
        var z_text_trig = Math.cos(oldTime - Math.PI / 2);
        var originX = x_trig * Math.sqrt(725);
        var originZ = z_trig * Math.sqrt(725);
        let originTextX = x_text_trig * Math.sqrt(725);
        let originTextZ = z_text_trig * Math.sqrt(725);
        oldTime += 0.02;
        flower.position.x = originX + 30;
        flower.position.z = originZ - 60;
        textMeshX = originTextX + 30;
        textMeshZ = originTextZ - 60;
      }
    }
  }
});


document.getElementById("sun icon").addEventListener('click', sunny);
document.getElementById("storm icon").addEventListener('click', rainy);
document.getElementById("moon icon").addEventListener('click', nighttime);
document.getElementById("plane icon").addEventListener('click', flyPlane);
document.getElementById("boat icon").addEventListener('click', goBoat);


/******************************** HTML ***********************************/
let ids = ["name", "about", "projects", "contact me", "blurb", "sun icon", "storm icon", "moon icon", "plane icon", "boat icon"];

let name = document.createElement("span");
name.innerHTML = "JAKE MANGINO";
name.id = "name";
name.classList.add("main");

let links = document.createElement("span");
links.id = "links";
let about = document.createElement("span");
let projects = document.createElement("span");
let contact = document.createElement("span");
let links_objs = [about, projects, contact];
about.id = "about";
projects.id = "projects";
contact.id = "contact me";
for (let i = 0; i < links_objs.length; i++) {
  links.appendChild(links_objs[i]);
  links_objs[i].classList.add("main");
  links_objs[i].classList.add("hoverable");
  links_objs[i].innerHTML = links_objs[i].id;
}

let bar = document.getElementById("newBar");
bar.appendChild(name);
bar.appendChild(links);


function toWhite(event) {
  event.target.style.filter = "invert(1)";
}

function toBlack(event) {
  event.target.style.filter = "invert(0)";
}

function toGray(event) {
  event.target.style.filter = "invert(0.5)";
}

let elements = document.getElementsByClassName("hoverable");
for (let i = 0; i < elements.length; i++) {
  elements[i].style.cursor = "pointer";
  elements[i].addEventListener("mouseenter", toWhite);
  elements[i].addEventListener("mouseleave", toBlack);
}


let duration = 2000;

let about_section_ID = "aboutSection";
let about_section_content = ["This portfolio was made not only as a way for others to get to know more about me, but also as an expression of love and gratitude for the state that I’ve lived in for the past 22 years. As you navigate through this site, if you so please, take the time to hover over the scenery with your mouse to learn more about the sites and scenery of Washington."];
let about_tweenList;/* = [new TWEEN.Tween(scene.rotation).to({y: Math.PI/4}, duration).easing(TWEEN.Easing.Quadratic.InOut),
                      new TWEEN.Tween(camera.position).to({x: -5.2}, duration).easing(TWEEN.Easing.Quadratic.InOut),
                      new TWEEN.Tween(camera.position).to({y: 14}, duration).easing(TWEEN.Easing.Quadratic.InOut),
                      new TWEEN.Tween(camera.position).to({z: -15.6}, duration).easing(TWEEN.Easing.Quadratic.InOut),
                      new TWEEN.Tween(cameraTarget).to({x: -107, y: 20, z: 40},duration).easing(TWEEN.Easing.Quadratic.InOut)];*/
about.addEventListener('click', () => {menu_clicked(about_section_ID, about_section_content, about_tweenList);});

let project_section_ID = "projectSection";
let project_section_content = ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'];
/*let project_tweenList = [new TWEEN.Tween(scene.rotation).to({y: Math.PI/1.5}, duration).easing(TWEEN.Easing.Quadratic.InOut),
                        new TWEEN.Tween(camera.position).to({x: -76}, duration).easing(TWEEN.Easing.Quadratic.InOut),
                        new TWEEN.Tween(camera.position).to({z: -6}, duration).easing(TWEEN.Easing.Quadratic.InOut),
                        new TWEEN.Tween(cameraTarget).to({x: -107, y: 30, z: 0},duration).easing(TWEEN.Easing.Quadratic.InOut)];*/
let project_tweenList = [new TWEEN.Tween(scene.rotation).to({y: Math.PI/4}, duration).easing(TWEEN.Easing.Quadratic.InOut),
  new TWEEN.Tween(camera.position).to({x: -5.2}, duration).easing(TWEEN.Easing.Quadratic.InOut),
  new TWEEN.Tween(camera.position).to({y: 14}, duration).easing(TWEEN.Easing.Quadratic.InOut),
  new TWEEN.Tween(camera.position).to({z: 0}, duration).easing(TWEEN.Easing.Quadratic.InOut),
  new TWEEN.Tween(cameraTarget).to({x: -107, y: 20, z: 40},duration).easing(TWEEN.Easing.Quadratic.InOut)];
projects.addEventListener('click', () => {menu_clicked(project_section_ID, project_section_content, project_tweenList);});


function menu_clicked(sectionID, sectionContent, tweenList) {
  if (raining || night) {
    sunny();
  }
  let section = document.createElement("p");
  section.id = sectionID;
  for (let i = 0; i < sectionContent.length; i++) {
    section.innerHTML += sectionContent[i];
  }

  document.getElementById("newBar").style.animationName = "move";
  document.getElementById("newBar").style.animationDuration = "3s";
  setTimeout(() => {changeBar();
    document.getElementById("newBar").appendChild(section);
  }, 1500);
  
  setTimeout(function(){
    for (let i = 0; i < tweenList.length; i++) {
      tweenList[i].start();
    }
  }, 500);

  if (sectionID == "aboutSection") {
    //new TWEEN.Tween(cameraCoords).to({x: -10, y: 14, z:-15.6}, 2500).easing(TWEEN.Easing.Quadratic.InOut).start();
    setTimeout(function() {onAbout = true;
      onProjects = false;}, 2500);
  } else {
    new TWEEN.Tween(cameraCoords).to({x: -5.2, y: 14, z:0}, 2500).easing(TWEEN.Easing.Quadratic.InOut).start();
    //new TWEEN.Tween(cameraCoords).to({x: -76}, 2500).easing(TWEEN.Easing.Quadratic.InOut).start();
    setTimeout(function() {onAbout = false;
      onProjects = true;}, 2500);
  }

  setTimeout(function(){document.getElementById(sectionID).scrollIntoView({behavior: 'smooth'});}, 5);

  setTimeout(function(){
    let span = document.createElement("span");
    span.innerHTML = " < back ";
    span.id = "back";
    span.classList.add("text");
    span.style.cursor = "pointer";
    span.addEventListener("mouseenter", toWhite);
    span.addEventListener("mouseleave", toBlack);
    span.addEventListener("click", () => {goBack(section);});
    span.style.position = "sticky";
    span.style.top = "5vh";
    span.style.left = "2vw";
    document.body.appendChild(span);
  }, 2500);

  if (sectionID == "projectSection") {
    setTimeout(function() {
      beginTheBirds();
    }, 6000);
  }
}

function changeBar() {
  while (bar.firstChild) {
    bar.removeChild(bar.firstChild);
  }
}


function rainy() {
  if (night) {
    setTimeout(() => {scene.remove(stars); night = false;}, 1800);
    new TWEEN.Tween(light.color).to({r: 1, g: 1, b: 1}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    resetWordsToBlack();
  }
  setTimeout(() => {scene.add(rain)}, 1300);
  for (let i = 0; i < clouds.length; i++) {
    new TWEEN.Tween(clouds[i].material.color).to({r:.25, g:.25, b:.25}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  }
  new TWEEN.Tween(scene.background).to({r:.325, g:.408, b:.447}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(light).to({intensity: 0.3}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  raining = true;
}

function nighttime() {
  if (raining) {
    setTimeout(() => {scene.remove(rain); raining = false;}, 500);
  }
  scene.add(stars);
  for (let i = 0; i < clouds.length; i++) {
    new TWEEN.Tween(clouds[i].material.color).to({r:.5, g:.5, b:.5}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  }
  new TWEEN.Tween(scene.background).to({r:0, g: 0, b:0}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(light).to({intensity: 0.15}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(light.color).to({r: .7608, g:.7725, b:.8}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  setTimeout(function() {
    for (let i = 0; i < ids.length; i++) {
      document.getElementById(ids[i]).style.animationName = "iconChange";
      document.getElementById(ids[i]).style.animationDuration = "2s";
      if ( (i > 0 && i < 4) || i > 4) {
        document.getElementById(ids[i]).removeEventListener("mouseenter", toWhite);
        document.getElementById(ids[i]).removeEventListener("mouseleave", toBlack);
        document.getElementById(ids[i]).addEventListener("mouseenter", toGray);
        document.getElementById(ids[i]).addEventListener("mouseleave", toWhite);
      }
    }
  }, 1000);
  setTimeout(function() {
    for (let i = 0; i < ids.length; i++) {
      document.getElementById(ids[i]).style.filter = "invert(1)";
    }
  }, 2000);
  night = true;
}


function resetWordsToBlack() {
  setTimeout(function() {
    for (let i = 0; i < ids.length; i++) {
      document.getElementById(ids[i]).style.animationName = "iconChangeBack";
      document.getElementById(ids[i]).style.animationDuration = "2s";
      if ( i > 0 && i < 4 || i > 4) {
        document.getElementById(ids[i]).removeEventListener("mouseenter", toGray);
        document.getElementById(ids[i]).removeEventListener("mouseleave", toWhite);
        document.getElementById(ids[i]).addEventListener("mouseenter", toWhite);
        document.getElementById(ids[i]).addEventListener("mouseleave", toBlack);
      }
    }
  }, 1000);
  setTimeout(function() {
    for (let i = 0; i < ids.length; i++) {
      document.getElementById(ids[i]).style.filter = "invert(0)";
    }
   
  }, 2000);
}

function sunny() {
  new TWEEN.Tween(scene.background).to({r:.52, g:.8, b:.92}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  for (let i = 0; i < clouds.length; i++) {
    new TWEEN.Tween(clouds[i].material.color).to({r:1, g:1, b:1}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  }
  new TWEEN.Tween(light).to({intensity: 1}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
  if (night) {
    new TWEEN.Tween(light.color).to({r: 1, g:1, b:1}, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    resetWordsToBlack();
    night = false;
    setTimeout(() => {scene.remove(stars)}, 1800);
  }
  else if (raining) {
    raining = false;
    setTimeout(() => {scene.remove(rain), 1800});
  }
}

function flyPlane() {
  if (!planeIn) {
    planeIn = true;
    scene.add(seaplane);
    seaplane.position.set(20, 55, -85);
    new TWEEN.Tween(seaplane.position).to({x: 10, y:7.75, z:0}, 25000).easing(TWEEN.Easing.Quadratic.InOut).start();
    new TWEEN.Tween(seaplane.rotation).to({x: "-" + Math.PI/16}, 25000).easing(TWEEN.Easing.Quadratic.InOut).start();
    seaplane.scale.set(.3, .3, .3);
    seaplane.rotateX(Math.PI/8);
    setTimeout(function() {
      spin.stop();
      spin2.stop();
      planeOn = true;
      new TWEEN.Tween(seaplane.rotation).to({y: Math.PI / 2}, 20000).easing(TWEEN.Easing.Quadratic.InOut).start();
    }, 25000)
  } else if (planeOn) {
    // let the plane take off!
  }
}

function goBoat() {
  boat.position.set(80, 30.5, -150);
  boat.rotateY(3*Math.PI/4);
  new TWEEN.Tween(boat.position).to({x: 120, z:-120}, 20000).easing(TWEEN.Easing.Quadratic.InOut).start();
  for (let i = 0; i < 4000; i++) {
    setTimeout(function() {upperBridge.rotateX(Math.PI/8000); upperBridgeBars.rotateX(Math.PI/8000); lowerBridge.rotateX(-Math.PI/8000); lowerBridgeBars.rotateX(-Math.PI/8000);}, i);
  }
  setTimeout(function() {for (let i = 0; i < 4000; i++) {
    setTimeout(function() {upperBridge.rotateX(-Math.PI/8000); lowerBridge.rotateX(Math.PI/8000); upperBridgeBars.rotateX(-Math.PI/8000); lowerBridgeBars.rotateX(Math.PI/8000)}, i);
  }}, 15000);
}


let allTheParts = [];
let birdTweens = [];
function beginTheBirds() {
  let birdParts = [bird, bird1, bird2];
  for (let j = 0; j < 4; j++) {
    let ran = Math.random() / 20;
    for (let i = 0; i < birdParts.length; i++) {
      let birdMesh = new THREE.Mesh(birdParts[i].geometry, new THREE.MeshPhongMaterial({color: 0x222222, side: THREE.DoubleSide}));
      scene.add(birdMesh);
      let scale = 1 + ran;
      birdMesh.scale.set(scale, scale, scale);
      birdMesh.position.set(-150 + 1000*ran, -80 + 1000*ran, -200 + 1000*ran);
      birdMesh.rotateY(-Math.PI/2);
      birdMesh.rotateX(Math.PI/4);
      allTheParts.push(birdMesh);
      let z1 = Math.PI/4;
      let z2 = 3*Math.PI/4;
      if (i == 1) {
        let temp = z1;
        z1 = z2;
        z2 = temp;
      }
      if (i != 0) {
        let tweenA = new TWEEN.Tween(birdMesh.rotation).to({z: z1} ,250).easing(TWEEN.Easing.Quadratic.In);
        let tweenB = new TWEEN.Tween(birdMesh.rotation).to({z: z2} ,250).easing(TWEEN.Easing.Quadratic.In);
        tweenA.chain(tweenB);
        tweenB.chain(tweenA);
        birdTweens.push(tweenA);
      }
    }
  }
}


function goBack(element) {
  document.getElementById("br").scrollIntoView({behavior: 'smooth'});
  setTimeout (function() {
    document.getElementById("back").remove();
    let duration= 2000;
    new TWEEN.Tween(scene.rotation).to({y: 0}, duration).easing(TWEEN.Easing.Quadratic.InOut).start();
    new TWEEN.Tween(camera.position).to({x: 42, y: 50, z: -56}, duration).easing(TWEEN.Easing.Quadratic.InOut).start();
    new TWEEN.Tween(cameraCoords).to({x: 42, y: 50}, duration).easing(TWEEN.Easing.Quadratic.InOut).start();
    new TWEEN.Tween(cameraTarget).to({x: scene.position.x, y: scene.position.y, z: scene.position.z},duration).easing(TWEEN.Easing.Quadratic.InOut).start();
  }, 500);
  
  setTimeout(function(){document.getElementById("name").scrollIntoView({behavior: 'smooth'});}, 2500);
  setTimeout(function() {
    onAbout = false;
    onProjects = false;
  }, 2500);
  element.remove();
}



/******************************** ANIMATE ***********************************/

const raycaster = new THREE.Raycaster();
// BIRD STUFF
let birdHeight = 0;
let notTweened = true;
// BOAT
let value = 0;
let speed = 0.01;
let velocities = [];
// RAIN
for (let i = 0; i < rainCount; i++) {
  velocities.push(0);
}
// TEXT
let texted = false;
let textMesh;
let textMeshX;
let textMeshZ;
let myMaterial;
let myMessage = 'I\'ll be home ';
let numToAdd = 4;

let caught;
let totalCaught;
let onProjects = false;

let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame( animate );

  let time = clock.getElapsedTime();

  vertData.forEach((vd, idx) => {
    let y = vd.initH + Math.sin(time + vd.phase) * vd.amplitude;
    //console.log(y + " " + idx);
    cut.attributes.position.setY(idx, y);
  })
  cut.attributes.position.needsUpdate = true;
  cut.computeVertexNormals();




  /*
  if (myFont != null && !texted && onProjects) {
    let message = myMessage;
    let shapes = myFont.generateShapes(message, 1);
    const textGeo = new THREE.ShapeGeometry(shapes);
    myMaterial = new THREE.LineBasicMaterial({color: 0x000000, side: THREE.DoubleSide});
    textMesh = new THREE.Mesh(textGeo, myMaterial);
    scene.add(textMesh);
    textMeshX = 30;
    textMeshZ = -90;
    textMesh.position.set(textMeshX, 40, textMeshZ);
    textMesh.rotateY(-Math.PI / 16);
    textMesh.rotateX(-Math.PI / 6);
    textMesh.rotateZ(-Math.PI / 64);
    textMesh.scale.set(5, 5, 5);
    texted = true;
    setTimeout(() => {myMessage += 's'; numToAdd--}, 1000);
    setTimeout(() => {myMessage += 'o'; numToAdd--}, 2000);
    setTimeout(() => {myMessage += 'o'; numToAdd--}, 3000);
    setTimeout(() => {myMessage += 'n'; numToAdd--}, 4000);
  } else if (myFont != null && texted) {
    scene.remove(textMesh);
    let messageToAdd = myMessage;
    let charNums = [];
    for (let i = 0; i < numToAdd; i++) {
      charNums.push(parseInt(Math.random() * 25) + 97);
    }
    for (let i = 0; i < numToAdd; i++) {
      messageToAdd += String.fromCharCode(charNums[i]);
    }
    let shapes = myFont.generateShapes(messageToAdd, 1);
    const textGeo = new THREE.ShapeGeometry(shapes);
    textMesh = new THREE.Mesh(textGeo, myMaterial);
    scene.add(textMesh);
    textMesh.rotateY(-Math.PI / 16);
    textMesh.rotateX(-Math.PI / 6);
    textMesh.rotateZ(-Math.PI / 64);
    textMesh.position.set(textMeshX, 40, textMeshZ);
  }
  */

  
  // MOUSE PARALLAX
  /*
  if (!onAbout) {
    camera.position.x += (cameraCoords.x + mouse.x - camera.position.x) * .02 ;
    camera.position.y += (cameraCoords.y - mouse.y - camera.position.y) * .02 ;
  } else if (onAbout || onProjects) {
    camera.position.z += (cameraCoords.z - mouse.x/2- camera.position.z) * .02 ;
    camera.position.y += (cameraCoords.y + mouse.y/2 - camera.position.y) * .02 ;
  }
  camera.lookAt(cameraTarget);
  */

  //BOAT HANDLING 
  /*
  let x = Math.sin(value);
  let y = Math.cos(value);
  let float = Math.sin(4*value) / 8;
  x *= 4.5;
  y *= 2;
  x += 15.5;
  boat.position.set(x, 7.2 + float, y);
  boat.rotateY(speed * 100 * Math.abs((x - 15.5)) / (Math.PI *90));
  value += speed;*/

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
      let end = new TWEEN.Tween(clouds[cloudNum].material.color).to({r:.25, g:.25, b:.25}, lightningDuration).easing(TWEEN.Easing.Elastic.InOut);
      let lightBangStart = new TWEEN.Tween(light).to({intensity: 1}, lightningDuration).easing(TWEEN.Easing.Elastic.InOut);
      let lightBangEnd = new TWEEN.Tween(light).to({intensity: .3}, lightningDuration).easing(TWEEN.Easing.Elastic.InOut);
      strike.chain(end);
      lightBangStart.chain(lightBangEnd);
      strike.start();
      lightBangStart.start();
    }
  }

  //FOUNTAIN
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




  if (onProjects) {
    raycaster.setFromCamera( rayMouse, camera );
    const intersects = raycaster.intersectObjects(scene.children);
    caught = false;
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object == flowerHolderMesh) {
        if (!totalCaught) {
          textMaterial.opacity = 1;
          textMaterial.transparent = false;
          totalCaught = true;
        }
        caught = true;
      }
    }
    if (!caught) {
      textMaterial.opacity = 0;
      textMaterial.transparent = true;
      totalCaught = false;
    }
  }

  
  // BIRD HANDLING
  /*
  if (birdTweens.length > 0 && notTweened) {
    for (let i = 0; i < birdTweens.length; i++) {
      birdTweens[i].start();
    }
    notTweened = false;
  }
  if (allTheParts.length > 0) {
    for (let i = 0; i < allTheParts.length; i += 3) {
      let rand = Math.random();
      rand /= 5;
      rand += 1  + Math.sin(birdHeight) / 10;
      allTheParts[i].position.x += rand;
      allTheParts[i].position.y += rand;
      allTheParts[i+1].position.x += rand;
      allTheParts[i+1].position.y += rand;
      allTheParts[i+2].position.x += rand;
      allTheParts[i+2].position.y += rand; 
    }
    birdHeight += 0.01;
  }
  */
  
  
  
  //OVERALL
  renderer.render( scene, camera );
  
  TWEEN.update();
  //console.log(camera.position);
};

animate();
