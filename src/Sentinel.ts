import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry';


//"Neo Smartphone" (https://skfb.ly/6VpvX) by Beinaja is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
export default class Sentinel extends THREE.Group
{
    private readonly keyDown = new Set<string>()
    private fireBulletHandler!: Function
	private raycaster = new THREE.Raycaster()
	private directionVector = new THREE.Vector3
	private levelMeshes : Array<THREE.Group>
	private speed = 0.1
    private screenMesh !: THREE.Mesh
    private materials !: {appName : string, material : THREE.MeshBasicMaterial}[]
    private clock = new THREE.Clock();


    constructor(camera: THREE.PerspectiveCamera, levelMeshes: Array<THREE.Group>)
	{
        super()
		this.levelMeshes = levelMeshes
        this.initMaterials()
		this.initModel()
		this.position.y=0.7
        this.add(camera)

		document.addEventListener('keydown', this.handleKeyDown)
		document.addEventListener('keyup', this.handleKeyUp)
	}

    private initMaterials(){
        this.materials = []
        for (const appName of ['facebook', 'twitter', 'instagram', 'snapchat', 'tiktok']) {
            const texture = new THREE.TextureLoader().load( `assets/${appName}.png` );
            const material = new THREE.MeshBasicMaterial( { map: texture } );
            this.materials.push(
                {
                    'appName': appName,
                    'material': material
                }
            )
        }
    }

	private async initModel(){
		const loadedModel=await new GLTFLoader().loadAsync('assets/smartphone.glb')
		const object= loadedModel.scene
		object.scale.multiplyScalar(0.3)

		this.screenMesh = object.getObjectByName('Object_8') as THREE.Mesh
        this.screenMesh.material = this.materials[0].material
        
		object.traverse((child:any) => {
			child.castShadow=true
			child.receiveShadow=true            
		});
		this.add(object)
		// this.add(m)
	}

    
	private handleKeyDown = (event: KeyboardEvent) => {
		this.keyDown.add(event.key.toLowerCase())
        if (event.key === ' ')
		{
            this.fireBulletHandler()
		}
	}

	private handleKeyUp = (event: KeyboardEvent) => {
		this.keyDown.delete(event.key.toLowerCase())
	}
    
    public setFireBulletHandler(fireBulletHandler: Function) {
        this.fireBulletHandler = fireBulletHandler
	}

    public updateInput()
	{
		const shiftKey = this.keyDown.has('shift')

		if (!shiftKey)
		{
			if (this.keyDown.has('a') || this.keyDown.has('arrowleft'))
			{
				this.rotateY(0.02)
			}
			else if (this.keyDown.has('d') || this.keyDown.has('arrowright'))
			{
				this.rotateY(-0.02)
			}
		}

		this.directionVector = this.getWorldDirection(new THREE.Vector3()).negate()
		let isGoingBack = false

		let wantedPosition = this.position.clone()

		if (this.keyDown.has('w') || this.keyDown.has('arrowup'))
		{
			wantedPosition.add(this.directionVector.clone().multiplyScalar(this.speed))
		}
		else if (this.keyDown.has('s') || this.keyDown.has('arrowdown'))
		{
			isGoingBack = true
			wantedPosition.add(this.directionVector.clone().multiplyScalar(-this.speed))
		}

		if (shiftKey)
		{
			const strafeDir = this.directionVector.clone()
			const upVector = new THREE.Vector3(0, 1, 0)

			if (this.keyDown.has('a') || this.keyDown.has('arrowleft'))
			{
				wantedPosition.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * 0.5)
						.multiplyScalar(this.speed)
				)
			}
			else if (this.keyDown.has('d') || this.keyDown.has('arrowright'))
			{
				wantedPosition.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * -0.5)
						.multiplyScalar(this.speed)
				)
			}
		}

		const wantedDirection = isGoingBack ? this.directionVector.clone().negate() : this.directionVector
		this.manageCollision(wantedPosition, wantedDirection)
		this.changeScreenApp(this.clock.getElapsedTime())
	}

	private manageCollision(wantedPosition: THREE.Vector3, wantedDirection: THREE.Vector3){
		this.raycaster.set(
			wantedPosition,
			wantedDirection
		)
	
		let intersections = this.raycaster.intersectObjects(this.levelMeshes, true).filter(intersection => intersection.distance < 0.4)
		if(intersections.length === 0){
			this.position.copy(wantedPosition)
		}
		else if(intersections[0].face){
			const normalVector = intersections[0].face?.normal
			// const refVector = new THREE.Vector3(0, 0, 1)
			// const refVectorNeg = new THREE.Vector3(1, 0, 0)
			// let dot = this.directionVector.clone().normalize().dot(refVector)
			// let negDot = this.directionVector.clone().normalize().dot(refVectorNeg)

			// let tangent = normalVector.clone().cross(refVector).normalize();
			this.position.add(normalVector.multiplyScalar(this.speed/10))	  
		}
	}

	private changeScreenApp(elapsedSeconds:number){
		if(this.materials && this.screenMesh && Math.floor(elapsedSeconds) % 5 == 0){
			const index =  Math.floor(Math.random() * this.materials.length);
			this.screenMesh.material = this.materials[index].material
		}
	}

}