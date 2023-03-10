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
    isReturningToPod:boolean=false


    pod:Pod
    exit:Exit[]


    starttime:number

    stayinpod:number
    animationMixer!: THREE.AnimationMixer
    clock = new THREE.Clock();
    
    animationActions !: {type : string, action : THREE.AnimationAction}[]

    nextexit!:Exit


    constructor(pod: Pod, exit:Exit[],pathfinding:any, object:THREE.Group, animClips:{type : string, clip : THREE.AnimationClip}[], scene?:THREE.Scene){
        super();
        this.animationActions = []
        this.initModel(object, animClips)
        this.pod=pod
        this.exit=exit
        this.starttime=Date.now()
        this.position.add(pod.position)

        this.stayinpod=(Math.random()*10+5)

        this.pathfinding=pathfinding;
        this.pathhelper=new PathfindingHelper()
        scene?.add(this.pathhelper)
        this.pod.startTimer(this.stayinpod)
       // this.findNewTarget()
      //  this.vel=this.vel.randomDirection();
      //  this.vel.y=0;
    }

    async initModel(object:THREE.Group, animClips:{type : string, clip : THREE.AnimationClip}[]){
        this.animationMixer = new THREE.AnimationMixer( object );
        animClips.forEach(animClip => {
            const action = this.animationMixer.clipAction( animClip.clip )
            this.animationActions.push({
                'type' : animClip.type,
                'action' : action
            })
            // if(animClip.type == "walking"){
            //     action.play()
            // }
        })
        super.add(object);
    }

    findNewTarget(){

        let groupID = this.pathfinding.getGroup(LEVEL_ID, this.position);
        // find closest node to agent, just in case agent is out of bounds
        const closest = this.pathfinding.getClosestNode(this.position, LEVEL_ID, groupID);
        this.nextexit=this.exit[Math.round(Math.random()*(this.exit.length-1))]
        const target=this.pathfinding.getClosestNode(this.nextexit.position, LEVEL_ID, groupID);
       // target.y=0

        this.navpath=this.pathfinding.findPath(closest.centroid,target.centroid,LEVEL_ID,groupID)
        if(this.navpath && this.navpath.length>0){
            this.pathhelper.reset()
            this.pathhelper.setPlayerPosition(this.position);
            this.pathhelper.setTargetPosition(target);
            
            this.pathhelper.setPath(this.navpath);
        }
        else{
            console.log("NO PATH!!")
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
        this.isReturningToPod = true
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

        this.updateAnimations()

        if(this.isInPod){            
            const currenttime=Date.now()
            if((currenttime-this.starttime)/1000>this.stayinpod){
                this.findNewTarget()
                this.pod.isFull=false
                this.isInPod=false
                this.visible=true
                this.pod.resetTimer()
            }
            return
        }

        if(this.position.distanceToSquared(this.pod.position)<.5 && this.isReturningToPod){
            this.pod.isFull=true
            this.isInPod=true
            this.isReturningToPod = false
            this.visible=false
            this.navpath=[]
            this.starttime=Date.now()
            this.pod.startTimer(this.stayinpod)
            return;
        }


        if(this.navpath==null || this.navpath.length==0)
            this.findNewTarget();


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
    }

    private updateAnimations(){
        if ( this.animationMixer )
            if(this.isInPod){
                this.animationActions.find(animation => animation.type == 'idle')?.action.play()
                this.animationActions.filter(animation => animation.type != 'idle').map(animation => animation.action.stop())
            }
            else if(this.isReturningToPod){
                this.animationActions.find(animation => animation.type == 'sadWalk')?.action.play()
                this.animationActions.filter(animation => animation.type != 'sadWalk').map(animation => animation.action.stop())
            }
            else{
                this.animationActions.find(animation => animation.type == 'walk')?.action.play()
                this.animationActions.filter(animation => animation.type != 'walk').map(animation => animation.action.stop())
            }
            this.animationMixer.update(this.clock.getDelta() );

    }

}