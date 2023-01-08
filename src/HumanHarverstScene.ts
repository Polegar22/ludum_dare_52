import * as THREE from 'three'
import Bullet from './Bullet'
import Sentinel from './Sentinel'
import Human from './Human'
import Pod from './Pod'
import {  Vector3 } from 'three'

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {Pathfinding} from 'three-pathfinding'




export default class HumanHarverstScene extends THREE.Scene
{
	private readonly camera: THREE.PerspectiveCamera
	private sentinel!: Sentinel
	private humans:Human[]=[]
	private pods:Pod[]=[]
	private bullets: Bullet[] = []
	private readonly loader=new GLTFLoader()
	private level!: GLTF
	private navMesh:any
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
		this.sentinel = new Sentinel(this.camera, this.level.scenes)
		this.sentinel.setFireBulletHandler(() => {
			this.createBullet()
		})
		this.add(this.sentinel)

		let startpos=-10
		for (let i=0;i<10;i++){
			const pod=new Pod(new THREE.Vector3(startpos,0,-12))
			startpos+=2
			this.pods.push(pod)
			this.add(pod)
			//this.humans.push(new Human(new Vector3(THREE.MathUtils.randInt(-10,10),0,THREE.MathUtils.randInt(-10,10)),this.pathfinding,this));
			this.humans.push(new Human(pod,this.pathfinding,this));
		}

		this.humans.forEach(h=>{
			h.setCollisionObjects(this.humans)
		})

		const light = new THREE.DirectionalLight(0xFFFFFF, 1)
		light.position.set(0, 4, 2)

		this.add(light)
		
		this.humans.forEach(h => {
			this.add(h)
		});
	}

	private createBullet()
	{
		if (!this.sentinel)
		{
			return
		}
		let sentinelDirVect = this.sentinel.getWorldDirection(new THREE.Vector3()).negate()
		let bullet = new Bullet(sentinelDirVect, this.sentinel.position.clone(), this.level.scenes)
		this.bullets.push(bullet)
		this.add(bullet)
	}


	update()
	{
		this.humans.forEach(h => {
			h.update()

		});
		if(this.sentinel){
			this.sentinel.updateInput()
		}
		this.updateBullets()
		
	}
	updateBullets()
	{
		this.bullets.forEach(bullet => {
			bullet.update()
			this.humans.forEach(human => {
				if (human.position.distanceToSquared(bullet.position) < 0.5)
				{
					console.log("Touch")
					this.remove(bullet)
					bullet.shouldDisapear = true
					human.returntoPod()
				}
			})
			if (bullet.shouldDisapear){
				this.remove(bullet)
			}
		})
		this.bullets = this.bullets.filter(bullet => !bullet.shouldDisapear)

	}
	isGameOver(){
		return false
	}
}