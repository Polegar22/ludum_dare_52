import * as THREE from 'three'
import HumanHarverstScene from './HumanHarverstScene'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';



const width = window.innerWidth
const height = window.innerHeight

const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById('app') as HTMLCanvasElement
})
renderer.setSize(width, height)

const mainCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)

const scene = new HumanHarverstScene(mainCamera)
scene.initialize()

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
	scene.update()
	renderer.render(scene, mainCamera)
	requestAnimationFrame(tick)
}

tick()
