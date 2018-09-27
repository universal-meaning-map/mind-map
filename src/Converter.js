let x = {}

//Given any IPLD object, convert it into a render object
/*x.dagToRender = (dagObj) => {
    for (let o in dagObj) {
        if (dagObj.hasOwnProperty(o)) {

        }
    }
}*/

//converts a single dagObj node into a renderObj
x.mindmapToRender = (dagObj) => {
    let n = Object.assign({}, dagObj)
    n.cid = x.getCID(dagObj)
    return n
}

x.renderNodeFromCID = (cid) => {
    return {
        cid: cid
    }
}

x.getRelationshipsCID = (dagObj) => {
    if (!dagObj.relationships)
        return []

    let cids = []
    for (let r of dagObj.relationships) {
        if (r.destinationNode) {
            cids.push(r.destinationNode)
        }
    }
    return cids
}

x.getCID = (dagObj) => {
    //for now we just assume that whatever is inisde / is the CID
    let cid = 'none'
    if (dagObj['/'])
        cid = dagObj['/']
    return cid
}

x.dagsToRender = (dags) => {
    if (!Array.isArray(dags))
        throw new Error("dags is not an array")

    let renderObj = []
    let missingCIDs = []

    for (let d of dags) {
        let r = x.mindmapToRender(d)
        if (renderObj[r.cid]) {
            renderObj[r.cid] = Object.assign(renderObj[r.cid], r)
        }
        else {
            renderObj[r.cid] = r
        }

        missingCIDs = missingCIDs.concat(x.getRelationshipsCID(d))
    }

    for (let cid of missingCIDs) {
        if (!renderObj[cid]) {
            renderObj[cid] = x.renderNodeFromCID(cid)
        }
    }
    return renderObj
}


export default x