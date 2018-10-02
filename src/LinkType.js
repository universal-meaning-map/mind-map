const CID = require('cids')
const CIDTool = require('cid-tool')

export default class LinkType {
    constructor(obj) {
        if (!LinkType.isLink(obj))
            throw (new Error('Object is not a valid link', obj))

        this._link = CIDTool.format(obj['/'])
    }

    get link() {
        return _link
    }

    static isLink(obj) {
        if (!obj)
            return false

        if (!obj['/'])
            return false

        try {
            let cid = new CID(obj['/'])
        }
        catch (err) {
            return false
        }

        return true
    }
}