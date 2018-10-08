export default class OriginParents{
    constructor(oid)
    {
        this._oid = oid
        this._parents = []// they are always nodes
    }

    get oid (){
        return this._oid
    }

    get parents (){
        return this._parents
    }

    addParent(n)
    {
        this._parents.push(n)
    }
}