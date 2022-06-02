/*
var globeRadius = 1000;
var globeYLocation = 1200;
var globeZLocation = 1200;
var offset = 1;
var maxY = globeYLocation + globeRadius + offset;
var minY = globeYLocation - globeRadius - offset;
var maxZ = globeZLocation + globeRadius + offset;
var minZ = globeZLocation - globeRadius - offset;
*/


//mtlLoader.load('globe (2).mtl', function(materials) {
  //materials.preload();
  //const objloader = new OBJLoader();
  //objloader.setMaterials(materials);
  // load a resource
  gLoader.load(
    // resource URL
    'test.glb',
    // called when resource is loaded
    function ( object ) {
      /*var texture = new THREE.TextureLoader().load( 'mynewimage.png' );
      var texture1 = new THREE.TextureLoader().load( 'ocean.1001.png' );
      var material = new THREE.MeshPhongMaterial( { map: texture } );
      var material1 = new THREE.MeshPhongMaterial( {map: texture1});
      var mesh = new THREE.Mesh(object, material);*/
      scene.add(object.scene);
      object.scene.scale.set(10, 10, 10);
      let light = new THREE.SpotLight(0xff7b36,1);
      light.position.set(0,60,60);
      light.castShadow = true;
      light.target = object.scene;
      scene.add( light );
      const helper = new SpotLightHelper(light);
      scene.add(helper);
      /*var divider = 4;
      mesh.scale.set(globeRadius / divider - 130, globeRadius / divider - 130,  globeRadius / divider -130);
      mesh.position.set(0, 0, 0);
      //mesh.rotateZ(10);
      var sph = new THREE.SphereGeometry(49.5, 7, 7);
      var sphMesh = new THREE.Mesh(sph, material1);
      scene.add(sphMesh);
      sphMesh.position.set(0, 0, 0);*/
    },
    // called when loading is in progresses
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      console.log(error );
    }
  );
//}) 

//var loader = new FontLoader();

/*
var meshy;

loader.load( 'node_modules/three/examples/fonts/helvetiker_bold.typeface.json', function ( font ) {

  var textGeo = new TextGeometry( "Jake Mangino", {

      font: font,

      size: 100,
      height: 1,
      curveSegments: 20,

      bevelThickness: 1,
      bevelSize: 1,
      bevelEnabled: true

  } );

  textGeo.center()

  var textMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );

  meshy = new THREE.Mesh( textGeo, textMaterial );

  scene.add(meshy);

  meshy.position.set(0, 505, 1200);
  meshy.lookAt(0, globeYLocation, globeZLocation);

} );
*/

var oldTime = 0;
/*
window.addEventListener("wheel", function(e) {
  var y_trig = Math.sin(oldTime);
  var z_trig = Math.cos(oldTime);
  var originY = y_trig * (globeRadius + offset);
  var originZ = z_trig * (globeRadius + offset);
  var y = originY + globeYLocation;
  var z = originZ + globeZLocation;
  camera.position.set(0, y, z);
  console.log(camera.position);

  var maxY = globeYLocation + globeRadius + offset;
  var minY = globeYLocation - globeRadius - offset;
  var maxZ = globeZLocation + globeRadius + offset;
  var minZ = globeZLocation - globeRadius - offset;

  var y_int = y + (z_trig / y_trig) * z
  var z_int = (y_int * y_trig) / z_trig;

  if (y_trig > 0 && z_trig > 0) { // 1
    // find y int
    camera.lookAt(0, y_int, 0);
  } else if(y_trig < 0 && z_trig < 0) { // 3
    camera.lookAt(0,0,z_int);
    camera.rotateZ(Math.PI);
  } else if (y_trig > 0 && z_trig < 0) { // 2
    // find z int
    camera.lookAt(0, y_int, 0);
  } else if (y_trig < 0 && z_trig > 0) { // 4
    camera.lookAt(0, maxY, (maxY-y_int) * (-1 * y_trig/z_trig));
    camera.rotateZ(Math.PI);
  } else if (y_trig == 0) {
    if (z_trig == 1) {
      camera.lookAt(0, maxY, -1);
    } else {
      camera.lookAt(0, minY, 1);
    }
  } else if (z_trig == 0) {
    if (y_trig == 1) {
      camera.lookAt(0, 1, maxZ);
    } else {
      camera.lookAt(0, -1, minZ);
    }
  }
  oldTime += .01; 
}, true);

*/


