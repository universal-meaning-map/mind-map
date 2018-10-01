import IpldType from "./IpldType";
import LinkType from "./LinkType";

export default class NodeType extends IpldType {
    constructor(obj) {
        console.log('nooode',obj)
        if (!NodeType.isNode(obj))
            throw (new Error('Object is not a valid NodeType'))
        
            super(obj)
            
            this._origin = new LinkType(obj.origin)
            this._relations = []
            
        if(Array.isArray(obj.relations)
        
        for (let r of obj.relations) {
            console.log(r)
            _relations.push(new RelationType(r))
        }
        
    }

    get origin() {
        return this._origin.link
    }

    get relations() {
        return this._relations
    }

    static isNode(obj) {
        if(!obj)
            return false

        if (!obj.origin)
            return false

        if (!LinkType.isLink(obj.origin))
            return false

        //it may not have relations but if they do they must be right
        if (obj.relations) {
            if (!Array.isArray(obj.relations))
                return false

            for (let r of obj.relations) {
                if (!RelationType.isRelation(r))
                    return false
            }
        }

        return true
    }

}

class RelationType {
    constructor(obj) {
        if (!RelationType.isRelation(obj))
            throw (new Error('Object is not a valid RelationType'))

        this._target = obj.target

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
        if(!obj)
            return false

        if (!obj.target)
            return false

        if (!LinkType.isLink(obj.target))
            return false

        return true
    }
}