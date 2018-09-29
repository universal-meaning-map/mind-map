export default {
    hasLink(node) {
        return (node['/'] ? true : false)
    },

    getLink(node) {
        return node['/']
    },

    hasRelationships(node) {
        return (node.relationships ? true : false)
    },

    getRelationshipTarget(r)
    {
        if(r.destinationNode)
            return r.destinationNode
        else 
            return null
    }
}

