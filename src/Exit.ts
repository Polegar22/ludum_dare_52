import * as THREE from "three"

export default class Exit extends THREE.Group{

    constructor(pos:THREE.Vector3){
        super()
        const geo=new THREE.BoxGeometry(1)
        const mat=new THREE.MeshPhysicalMaterial({
            color:'#00FF00'
        })
        this.add(new THREE.Mesh(geo,mat))
        this.position.add(pos)
    }

}