export default class Burl{
    constructor(oid, pt)
    {
        this._oid = oid
        this._pt = pt
        this._nodes = []
    }

    get origin()
    {
        return _oid
    }

    get pt ()
    {
        return _pt
    }

    get nodes()
    {
        return _nodes
    }

    addNode(n)
    {
        this._nodes.push(n)
    }

}