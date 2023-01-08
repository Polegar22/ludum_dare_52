import * as THREE from 'three'
import {PathfindingHelper} from 'three-pathfinding'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

import Pod from './Pod'
import Exit from './Exit'



const LEVEL_ID = "level1"
export default class Human extends THREE.Group{

    vel:THREE.Vector3=new THREE.Vector3();
    speed:number=.02;

    obstacles:THREE.Group[]=[]
    pathfinding:any

    navpath:any

    pathhelper?:any

    isInPod:boolean=true

    pod:Pod
    exit:Exit


    starttime:number

    stayinpod:number
    animationMixer?: THREE.AnimationMixer
    clock = new THREE.Clock();



    constructor(pod: Pod, exit:Exit,pathfinding:any, object:THREE.Group, anim:any, scene?:THREE.Scene){
        super();
        this.initModel(object, anim)

        this.pod=pod
        this.exit=exit
        this.starttime=Date.now()
        this.position.add(pod.position)

        this.stayinpod=(Math.random()*10+5)

        this.pathfinding=pathfinding;
        this.pathhelper=new PathfindingHelper()
        scene?.add(this.pathhelper)
        
       // this.findNewTarget()
      //  this.vel=this.vel.randomDirection();
      //  this.vel.y=0;
    }

    async initModel(object:THREE.Group, anim:any){
        this.animationMixer = new THREE.AnimationMixer( object );
        this.animationMixer.clipAction( anim.animations[ 0 ] ).play(); 
        super.add(object);
    }

    findNewTarget(){

        let groupID = this.pathfinding.getGroup(LEVEL_ID, this.position);
        // find closest node to agent, just in case agent is out of bounds
        const closest = this.pathfinding.getClosestNode(this.position, LEVEL_ID, groupID);
        const target=this.exit.position
       // target.y=0

        this.navpath=this.pathfinding.findPath(closest.centroid,target,LEVEL_ID,groupID)
        if(this.navpath && this.navpath.length>0){
            this.pathhelper.reset()
            this.pathhelper.setPlayerPosition(this.position);
            this.pathhelper.setTargetPosition(target);
            
            this.pathhelper.setPath(this.navpath);
        }

    }

    setCollisionObjects(obstacles:THREE.Group[]){
        this.obstacles=obstacles;
    }

    private checkCollOld(){
        let xcol=false
        let zcol=false
        this.obstacles.filter(o => o.position!=this.position).forEach(o => {
            let helperx=new THREE.BoxHelper(this);
            helperx.position.add(new THREE.Vector3(this.vel.x,0,0).multiplyScalar(this.speed))
            let boxx=new THREE.Box3().setFromObject(helperx)
            let helperz=new THREE.BoxHelper(this);
            helperz.position.add(new THREE.Vector3(0,0,this.vel.z).multiplyScalar(this.speed))
            let boxz=new THREE.Box3().setFromObject(helperz)
            
            let helperobj=new THREE.BoxHelper(o);
            helperobj.scale.multiplyScalar(.8)
            //(new THREE.Vector3(1.1))
            let boxobj=new THREE.Box3().setFromObject(helperobj)

            if(boxobj.intersectsBox(boxx))
                xcol=true;
            if(boxobj.intersectsBox(boxz))
                zcol=true;


            
        });

        if(xcol)
            this.vel.x*=-1
        if(zcol)
            this.vel.z*=-1
    }

    checkColl(){

    }

    returntoPod(){
        let groupID = this.pathfinding.getGroup(LEVEL_ID, this.position);
        // find closest node to agent, just in case agent is out of bounds
        const closest = this.pathfinding.getClosestNode(this.position, LEVEL_ID, groupID);
        const target=this.pod.position
        target.y=0

        

        this.navpath=this.pathfinding.findPath(closest.centroid,target,LEVEL_ID,groupID)
        if(this.navpath && this.navpath.length>0){
            this.pathhelper.reset()
            this.pathhelper.setPlayerPosition(this.position);
            this.pathhelper.setTargetPosition(target);
            
            this.pathhelper.setPath(this.navpath);
        }
    }


    update() {

        // if(this.position.distanceToSquared(this.pod.position)<.5 && !this.isInPod && !this.navpath){
        //     this.pod.isFull=true
        //     this.isInPod=true
        //     this.starttime=Date.now()
        //     return;
        // }

        if(this.isInPod){
            this.visible=false
            const currenttime=Date.now()
            if((currenttime-this.starttime)/1000>this.stayinpod){
                this.findNewTarget();
                this.pod.isFull=false
                this.isInPod=false
            }
            return
        }


        if ( !this.navpath || this.navpath.length <= 0 ){
            this.pod.isFull=true
            if(this.position.distanceToSquared(this.pod.position)<.5){
                this.isInPod=true

            }
            this.starttime=Date.now()
            return;
        } 

        this.visible=true

        let targetPosition = this.navpath[ 0 ];
        const distance:THREE.Vector3 = targetPosition.clone().sub( this.position );
        
        if (distance.lengthSq() > 0.5) {
            distance.normalize();
            this.lookAt(targetPosition)   

            
            this.position.add( distance.multiplyScalar(this.speed ) );
        
        } 
        else {
            this.navpath.shift();
        }


       
        if ( this.animationMixer )
            this.animationMixer.update(this.clock.getDelta() );

             

        //this.position.add(this.vel.clone().normalize().multiplyScalar(this.speed));
      
    }

}