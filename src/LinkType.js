export default class LinkType {
    constructor(obj) {
        if (!LinkType.isLink(obj))
            throw (new Error('Object is not a valid link', obj))
        this._link = obj
    }

    get link () {
        return obj['/']
    }

    static isLink(obj) {
        if(!obj)
            return false
            
        if (!obj['/'])
            return false
        //Anything in the link is valid for now...
        return true
    }
}