import * as THREE from 'three'
import {PointerLockControls} from '/three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from '/three/examples/jsm/loaders/GLTFLoader.js';

import { MTLLoader } from '/three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '/three/examples/jsm/loaders/OBJLoader.js';


let canvas = document.querySelector('canvas')
let gui1 = document.getElementById('playersOnline')
let percentLoaded = document.getElementById('percentLoaded')
const keyObject = {w:false,a:false,s:false,d:false};

var activePlayers = new Map()
var playerObjects = new Map()

let time = 0

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.rotateX(Math.PI/2)
camera.position.xv = 0
camera.position.yv = 0
camera.position.zv = 0


const controls = new PointerLockControls(camera, canvas);
controls.connect()

const renderer = new THREE.WebGLRenderer({
     canvas: canvas,
     antialias: true,
    });
renderer.setSize( window.innerWidth, window.innerHeight );
//renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default 
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild( renderer.domElement );

//add light
const light = new THREE.DirectionalLight( 0xffffff, 0.5, 100 );
light.position.set( 0, 10, 0 );
light.castShadow = true; // default false
scene.add( light );

//add ambient light
const Alight = new THREE.AmbientLight( 0xffffff, 0.5, 100 );
Alight.position.set( 0, 10, 0 );
Alight.castShadow = false; // default false
scene.add( Alight );


//Set up shadow properties for the light
light.shadow.mapSize.width = 512*2;
light.shadow.mapSize.height = 512*2;
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 150; // default


light.shadow.camera.left = -30;
light.shadow.camera.right = 30;
light.shadow.camera.top = 30;
light.shadow.camera.bottom = -30;


//Create a helper for the shadow camera (optional)
const helper = new THREE.CameraHelper( light.shadow.camera );
scene.add( helper );


//add fog
scene.fog = new THREE.Fog(new THREE.Color('grey'))

//add background
scene.background = new THREE.Color('lightblue')

//add textureloader
const textureLoader = new THREE.TextureLoader()

//add sun
var geometry = new THREE.SphereGeometry(10,50,50);
var material = new THREE.MeshStandardMaterial( {
    emissive:new THREE.Color('gold') 
    //map: grassMap,
    //normalMap: textureLoader.load( 'models/grass/normalMap.jpeg' ),
} );
var sun = new THREE.Mesh( geometry, material );
//sun.receiveShadow = false;
sun.position.set(0,100,0)
scene.add( sun );


var grassMap = textureLoader.load( 'models/grass/texture.jpg' )
grassMap.wrapS = THREE.RepeatWrapping;
grassMap.wrapT = THREE.RepeatWrapping;
grassMap.repeat.set( 1500, 1500 );
//add plane that recives shadows
var geometry = new THREE.PlaneGeometry(1500,1500,10,10);
var material = new THREE.MeshStandardMaterial( {
        //color:new THREE.Color('lime') 
        map: grassMap,
        normalMap: textureLoader.load( 'models/grass/normalMap.jpeg' ),
    } );
var plane = new THREE.Mesh( geometry, material );
plane.receiveShadow = true;
scene.add( plane );
plane.position.set(0,0,0)
plane.rotateX(-Math.PI/2)


let loader = new GLTFLoader();
loader.loadedTree = false

loader.load( './models/tree/Sequoia.gltf', function ( gltf ) {

	const tree = gltf.scene.children[0]

    tree.traverse( function( node ) {

        if ( node.isMesh ) { node.castShadow = true; }

    } );
	
	tree.position.set(0,0,0)
    
	//tree.rotateX(-Math.PI/2)
	tree.scale.set( 0.2, 0.2, 0.2 );
	tree.material = new THREE.MeshStandardMaterial();
    tree.castShadow = true; //default is false
	tree.receiveShadow = false; //default
    tree.transparent = true;
	scene.add( tree);

    loader.loadedTree = true
    controls.lock()
    percentLoaded.innerHTML = '';

}, function ( xhr ) {

    //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    loader.progress = ( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

},(err)=>{
    console.log(err)
} );

function updateSun(){
    let dist = 30
    time+= 0.001
    //time = (new Date().getHours()+(new Date().getMinutes()/60))*(Math.PI/12)
    //console.log(time)
    sun.position.set(dist*Math.cos(time),100,dist*Math.sin(time))
    light.position.set(dist*Math.cos(time),100,dist*Math.sin(time))

}

