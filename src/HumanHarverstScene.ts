import * as THREE from 'three'
import Bullet from './Bullet'
import Sentinel from './Sentinel'

export default class HumanHarverstScene extends THREE.Scene
{
	private readonly camera: THREE.PerspectiveCamera
	private sentinel!: Sentinel
	private bullets: Bullet[] = []


	constructor(camera: THREE.PerspectiveCamera)
	{
		super()
		this.camera = camera
	}

	async initialize()
	{
		this.camera.position.z = 1
		this.camera.position.y = 0.5
		this.sentinel = new Sentinel(this.camera)
		this.sentinel.setFireBulletHandler(() => {
			this.createBullet()
		})
		this.add(this.sentinel)


		const light = new THREE.DirectionalLight(0xFFFFFF, 1)
		light.position.set(0, 4, 2)

		this.add(light)
	}

	private createBullet()
	{
		if (!this.sentinel)
		{
			return
		}
		let sentinelWorldDir = this.camera.getWorldDirection(new THREE.Vector3())
		let bullet = new Bullet(sentinelWorldDir, this.sentinel.position.clone())
		this.bullets.push(bullet)
		this.add(bullet)
	}


	update()
	{
		this.sentinel.updateInput()
		this.bullets.forEach(bullet => {
			if (bullet.shouldRemove){
				this.remove(bullet)
			}
			else {
				bullet.update()
			}
		})
		this.bullets = this.bullets.filter(bullet => !bullet.shouldRemove)
	}
}