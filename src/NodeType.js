import IpldType from "./IpldType"
import LinkType from "./LinkType"
import LinkWrapType from "./LinkWrapType"

export default class NodeType extends IpldType {
    constructor(obj, nodeCid = null) {
        if (!NodeType.isNode(obj))
            throw (new Error('Object is not a valid NodeType'))

        super(obj)

        this._origin = new LinkWrapType(obj.origin)
        this._relations = []
        this._targetCids = []
        this._nodeCid = nodeCid

        if (obj.relations) {
            for (let r of obj.relations) {
                this._addRelation(r)
            }
        }
    }

    get nodeCid() {
        //TODO: this should be mandatory or not be here
        return this._nodeCid
    }

    /*set nodeCid(nid) {
        //TODO: this shoul not  exist
        this._nodeCid = nid
    }*/


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

    addRelationFork(newTarget, newType) {
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

    toObj() {
        let oid = this.origin.link
        let targets = this.targetCids
        return NodeType.getNewObj(oid, targets)
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

    static clone(node) {
        let clone = new NodeType(node.toObj())
        clone._nodeCid = null
        return clone
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