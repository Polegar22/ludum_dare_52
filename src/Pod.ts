import * as THREE from 'three'
export default class Pod extends THREE.Group
{
    isFull:boolean=true

    constructor(pos:THREE.Vector3){
        super()
        const geo=new THREE.SphereGeometry(1)
        const mat=new THREE.MeshPhysicalMaterial({
            color:'#FF0000'
        })
        this.add(new THREE.Mesh(geo,mat))
        this.position.add(pos)

    }
}