export default {
    hasLink(node) {
        if (node['/'])
            return true
        return false
    },

    getLink(node) {
        return node['/']
    },

    hasRelationships(node) {
        if (node.relationships)
            return true
        return false
    },

    getRelationshipTarget(r) {
        if (r.destinationNode)
            return r.destinationNode
        else
            return null
    }
}