function drawplayers(){
    var geometry = new THREE.CylinderGeometry(0.5,0.5,2,50,10);
    var material = new THREE.MeshStandardMaterial( { color:new THREE.Color('pink') } );
    for( let i of activePlayers){
        if(!playerObjects.has(i[0])){
            //if not in objectMap yet
            playerObjects.set(i[0],new THREE.Mesh( geometry, material ))
            playerObjects.get(i[0]).castShadow = true; // default false
            scene.add(playerObjects.get(i[0]))
        }else{
            //if both exist then update
            playerObjects.get(i[0]).position.set(i[1][0],i[1][1],i[1][2])
        }
        
    }
    for(let j of playerObjects){
        if(!activePlayers.has(j[0])){
            //if not in server Map
            scene.remove(j[1])
            playerObjects.delete(j[0])
        }
    }
}

camera.position.z = 4;
camera.position.y = 3;
camera.position.x = 4;

camera.lookAt(0,3,0)

function move(){
    if(keyObject.w && camera.position.xv < 0.1){
        camera.position.xv +=0.01
    }
    if(keyObject.a&& camera.position.zv < 0.1){
        camera.position.zv -= 0.01
    }
    if(keyObject.s&& camera.position.xv < 0.1){
        camera.position.xv -= 0.01
    }
    if(keyObject.d&& camera.position.zv < 0.1){
        camera.position.zv += 0.01
    }

	if(keyObject.space ){
        camera.position.yv = 0.1
    }

    //apply drag
    camera.position.xv *= (0.9)
    camera.position.zv *= (0.9)

    //apply gravity
    if(camera.position.y > 2){
        camera.position.yv -= 0.01
    }else{
        camera.position.y = 2
    }


    camera.position.y += camera.position.yv
    controls.moveForward(camera.position.xv)
    controls.moveRight(camera.position.zv)
}

(async function() {

    const ws = await connectToServer();
    
    ws.onmessage = (webSocketMessage) => {
        var parsedMessage = JSON.parse(webSocketMessage.data)
        if(parsedMessage.active){
            activePlayers.set(parsedMessage.sender,[parsedMessage.x,parsedMessage.y,parsedMessage.z])
        }else{
            activePlayers.delete(parsedMessage.sender)
        }
        

        //console.log(activePlayers)
        //console.log(parsedMessage)

    };

    async function sendMSG(){
        ws.send(JSON.stringify({x:camera.position.x,y:camera.position.y,z:camera.position.z}))
    }

    async function connectToServer() {
        const pageUrl = new URL(window.location)
        console.log(pageUrl.port)
        if(pageUrl.port){
            let ws = new WebSocket(`ws://${pageUrl.hostname}:${pageUrl.port}`);
        }else{
            const ws = new WebSocket(`ws://${pageUrl.hostname}`);
        }
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                if(ws.readyState === 1) {
                    clearInterval(timer)
                    resolve(ws);
                }
            }, 10);
        });
    }
    setInterval(sendMSG,22)
})();

function animate() {
    requestAnimationFrame( animate );
    
    if(loader.loadedTree){
    //update sun
    updateSun()
    //draw other players
    drawplayers()
    //move
    move()
    //render scene locally
    renderer.render( scene, camera );
    }else{
        //console.log(loader.progress)
        percentLoaded.innerHTML = loader.progress;
    }

    var tempTable = '<table>'
    for(let i of activePlayers){
        tempTable +=`
            <tr>
                <td>${i[0]}</td>

            </tr>
        `
    }
    gui1.innerHTML = tempTable+'</table>'
};

canvas.onclick =  function(e){

    console.log('click')
    if(controls.islocked){
        controls.unlock()
    }else{
        controls.lock()
    }
}
//document.addEventListener('keydown', logKey);
document.onkeydown = function(e){
  if(e.key == 'w'){
    keyObject.w = true;
  }
	if(e.key == 'a'){
    keyObject.a = true;
	}
  if(e.key == 's'){
    keyObject.s = true;
	}
  if(e.key == 'd'){
		keyObject.d = true;
	}
	if(e.key == ' '){
		keyObject.space = true;
	}
}
document.onkeyup = function(e){
  if(e.key == 'w'){
    keyObject.w = false;
  }
	if(e.key == 'a'){
    keyObject.a = false;
	}
  if(e.key == 's'){
    keyObject.s = false;
	}
  if(e.key == 'd'){
		keyObject.d = false;
	}
	if(e.key == ' '){
		keyObject.space = false;
	}
}

animate();