/*let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 35, 35);
floorGeometry.rotateX( - Math.PI / 2 );

// vertex displacement

let position = floorGeometry.attributes.position;
let vertex = new THREE.Vector3();
let color = new THREE.Color();


for ( let i = 0, l = position.count; i < l; i ++ ) {

  vertex.fromBufferAttribute( position, i );

  vertex.x += Math.random() * 20 - 10;
  vertex.y += Math.random() * 2;
  vertex.z += Math.random() * 20 - 10;
  var centerX = 750;
  var centerZ = 750;
  var center1X = 730;
  var center1Z = 250;
  if (Math.pow(vertex.x - centerX, 2) + Math.pow(vertex.z - centerZ, 2) < 250000) {
    if (Math.pow(vertex.x - centerX, 2) + Math.pow(vertex.z - centerZ, 2) >= 5000) {
      let y = -50 * Math.log(Math.pow(vertex.x - centerX, 2) + Math.pow(vertex.z - centerZ, 2)) + 625;
      vertex.y += y;
    }
  } else if (Math.pow(vertex.x - center1X, 2) + Math.pow(vertex.z - center1Z, 2) < 250000) {
    if (Math.pow(vertex.x - center1X, 2) + Math.pow(vertex.z - center1Z, 2) >= 5000) {
      if (Math.pow(vertex.x - center1X, 2) + Math.pow(vertex.z - center1Z, 2) < 6000) {
        let y = -50 * Math.log(Math.pow(vertex.x - center1X, 2) + Math.pow(vertex.z - center1Z, 2)) + 1000;
        vertex.y += y;
      } else {
        let y = -50 * Math.log(Math.pow(vertex.x - center1X, 2) + Math.pow(vertex.z - center1Z, 2)) + 625;
        vertex.y += y;
      }
    }
  }

  position.setXYZ( i, vertex.x, vertex.y, vertex.z );

}

floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

position = floorGeometry.attributes.position;
const colorsFloor = [];

for ( let i = 0, l = position.count; i < l; i ++ ) {
  if (Math.pow(position.getX(i) - 750, 2) + Math.pow(position.getZ(i) - 750, 2) < 200000) {
    var rand = Math.random() * 100;
    if (Math.pow(position.getX(i) - 750 + rand, 2) + Math.pow(position.getZ(i) - 750 + rand, 2) < 10000) {
      color.setRGB(1 - Math.random() / 20, 1 - Math.random() / 20, 1 - Math.random() / 20);
    } else {
      color.setRGB(.5 - Math.random() / 20, .5 - Math.random() / 20, .5 - Math.random() / 20);
    }
  } else {
    color.setRGB(.33 + Math.random() / 20, .49 + Math.random() / 20, .27 + Math.random() / 20);
  }
  colorsFloor.push( color.r, color.g, color.b );
}
console.log(position.count);

floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsFloor, 3 ) );

const floorMaterial = new THREE.MeshPhongMaterial( { vertexColors: true } );
//floorMaterial.flatShading = true;

const floor = new THREE.Mesh( floorGeometry, floorMaterial );
scene.add( floor );
floor.position.set(0,  0,0);
*/
/*
  const fallSpeed = 0.006;
  const amplitude = 150;
  const decayRate = -0.25;
  const timer = Date.now() - start;
  // TODO: set so it stops calculating after a bit 
  meshy.position.y = Math.abs((Math.cos(timer * fallSpeed) + Math.sin(timer * fallSpeed)) * (amplitude * Math.exp(decayRate * timer * fallSpeed)));
  */

  /*let tweenA = new TWEEN.Tween(cameraTest.position).to({x: 8, y: 15, z: -12}
        ,1450).easing(TWEEN.Easing.Quadratic.In);
      let tweenB = new TWEEN.Tween(cameraTest.position).to({x: 3, y:14, z: -15}
        ,500);
      let tweenC = new TWEEN.Tween(cameraTest.position).to({x: -4, y: 13, z: -12.3}
        ,1000).easing(TWEEN.Easing.Quadratic.Out);    
        //spinAboutSign();
      tweenB.chain(tweenC);
      tweenA.chain(tweenB);
      tweenA.start();
      let tween1 = new TWEEN.Tween(cameraTest.rotation).to({y: Math.PI / 4}
        ,1000).easing(TWEEN.Easing.Quadratic.InOut);  
      let tween2 = new TWEEN.Tween(cameraTest.rotation).to({y: Math.PI / 2}
        ,1000).easing(TWEEN.Easing.Quadratic.InOut); 
      tween1.chain(tween2);
      tween1.start();*/


