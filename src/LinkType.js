const CID = require('cids')
const CIDTool = require('cid-tool')

export default class LinkType {
    
    constructor(obj) {
        if (!LinkType.isLink(obj))
            throw (new Error('Object is not a valid link', obj))

        this._link = CIDTool.format(obj['/'])
    }

    get link() {
        return this._link
    }

    static isLink(obj) {

        if (!obj)
            return false

        if (!obj['/'])
            return false

        try {
            new CID(obj['/'])
        }
        catch (err) {
            return false
        }

        return true
    }

    static getNewObj(cid)
    {
        const obj = {}
        obj['/'] = cid
        return obj
    }
}