import * as THREE from 'three'
export default class Sentinel extends THREE.Group
{
    private readonly camera: THREE.PerspectiveCamera
    private readonly keyDown = new Set<string>()
    private fireBulletHandler!: Function


    constructor(camera: THREE.PerspectiveCamera)
	{
        super()
        this.camera = camera
        const geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.3 );
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        const cube = new THREE.Mesh( geometry, material );
        this.add(cube)
        this.add(camera)
		document.addEventListener('keydown', this.handleKeyDown)
		document.addEventListener('keyup', this.handleKeyUp)
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

		let directionVector = this.camera.getWorldDirection(new THREE.Vector3())

		const speed = 0.1

		if (this.keyDown.has('w') || this.keyDown.has('arrowup'))
		{
			this.position.add(directionVector.clone().multiplyScalar(speed))
		}
		else if (this.keyDown.has('s') || this.keyDown.has('arrowdown'))
		{
			this.position.add(directionVector.clone().multiplyScalar(-speed))
		}

		if (shiftKey)
		{
			const strafeDir = directionVector.clone()
			const upVector = new THREE.Vector3(0, 1, 0)

			if (this.keyDown.has('a') || this.keyDown.has('arrowleft'))
			{
				this.position.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * 0.5)
						.multiplyScalar(speed)
				)
			}
			else if (this.keyDown.has('d') || this.keyDown.has('arrowright'))
			{
				this.position.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * -0.5)
						.multiplyScalar(speed)
				)
			}
		}
	}

}