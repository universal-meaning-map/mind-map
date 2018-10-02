import IpldType from "./IpldType";
import LinkType from "./LinkType";

export default class NodeType extends IpldType {
    constructor(obj) {
        if (!NodeType.isNode(obj))
            throw (new Error('Object is not a valid NodeType'))

        super(obj)

        this._origin = new LinkWrapType(obj.origin)
        this._relations = []

        if (obj.relations) {
            for (let r of obj.relations) {
                this._relations.push(new RelationType(r))
            }
        }
    }

    get origin() {
        return this._origin
    }

    get relations() {
        return this._relations
    }

    static isNode(obj, logError = true) {
        if (!obj) {
            if (logError)
                console.error('Node: !obj')
            return false
        }

        if (!obj.origin) {
            if (logError)
                console.error('Node: !obj.origin')
            return false
        }

        if (!LinkWrapType.isLinkWrap(obj.origin)) {
            if (logError)
                console.error('Node: !LinkWrapType.isLinkWrap(obj.origin)')
            return false
        }

        //it may not have relations but if they do they must be right
        if (obj.relations) {
            if (!Array.isArray(obj.relations)) {
                if (logError)
                    console.error('Node: !Array.isArray(obj.relations)')
                return false
            }

            for (let r of obj.relations) {
                if (!RelationType.isRelation(r)) {
                    if (logError)
                        console.error('!RelationType.isRelation(r)')
                    return false
                }
            }
        }

        return true
    }
}

class RelationType {
    constructor(obj) {
        if (!RelationType.isRelation(obj))
            throw (new Error('Object is not a valid RelationType'))

        this._target = new LinkWrapType(obj.target)

        if (obj.type)
            this._type = obj.type
    }

    get target() {
        return obj._target
    }

    get type() {
        return obj._type
    }

    static isRelation(obj) {
        if (!obj)
            return false

        if (!obj.target)
            return false

        if (!LinkWrapType.isLinkWrap(obj.target))
            return false

        return true
    }
}

class LinkWrapType {
    constructor(obj) {
        if (!LinkWrapType.isLinkWrap(obj))
            throw (new Error('Object is no LinkWrap Type'))

        this._wrap = new LinkType(obj.link)
    }

    get wrap() {
        return _wrap
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
}