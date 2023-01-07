import * as THREE from 'three'
import Bullet from './Bullet'
import Sentinel from './Sentinel'
import Human from './Human'
import {  Vector3 } from 'three'

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {Pathfinding} from 'three-pathfinding'




export default class HumanHarverstScene extends THREE.Scene
{
	private readonly camera: THREE.PerspectiveCamera
	private sentinel!: Sentinel
	private human:Human[]=[]
	private bullets: Bullet[] = []
	private readonly loader=new GLTFLoader()
	private level?: GLTF
	private navMesh?:any
	private pathfinding:any


	constructor(camera: THREE.PerspectiveCamera)
	{
		super()
		this.camera = camera
	}

	async initialize()
	{


		this.level=await this.loader.loadAsync('assets/level.glb')
		this.add(this.level.scene)

		this.pathfinding=new Pathfinding()

	//	let groupId;
	//	let navpath;
		let glbnavMesh=await this.loader.loadAsync('assets/navmesh.glb')
		glbnavMesh.scene.traverse(node =>{
			
			if(!this.navMesh && node.isObject3D && node.children && node.children.length>0)
				this.navMesh=node.children[0]
				this.pathfinding.setZoneData('level1',Pathfinding.createZone(this.navMesh.geometry))
		})
		//this.add(glbnavMesh.scene)



		
		this.camera.position.z = 1
		this.camera.position.y = 0.5
		this.sentinel = new Sentinel(this.camera)
		this.sentinel.setFireBulletHandler(() => {
			this.createBullet()
		})
		this.add(this.sentinel)

		


		for (let i=0;i<50;i++){
			this.human.push(new Human(new Vector3(THREE.MathUtils.randInt(-10,10),0,THREE.MathUtils.randInt(-10,10)),this.pathfinding,this));
		}

		this.human.forEach(h=>{
			h.setCollisionObjects(this.human)
		})
		this.sentinel = new Sentinel(this.camera)
		this.sentinel.setFireBulletHandler(() => {
			this.createBullet()
		})
		this.add(this.sentinel)


		const light = new THREE.DirectionalLight(0xFFFFFF, 1)
		light.position.set(0, 4, 2)

		this.add(light)
		
		this.human.forEach(h => {
			this.add(h)

		});

		
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
		this.human.forEach(h => {
			h.update()

		});
		if(this.sentinel)
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