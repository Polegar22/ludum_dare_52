import * as THREE from 'three'

export default class Bullet extends THREE.Group
{
	private readonly velocity = new THREE.Vector3()

	shouldDisapear = false
	private speed = 0.4
	private raycaster = new THREE.Raycaster()
	private levelMeshes : Array<THREE.Group>
	private directionVector = new THREE.Vector3


	constructor(directionVector: THREE.Vector3, sentinelPos: THREE.Vector3, levelMeshes: Array<THREE.Group>)
	{
		super()
		const geometry = new THREE.SphereGeometry( 0.03);
		const material = new THREE.MeshBasicMaterial( { color: 0xF84F31} );
		const sphere = new THREE.Mesh( geometry, material );
        this.add(sphere)
		this.levelMeshes = levelMeshes
		this.directionVector = directionVector
		this.positionBullet(sentinelPos)

		setTimeout(() => {
			this.shouldDisapear = true
		}, 1000)
	}

	positionBullet(sentinelPos: THREE.Vector3) {
		this.position.add(
			sentinelPos.clone()
		)

		this.setVelocity(
			this.directionVector.x * this.speed,
			this.directionVector.y * this.speed,
			this.directionVector.z * this.speed
		)
	}


	setVelocity(x: number, y: number, z: number)
	{
		this.velocity.set(x, y, z)
	}


	update()
	{
		let wantedPosition = this.position.clone()
		wantedPosition.x += this.velocity.x
		wantedPosition.y += this.velocity.y
		wantedPosition.z += this.velocity.z

		this.raycaster.set(
			wantedPosition,
			this.directionVector
		)
	
		let intersections = this.raycaster.intersectObjects(this.levelMeshes, true).filter(intersection => intersection.distance < 0.2)
		if(intersections.length === 0){
			this.position.copy(wantedPosition)
		}
		else{
			this.shouldDisapear = true
		}
	}
}
