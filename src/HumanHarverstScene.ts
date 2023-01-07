import * as THREE from 'three'
import Sentinel from './Sentinel'

export default class HumanHarverstScene extends THREE.Scene
{
	private readonly camera: THREE.PerspectiveCamera
	private sentinel?: Sentinel
	private readonly keyDown = new Set<string>()
	private directionVector = new THREE.Vector3()


	constructor(camera: THREE.PerspectiveCamera)
	{
		super()
		this.camera = camera

	}

	async initialize()
	{
		
		this.sentinel = new Sentinel()
		await this.sentinel.initModel('assets/blasterG.mtl', 'assets/blasterG.obj')
		this.add(this.sentinel.model)

		this.sentinel.model.position.z = 3
		this.sentinel.model.add(this.camera)
		this.camera.position.z = 1
		this.camera.position.y = 0.5

		const light = new THREE.DirectionalLight(0xFFFFFF, 1)
		light.position.set(0, 4, 2)

		this.add(light)

		document.addEventListener('keydown', this.handleKeyDown)
		document.addEventListener('keyup', this.handleKeyUp)
	}

	private handleKeyDown = (event: KeyboardEvent) => {
		this.keyDown.add(event.key.toLowerCase())
	}

	private handleKeyUp = (event: KeyboardEvent) => {
		this.keyDown.delete(event.key.toLowerCase())
	}


	private updateInput()
	{
		if (!this.sentinel)
		{
			return
		}

		const shiftKey = this.keyDown.has('shift')

		if (!shiftKey)
		{
			if (this.keyDown.has('a') || this.keyDown.has('arrowleft'))
			{
				this.sentinel.model.rotateY(0.02)
			}
			else if (this.keyDown.has('d') || this.keyDown.has('arrowright'))
			{
				this.sentinel.model.rotateY(-0.02)
			}
		}

		this.camera.getWorldDirection(this.directionVector)

		const speed = 0.1

		if (this.keyDown.has('w') || this.keyDown.has('arrowup'))
		{
			this.sentinel.model.position.add(this.directionVector.clone().multiplyScalar(speed))
		}
		else if (this.keyDown.has('s') || this.keyDown.has('arrowdown'))
		{
			this.sentinel.model.position.add(this.directionVector.clone().multiplyScalar(-speed))
		}

		if (shiftKey)
		{
			const strafeDir = this.directionVector.clone()
			const upVector = new THREE.Vector3(0, 1, 0)

			if (this.keyDown.has('a') || this.keyDown.has('arrowleft'))
			{
				this.sentinel.model.position.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * 0.5)
						.multiplyScalar(speed)
				)
			}
			else if (this.keyDown.has('d') || this.keyDown.has('arrowright'))
			{
				this.sentinel.model.position.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * -0.5)
						.multiplyScalar(speed)
				)
			}
		}
	}

	

	update()
	{
		// update
		this.updateInput()
	}
}