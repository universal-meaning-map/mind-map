export default {
    hasLink (node) {
        return (node['/'] ? true : false)
    },

    getLink(node) {
        return node['/']
    }
}

