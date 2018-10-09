import IpldType from "./IpldType";
import LinkType from "./LinkType";

export default class NodeType extends IpldType {
    constructor(obj) {
        if (!NodeType.isNode(obj))
            throw (new Error('Object is not a valid NodeType'))

        super(obj)

        this._origin = new LinkWrapType(obj.origin)
        this._relations = []
        this._targetCids = []

        if (obj.relations) {
            for (let r of obj.relations) {
                this._addRelation(r)
            }
        }
    }

    _addRelation(r) {
        let relation = new RelationType(r)
        this._relations.push(relation)
        this._targetCids.push(relation.target.link)
    }

    get origin() {
        return this._origin
    }

    get relations() {
        return this._relations
    }

    get targetCids() {
        return this._targetCids
    }

    hasTarget(tid) {
        return this._targetCids.indexOf(tid) !== -1
    }

    newOriginFork(newOrigin) {
        let newNode = NodeType.clone(this)

        newNode._origin = new LinkWrapType(LinkWrapType.getNewObj(newOrigin))
        return newNode
    }

    newRelationFork(newTarget, newType) {
        let newNode = NodeType.clone(this)
        let relationObj = RelationType.getNewObj(newTarget, newType)
        newNode._addRelation(relationObj)
        return newNode
    }

    removeRelationFork(oldTarget, oldType = null) {
        let newNode = NodeType.clone(this)
        for (let i = 0; i <= newNode._relations.length; i++) {
            let r = newNode._relations[i]
            if (r.target.link == oldTarget) {
                if (r.type) {

                    if (r.type.link == oldTarget) {
                        newNode._relations.splice(i, 1)
                        newNode._targetCids.splice(i, 1)
                        return newNode
                    }
                }
                else {
                    newNode._relations.splice(i, 1)
                    newNode._targetCids.splice(i, 1)
                    return newNode
                }
            }
        }
        console.warn('No match for removeRelationFork', oldTarget, oldType, this)
        return newNode
    }

    getObjCid(callback) {

        DAGCBOR.util.cid(this.toObj(), (err, result) => {
            let cid = result.toBaseEncodedString()
            callback(cid)
        })

    }

    static isNode(obj, logError = false) {
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

    //Brand new object from oid and target
    static getNewObj(oid, targets) {
        const obj = {}
        obj.origin = LinkWrapType.getNewObj(oid)
        obj.relations = []
        for (let tid of targets) {
            let r = RelationType.getNewObj(tid)
            obj.relations.push(r)
        }
        return obj
    }

    //Object from existing node
    static toObj(node) {
        let oid = node.origin.link
        let targets = node.targetCids
        return NodeType.getNewObj(oid, targets)
    }

    static clone(node) {
        return new NodeType(NodeType.toObj(node))
    }

}

class RelationType {
    constructor(obj) {
        if (!RelationType.isRelation(obj))
            throw (new Error('Object is not a valid RelationType'))

        this._target = new LinkWrapType(obj.target)

        if (obj.type)
            this._type = obj.type
        else
            this._type = null
    }

    get target() {
        return this._target
    }

    get type() {
        return this._type
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

    static getNewObj(tid, typeId) {
        const obj = {}
        obj.target = LinkWrapType.getNewObj(tid)
        if (typeId)
            obj.type = LinkWrapType.getNewObj(typeId)
        return obj
    }
}

class LinkWrapType {
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