// ABOUT HOVER
raycaster.setFromCamera( mouse, camera );
const intersects = raycaster.intersectObjects( scene.children );
current_hover = false;
for (let i = 0; i < intersects.length; i++) {
  if (intersects[i].object == about && !hover_on) {
      about_hover = new THREE.Mesh(about_geo, about_material);
      about_hover.position.set(12.12, 16.61, -12.6);
      about_hover.scale.set(21, 6, .5);
      scene.add(about_hover);
      hover_on = true;
      document.body.style.cursor = 'pointer';
  } else if (intersects[i].object == about) {
      current_hover = true;
  }
}
if (!current_hover) {
  document.body.style.cursor = 'default';
  scene.remove(about_hover);
  hover_on = false;
}


// ABOUT HOVER
let about_material = new THREE.MeshBasicMaterial({color: 0x654321, side: THREE.DoubleSide})
let about_hover;
let hover_on = false;
let current_hover = false;


  // ZOOM IN ANIMATION
  /*
  // ZOOM ANIMATION
let zoomed = false;
  if (!zoomed) {
    let timeForAnimation = 3000;
    new TWEEN.Tween(camera.position).to({x: 12, y: 16, z: -18.3}, timeForAnimation).easing(TWEEN.Easing.Quadratic.InOut).delay(4000).start();
    new TWEEN.Tween(camera.rotation).to({x: camera.rotation.x - Math.PI / 4}, timeForAnimation).easing(TWEEN.Easing.Quadratic.InOut).delay(4000).start();
    new TWEEN.Tween(camera.rotation).to({y: camera.rotation.y + Math.PI / 10}, timeForAnimation).easing(TWEEN.Easing.Quadratic.InOut).delay(4000).start();
    new TWEEN.Tween(camera.rotation).to({z: camera.rotation.z + Math.PI / 8}, timeForAnimation).easing(TWEEN.Easing.Quadratic.InOut).delay(4000).start();
    zoomed = true;
  }
  */

  //MOVEMENT TO UW SIGN (VIA PATH)
  /*
  if (percent < 100 && move) {
    percent += 0.02;
    let point = path.getPointAt(percent);
    if (point != null) {
      camera.position.set(point.x + oldCameraX, camera.position.y - 0.07, point.y + oldCameraZ);
      let nextPoint = path.getPointAt(percent + 0.01);
      if (nextPoint != null) {
        camera.lookAt(new THREE.Vector3(nextPoint.x, camera.position.y, nextPoint.y))
      }
    }
  }*/

  /******************************** PATH SETUP ***********************************/

/*

const path = new THREE.Path();

//path.lineTo(-3, 3);
path.quadraticCurveTo(-3, 4, -9, 0);
//path.lineTo(-12, 3);
path.quadraticCurveTo(-14, -2, -17, 2);

const points = path.getPoints();

const geometry = new THREE.BufferGeometry().setFromPoints( points );
const material = new THREE.LineBasicMaterial( { color: 0xffffff } );

const line = new THREE.Line( geometry, material );
line.position.set(oldCameraX, 12, oldCameraZ);
line.rotateX(Math.PI/2);
scene.add( line );
*/

/*
window.addEventListener("wheel", function(e) {
  oldCameraX -= 0.4;
  oldCameraZ += 0.1;
  oldCameraY -= 0.05;
  camera.position.set(oldCameraX, oldCameraY, oldCameraZ);
}, true);
*/


/*const canvas = document.createElement( 'canvas' );
canvas.width = 1;
canvas.height = 32;

const context = canvas.getContext( '2d' );
const gradient = context.createLinearGradient( 0, 0, 0, 32 );
gradient.addColorStop( 0.0, '#014a84' );
gradient.addColorStop( 0.5, '#0561a0' );
gradient.addColorStop( 1.0, '#437ab6' );
context.fillStyle = gradient;
context.fillRect( 0, 0, 1, 32 );

const sky = new THREE.Mesh(
  new THREE.SphereGeometry( 1100 ),
  new THREE.MeshBasicMaterial( { map: new THREE.CanvasTexture( canvas ), side: THREE.BackSide } )
);
scene.add( sky );*/


/*
gLoader.load(
  // resource URL
  'bedroom.glb',
  function (object) {
   houseScene.add(object.scene);
   object.scene.castShadow = true;
   object.scene.receiveShadow = true;
   object.scene.position.set(0, 10, -10);
   //camera.position.set(0, 3, 0);
   //ðcamera.lookAt(-5, 0, -5);
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


*/


