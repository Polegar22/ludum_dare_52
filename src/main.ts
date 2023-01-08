import * as THREE from 'three'
import HumanHarverstScene from './HumanHarverstScene'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';



const width = window.innerWidth
const height = window.innerHeight

let mainScreen = document.getElementById('mainScreen')!
let app = document.getElementById('app')!
let endScreen = document.getElementById('endScreen')!
initGameScreens()


function initGameScreens(){
	document.addEventListener('keydown', handleKeyDown)	
}

function handleKeyDown(event: KeyboardEvent){
	mainScreen.style.display = "none";
	endScreen.style.display = "none";
	app.style.display="block"
	startGame()
}

function startGame(){
	document.removeEventListener('keydown', handleKeyDown)

	
	const renderer = new THREE.WebGLRenderer({
		canvas: document.getElementById('app') as HTMLCanvasElement
	})
	renderer.setSize(width, height)

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	const composer = new EffectComposer( renderer );

	
	
	const mainCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
	
	const scene = new HumanHarverstScene(mainCamera)
	scene.initialize()

	const renderPass = new RenderPass( scene, mainCamera );
	composer.addPass( renderPass );

	// const glitchPass = new GlitchPass();
	// composer.addPass( glitchPass );
	
	const urlParams = new URLSearchParams(window.location.search);
	if(urlParams.get("orbit")){
		const orbitControls = new OrbitControls(mainCamera, renderer.domElement);
		orbitControls.mouseButtons = {
			MIDDLE: THREE.MOUSE.ROTATE,
			RIGHT: THREE.MOUSE.PAN,
			LEFT:THREE.MOUSE.LEFT
		}
		orbitControls.enableDamping = true
		orbitControls.enablePan = true
		orbitControls.minDistance = 5
		orbitControls.maxDistance = 60
		orbitControls.maxPolarAngle = Math.PI / 2 - 0.05 // prevent camera below ground
		orbitControls.minPolarAngle = Math.PI / 4        // prevent top down view
		orbitControls.update();
	}

	
	function tick()
	{
		if(!scene.isGameOver()){
			scene.update()
			composer.render()
			requestAnimationFrame(tick)
		}
		else{
			gameOver()
		}
	}
	tick()
}


function gameOver(){
	mainScreen.style.display = "none";
	app.style.display="none"
	endScreen.style.display="flex"
	initGameScreens()
}

