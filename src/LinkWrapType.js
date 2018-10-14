import LinkType from "./LinkType"

export default class LinkWrapType {

    constructor(obj) {
        if (!LinkWrapType.isLinkWrap(obj))
            throw (new Error('Object is no LinkWrap Type'))

        this._wrap = new LinkType(obj.link)
    }

    get link() {
        return this._wrap.link
    }

    get wrap() {
        return this._wrap
    }

    static isLinkWrap(obj, logError = true) {
        if (!obj) {
            if (logError)
                console.error('LinkWrapType: !obj', obj)

            return false
        }

        if (!obj.link) {
            if (logError)
                console.error('LinkWrapType: !obj.link', obj)

            return false
        }

        if (!LinkType.isLink(obj.link)) {
            if (logError)
                console.error('LinkWrapType: !LinkType.isLink(obj.link)', obj)
            return false
        }

        return true
    }

    static getNewObj(link) {
        const obj = {}
        obj.link = LinkType.getNewObj(link)
        return obj
    }

}