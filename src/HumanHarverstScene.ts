import * as THREE from 'three'
import Bullet from './Bullet'
import Sentinel from './Sentinel'
import Human from './Human'
import Pod from './Pod'
import Exit from './Exit'

import {  Vector3 } from 'three'

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

import {Pathfinding} from 'three-pathfinding'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';




export default class HumanHarverstScene extends THREE.Scene
{
	private readonly camera: THREE.PerspectiveCamera
	private sentinel!: Sentinel
	private humans:Human[]=[]
	private pods:Pod[]=[]
	private exits:Exit[]=[]
	private bullets: Bullet[] = []
	private readonly loader=new GLTFLoader()
	private level!: GLTF
	private navMesh:any
	private pathfinding:any

	private energy:number=300

	private isStarted:boolean=false

	gameUI = document.getElementById('gameUI')!

	constructor(camera: THREE.PerspectiveCamera)
	{
		super()
		this.camera = camera
	}

	async initialize()
	{
		this.level=await this.loader.loadAsync('assets/level.glb')
		this.add(this.level.scene)
		const lvlmat=new THREE.MeshPhysicalMaterial({
            color:new THREE.Color("#AAAAAA")
        });
		// this.level.scene.traverse(o=>{
		// 	if (o.isMesh){
		// 		 o.material = lvlmat;
		// 		 o.castShadow=true
		// 		 o.receiveShadow=true	
		// 	}	
		// })

		

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


		
		

		
		const fbxLoader =new FBXLoader()
		fbxLoader.load('assets/suitMan.fbx', (object) => {
			object.scale.multiplyScalar(0.007); 
			object.traverse((child:any) => {
				child.castShadow=true
				child.receiveShadow=true            
			});
			const animLoader =new FBXLoader()
			animLoader.load('assets/walking.fbx', (anim) => {
				this.initExitAndPods()
				for (let i=0;i<this.pods.length;i++){
					const human = new Human(this.pods[i],this.exits[i],this.pathfinding, SkeletonUtils.clone(object), anim, this)
					this.humans.push(human);
					this.add(human)
				}

				this.pods.forEach(p => {
					this.add(p)
				});
		
				this.exits.forEach(e => {
					this.add(e)
				});

				this.isStarted=true
			})
		})

		

		const light = new THREE.DirectionalLight(0xFFFFFF, 1)
	//	light.castShadow=true
		light.position.set(0, 4, 2)
		this.add(light)


		const hemilight = new THREE.HemisphereLight( 0xffffbb, 0x080820, .6 );
		this.add(hemilight );

		
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

	private initExitAndPods(){

		//ma version originale

		const levelBounds=new THREE.Box3().setFromObject(this.level.scene)
		console.log(levelBounds)
		let lvlwidth=levelBounds.max.x-levelBounds.min.x
		let lvlheight=levelBounds.max.z-levelBounds.min.z
		const delta=3
		const minx=levelBounds.min.x+delta
		const maxx=levelBounds.max.x-delta
		const minz=levelBounds.min.z+delta
		const maxz=levelBounds.max.z-delta
		let pod1=new Pod(new THREE.Vector3(minx,0,maxz))
		this.pods.push(pod1)
		let pod2=new Pod(new THREE.Vector3(maxx,0,maxz))
		this.pods.push(pod2)
		let pod3=new Pod(new THREE.Vector3(minx,0,minz))
		this.pods.push(pod3)
		let pod4=new Pod(new THREE.Vector3(maxx,0,minz))
		this.pods.push(pod4)

		let exit1=new Exit(new THREE.Vector3(minx+lvlwidth/2-delta,0,maxz))
		this.exits.push(exit1)
		let exit2=new Exit(new THREE.Vector3(minx+lvlwidth/2-delta,0,minz))
		this.exits.push(exit2)
		let exit3=new Exit(new THREE.Vector3(minx,maxz-lvlheight/2+delta))
		this.exits.push(exit3)
		let exit4=new Exit(new THREE.Vector3(maxx,0,maxz-lvlheight/2+delta))
		this.exits.push(exit4)


		
		

	}

	private checkExits(){
		this.humans.forEach(h => {
			if(h.position.distanceToSquared(h.exit.position)<.5){
				this.remove(h)
			}
		});
		this.humans=this.humans.filter(h=>h.position.distanceToSquared(h.exit.position)>.5)
	}

	private computeEnergy(){
		let nbinpod=this.humans.filter(h=>h.isInPod).length
		let nbout=this.humans.length-nbinpod
		this.energy+=.2*nbinpod-.1*nbout
		this.gameUI.innerText="Energy : "+this.energy

	}

	update()
	{
		
		this.computeEnergy()
		
		
		this.humans.forEach(h => {
			h.update()

		});
		if(this.sentinel){
			this.sentinel.updateInput()
		}
		this.updateBullets()
		this.checkExits()

		this.gameUI.innerText="Energy : "+this.energy

		
	}
	updateBullets()
	{
		this.bullets.forEach(bullet => {
			bullet.update()
			this.humans.forEach(human => {
				if (human.position.distanceToSquared(bullet.position) < 0.5)
				{
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
		return this.isStarted && (this.energy<0 || this.humans.length==0)
	}
}