const OTYPE = {
    UNDEFINED : 'undefined',
    TEXT : 'text',
    IMAGE : 'image'
}


export default class Burl{

    constructor(oid, pt)
    {
        this._oid = oid
        this._pt = pt
        this._nodes = []
        this._fileExtension = OTYPE.UNDEFINED
        this._file = null
    }

    get oid()
    {
        return this._oid
    }

    get pt ()
    {
        return this._pt
    }

    get nodes()
    {
        return this._nodes
    }

    addNode(n)
    {
        this._nodes.push(n)
    }

    set file(file)
    {
        this._file = file
    }

    get file()
    {
        return this._file
    }

    get preview()
    {
        return this._file.toString('utf-8')
    }

    get hasPreview()
    {
        if(this._file)
            return true
        return false
    }



}

