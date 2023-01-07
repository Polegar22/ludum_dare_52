import * as THREE from 'three'

export default class Bullet extends THREE.Group
{
	private readonly velocity = new THREE.Vector3()

	private isDead = false
	private speed = 0.2

	constructor(sentinelWorldDir: THREE.Vector3, sentinelPos: THREE.Vector3)
	{
		super()
		const geometry = new THREE.SphereGeometry( 0.1);
		const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
		const sphere = new THREE.Mesh( geometry, material );
        this.add(sphere)

		this.positionBullet(sentinelWorldDir, sentinelPos)

		setTimeout(() => {
			this.isDead = true
		}, 1000)
	}
	
	positionBullet(sentinelWorldDir: THREE.Vector3, sentinelPos: THREE.Vector3) {
		this.position.add(
			sentinelPos.clone()
		)

		this.setVelocity(
			sentinelWorldDir.x * this.speed,
			sentinelWorldDir.y * this.speed,
			sentinelWorldDir.z * this.speed
		)
	}

	get shouldRemove()
	{
		return this.isDead
	}

	setVelocity(x: number, y: number, z: number)
	{
		this.velocity.set(x, y, z)
	}

	update()
	{
		this.position.x += this.velocity.x
		this.position.y += this.velocity.y
		this.position.z += this.velocity.z
	}
}
