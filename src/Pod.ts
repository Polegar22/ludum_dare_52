import * as THREE from 'three'
export default class Pod extends THREE.Group
{
    
    isFull:boolean=true
    timerMesh:THREE.Mesh
    timerDuration?:number
    timerStart?:number

    constructor(pos:THREE.Vector3){
        super()
        const geo=new THREE.SphereGeometry(1)
        
        const mat=new THREE.MeshPhysicalMaterial({
            color:'#FF0000'
        })
        this.add(new THREE.Mesh(geo,mat))
        this.position.add(pos)

        const cylinder=new THREE.CylinderGeometry(.2,.2,1)
        cylinder.translate(0,.5,0)
        this.timerMesh=new THREE.Mesh(cylinder,mat)
        this.add(this.timerMesh)
        

    }

    update(): void {
        if(this.timerStart && this.timerDuration){
            const scale=(Date.now()-this.timerStart)/(this.timerDuration)*(this.timerDuration/1000)+1
            this.timerMesh.scale.x=1
            this.timerMesh.scale.y=scale
            this.timerMesh.scale.z=1
        }
    }

    startTimer(stayinpod: number) {
        console.log("timer : "+stayinpod)
        this.timerDuration=stayinpod*1000
        this.timerStart=Date.now()
        

    }

    resetTimer(){
        this.timerDuration=undefined
        this.timerStart=undefined
       // this.timerMesh.geometry.scale(1,1,1)
    }
}