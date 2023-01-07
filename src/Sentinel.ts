import {Group} from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

export default class Sentinel
{
    public model!: Group
    private readonly mtlLoader = new MTLLoader()
	private readonly objLoader = new OBJLoader()

    constructor()
	{
	}

    async initModel(mtlPath: string, objPath: string){
        const mtl = await this.mtlLoader.loadAsync(mtlPath)
		mtl.preload()
        this.objLoader.setMaterials(mtl)

		const modelRoot = await this.objLoader.loadAsync(objPath)
        this.model = modelRoot
    }

}