/******************************** FLOWER LOADING***********************************/
/*
let flowerLoaded = false;
let flower;
gLoader.load(
  // resource URL
  'flower (5).glb',
  function (object) {
    scene.add(object.scene);
    //object.scene.position.set(30, 35, -85);
    object.scene.position.set(-5.3, 1.6, 0);
    object.scene.scale.set(.1, .1, .1);
    object.scene.rotation.y = Math.PI/2;
    flower = object.scene;
    flowerLoaded = true;
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
// used so we can intercept it with the raycaster.  flower itself wasn't working :(
let flowerHolderGeo = new THREE.BoxGeometry(1, 1, 1.3);
const hdrEquirect = new RGBELoader().load(
  "empty_warehouse_01_4k.hdr",  
  () => { 
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping; 
  }
);
const flowerHolderMat = new THREE.MeshPhysicalMaterial({  
  transmission: 1,
  thickness: 1,
  roughness: 0,
  envMapIntensity: .09,
  envMap: hdrEquirect
});
let flowerHolderMesh = new THREE.Mesh(flowerHolderGeo, flowerHolderMat);
scene.add(flowerHolderMesh);
flowerHolderMesh.position.set(-5.3, 2.2, 0);
*/


/******************************** TEXT LOADING ***********************************/
/*
let textMaterial = new THREE.LineBasicMaterial({color: 0x000000, side: THREE.DoubleSide});
const fontLoad = new FontLoader();
let myFont = null;
fontLoad.load('node_modules/three/examples/fonts/Roboto Mono_Regular (2).json', function ( font ) {
  myFont = font;
  const message = 'pacific rhododendron';
  let shapes = font.generateShapes(message, 1);
  const textGeo = new THREE.ShapeGeometry(shapes);
  let textMesh = new THREE.Mesh(textGeo, textMaterial);
  scene.add(textMesh);
  //textMesh.position.set(30, 50, -90);
  textMesh.position.set(-5.3, 3.3, -1);
  textMesh.rotateY(Math.PI / 2);
  //textMesh.rotateX(-Math.PI / 6);
  //textMesh.rotateZ(Math.PI/2);
  textMesh.scale.set(.1, .1, .1);
  //textMesh.material.opacity = 0;
  //textMesh.material.transparent = true;
});

let textHolderMesh = new THREE.Mesh(flowerHolderGeo, flowerHolderMat);
scene.add(textHolderMesh);
textHolderMesh.position.set(-5.3, 3.4, -2);
*/


/******************************** BLOOM ***********************************/


/**************** LAYERS ******************/
const bloomLayer = new THREE.Layers();
bloomLayer.set( 1 );
const brightBloomLayer = new THREE.Layers();
brightBloomLayer.set( 2 );

/**************** PASSES ******************/
const renderScene = new RenderPass( scene2, camera );

const effectGrayScale = new ShaderPass( LuminosityShader );

const effectSobel = new ShaderPass( SobelOperatorShader );
effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;

const composer = new EffectComposer( renderer );
composer.addPass(renderScene);
composer.addPass( effectGrayScale );
composer.addPass( effectSobel );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = 0;
bloomPass.strength = 1.25;
bloomPass.radius = 1;

const brightBloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
brightBloomPass.threshold = 0;
brightBloomPass.strength = 2;
brightBloomPass.radius = 1;

let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene2, camera);

const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

const brightBloomComposer = new EffectComposer( renderer );
brightBloomComposer.renderToScreen = false;
brightBloomComposer.addPass( renderScene );
brightBloomComposer.addPass( brightBloomPass );


const planeComposer = new EffectComposer(renderer, myRenderTarget);
planeComposer.addPass(renderScene)
planeComposer.addPass(outlinePass);


const finalPass = new ShaderPass(
  new THREE.ShaderMaterial( {
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture },
      bloomTexture2: {value: brightBloomComposer.renderTarget2.texture}
    },
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
    defines: {}
  } ), 'baseTexture'
);
finalPass.needsSwap = true;

/**************** COMPOSERS ******************/


const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );


/**************** BLOOM RENDER FUNCTIONS ******************/
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

let waterSinkTime = 1500;
function waterLevel(sink) {
  let y = 5.4;
  let scale = 1;
  if (sink) {
    y = 4.08;
    scale = 0;
  } else {
    water.scale.set(0, 0, 0);
    water.position.y = 4.08;
    duck.position.y = 4.08;
    //scene.add(water);
  }
  new TWEEN.Tween(water.position).to({x: water.position.x, y: y, z: water.position.z}, waterSinkTime).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(duck.position).to({x: duck.position.x, y: y, z: duck.position.z}, waterSinkTime).easing(TWEEN.Easing.Quadratic.InOut).start();
  new TWEEN.Tween(water.scale).to({x: scale, y: scale, z: scale}, waterSinkTime).easing(TWEEN.Easing.Quadratic.InOut).start();
  if (sink) {
    setTimeout(() => {
      scene.remove(water);
      water.geometry.dispose();
      water.material.dispose();
    }, waterSinkTime);
  }
}