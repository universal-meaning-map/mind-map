import { Pt, Group, Circle, World, Particle, UI } from 'pts';
import PtsCanvas from "./PtsCanvas.jsx"
import NodeType from './NodeType'
import Shape from './Shape'
import Paint from './Paint'
import Burl from './Burl'
import Now from './Now'
import BurlSelection from './BurlSelection'
import OriginParents from './OriginParents'
import IpfsController from './IpfsController'

export default class IPLDReodeder extends PtsCanvas {

    constructor(props) {
        super(props);

        this.start.worldIsReady = false
        this.state.activeCids = {}
        this.world = null

        this.nodes = {}
        this.burls = {}//a global index of burls cid:{pt,nodes[nid1,nid2],contentPreview}
        this.parents = {}// index to keep track of each oid parents

        this.borningNode = new Pt(0, 0)

        this.selectedId = null
        this.selectedRelation = undefined
        this.selectedIdHistory = []
        this.paint = {}
        this.background = null

        document.onkeydown = this.checkKey.bind(this)
        this.onCanvasReady = this.onCanvasReady.bind(this)
        this.onBurlDown = this.onBurlDown.bind(this)
        this.onBurlUp = this.onBurlUp.bind(this)
        this.onBurlHover = this.onBurlHover.bind(this)
        this.onBurlLeave = this.onBurlLeave.bind(this)
        this.onBurlMove = this.onBurlMove.bind(this)

        this.ipfsController = new IpfsController()
        this.onIpfsReady = this.onIpfsReady.bind(this)
        this.ipfsController.on('ready', this.onIpfsReady)

        this._ptsToDraw = []
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.zoom)
            this.onZoomChange(nextProps.zoom)

        if (JSON.stringify(nextProps.cids) === JSON.stringify(this.props.cids))
            return

        if (!this.state.worldIsReady)
            return

        if (!this.ipfsController.isReady)
            return

        this.setCids(nextProps.cids)
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.ipfs && this.props.ipfs)
            this.ipfsController.init(this.props.ipfs)
    }

    onCanvasReady() {
        this.paint = new Paint(this.form)
    }

    onIpfsReady() {
        this.setCids(this.props.cids)
    }

    setCids(cids) {
        if (!this.state.worldIsReady)
            return

        if (!this.ipfsController.isReady)
            return


        for (let cid of cids) {

            if (!this.burls[cid])
                this.loadCID(cid)
        }
    }

    loadCID(cid) {

        //TODO: Check if is valid cid
        if (!cid)
            return

        if (cid in this.state.activeCids)
            return

        this.newBurl(cid)

        if (this.ipfsController.isDag(cid)) {
            this.ipfsController.loadDag(cid, (data) => {

                if (NodeType.isNode(data)) {
                    this.onCidLoaded(cid)
                    this.createNode(data, cid)
                }
                else {
                    this.createIPLD(data, cid)
                }
            })
        }

        else {
            console.log('Loading something else')
            this.loadFile(cid, (file) => {
                this.onCidLoaded(cid)
                this.burls[cid].file = file
            })
        }
    }

    onCidLoaded(cid) {
        this.addBurlToWorld(cid)
        this.setActiveCids(this.props.cids)
    }

    addBurlToWorld(cid) {
        let oid = cid
        if (cid in this.nodes)
            oid = this.nodes[cid].origin.link

        let particle = this.burls[oid].pt
        this.world.add(particle, oid)
    }

    createIPLD(data, cid) {

        this.ipfsController.loadFile(cid, (file) => {
            this.onCidLoaded(cid)
            this.burls[cid].file = file
        })
    }

    newBurl(oid) {
        //Remove node burls will try to be created again
        //TODO Should each node have its own pt reference?
        if (this.nodes[oid])
            return

        if (this.burls[oid])
            return

        let initPt = Shape.randomPt(this.space.center)

        if (this.props.borningNodeCid === oid)
            initPt = this.props.borningNodePt

        let pt = this.makeParticle(oid, initPt)

        let b = new Burl(oid, pt)
        this.burls[oid] = b

        b.setInteraction(this.onBurlDown, this.onBurlUp, this.onBurlHover, this.onBurlLeave, this.onBurlMove)

        let op = new OriginParents(oid)
        this.parents[oid] = op

        return b
    }

    makeParticle(oid, pt) {
        let particle = new Particle(pt).size(Now.nodeArm());
        return particle
    }

    createNode(data, nid) {
        if (this.nodes[nid])
            return

        let n = new NodeType(data, nid)
        this.nodes[nid] = n

        let oid = n.origin.link
        this.loadCID(oid)

        let targets = n.targetCids
        for (let tid of targets) {
            this.loadCID(tid)
            this.parents[tid].addParent(nid)
        }

        this.burls[oid].addNode(n)

        //previosly created burl before node was loaded
        this.removeBurl(nid)
    }

    removeBurl(oid) {
        //return
        if (Now.upSelection && Now.upSelection.burl.oid === oid)
            Now.upSelection = null
        if (Now.hoverSelection && Now.hoverSelection.burl.oid === oid)
            Now.hoverSelection = null
        if (Now.downSelection && Now.downSelection.burl.oid === oid)
            Now.downSelection = null

        try {
            this.world.removeParticle(oid)
        }
        catch (err) {
            console.error("Couldn't remove particle", oid)
        }

        delete this.burls[oid]

        /*
        console.log('Particle Index', this.getParticleIndex(oid))

        console.log('Nodes')
        this.toAll(this.nodes, (obj, cid) => { console.log('   ', cid) })

        console.log('Burls')
        this.toAll(this.burls, (a, id) => { console.log('   ', id) })

        console.log("Removed", oid)
        */
    }


    onBurlDown(pt, burl, times) {
        let burlSelection = this.getBurlSelection(pt, burl)
        if (times === 2) {
            Now.dragSelection = burlSelection
        }
        Now.hoverSelection = burlSelection
        Now.downSelection = burlSelection

        // console.log('down', this.burls, this.nodes, this.getActiveCids(), this.props.cids)
        //console.log('Active cids', this.getActiveCids())
    }

    onBurlUp(pt, burl) {
        let burlSelection = this.getBurlSelection(pt, burl)
        Now.hoverSelection = burlSelection
        Now.upSelection = burlSelection
        Now.dragSelection = null
        this.checkBorningRelation()
    }

    onBurlHover(pt, burl) {
        Now.hoverSelection = this.getBurlSelection(pt, burl)
    }

    onBurlLeave(pt, burl) {
        Now.hoverSelection = null
    }

    onBurlMove(pt, burl) {
        Now.hoverSelection = this.getBurlSelection(pt, burl)
    }

    getBurlSelection(pointer, burl) {

        let closest = this.getClosestNodeRelationToPointer(pointer, burl)
        let nearbyNode = closest.node
        let nodeDistance = closest.distance
        if (nodeDistance === null) {
            return new BurlSelection(burl, null)
        }
        else {
            let originDistance = pointer.$subtract(burl.pt).magnitude()
            if (originDistance <= nodeDistance) {
                return new BurlSelection(burl, null)
            }
            else {
                return new BurlSelection(burl, nearbyNode)
            }
        }
    }

    getClosestNodeRelationToPointer(pointer, burl) {
        let closestNode = null
        let closestDistance = null

        for (let n of burl.nodes) {
            for (let r of n.relations) {
                let opt = burl.pt
                let tpt = this.getTargetPt(r.target.link)
                let line = new Group(opt, tpt)
                let circle = Circle.fromCenter(burl.pt, Now.nodeRadius())
                let pts = Circle.intersectLine2D(circle, line)
                for (let pt of pts) {
                    let distance = pointer.$subtract(pt).magnitude()

                    if (closestDistance == null) {
                        closestDistance = distance
                        closestNode = n
                    }
                    else {
                        if (distance < closestDistance) {
                            closestDistance = distance
                            closestNode = n
                        }
                    }
                }
            }
        }
        return { node: closestNode, distance: closestDistance }
    }

    paintPt(pt) {
        this._ptsToDraw.push(pt)
    }

    onZoomChange(zoom) {
        Now.setZoom(zoom)
        this.toAll(this.burls, (b) => { b.pt.radius = Now.nodeArm() })
    }

    start(space, bound) {
        this.world = new World(this.space.innerBound, 0.01, new Pt(0, 0));
        this.setState({ worldIsReady: true })
        this.setCids(this.props.cids)
    }

    resize() {
        //this.create();
    }

    addForces(n) {

        for (let r of n.relations) {
            //the attraction force will be proporcional to its distance
            let oid = n.origin.link

            if (!this.burls[oid])
                return

            let tid = this.getTargetFinalOrigin(r.target.link)
            let opt = this.burls[oid].pt
            let tpt = this.burls[tid].pt
            //let tpt = this.getTargetPt(r.target.link)

            let forceAmount = 1
            let distance = opt.$subtract(tpt)
            //negative so it attracts
            let force = distance.$multiply(-1 * forceAmount)
            opt.addForce(force)
            //oposite force is added to the destination pt
            tpt.addForce(force.multiply(-1))
        }
    }

    getTargetPt(id) {
        if (this.burls[id])
            return this.burls[id].pt
        if (this.nodes[id])
            return this.getTargetPt(this.nodes[id].origin.link)
    }

    getTargetFinalOrigin(id) {
        if (this.burls[id])
            return id
        if (this.nodes[id])
            return this.getTargetFinalOrigin(this.nodes[id].origin.link)
    }

    paintNodeTree(n) {
        let opt = this.burls[n.origin.link].pt
        this.paint.bubbleOutline(opt, Now.nodeRadius(), '#f3f')

        for (let r of n.relations) {
            let tid = r.target.link
            let tpt = this.getTargetPt(tid)
            this.paint.arrow(opt, tpt, 0, 0, '#f3f')

            if (this.nodes[tid]) {
                this.paintNodeTree(this.nodes[tid])
            }
            else {
                this.paint.bubbleOutline(tpt, Now.originRadius(), '#f3f')
            }
        }
    }

    action(type, px, py) {
        Now.updateAction(type)
        this.toAll(this.burls, (burl, oid) => {
            UI.track([burl.btn], type, new Pt(px, py));
        })
    }

    animate(time, ftime) {
        let onlyActive = true
        this.moveDragBurl()
   
        if (this.props.autoLayout) {
            this.toAll(this.nodes, this.addForces.bind(this), onlyActive)
            this.world.update(ftime)
        }

        this.paintBorningNode()

        this.paintAll()
        this.paintFocusTree(Now.hoverSelection)
        this.paintBorningRelation()
        if (this.props.isDebug===true) {
            this.world.drawParticles((p, i) => { this.form.strokeOnly('#9993').point(p, p.radius, "circle") });
        }

        /*for (let pt of this._ptsToDraw)
            this.paint.bubble(pt, 10, '#f36')
        this._ptsToDraw = []*/
    }

    moveDragBurl() {
        if (Now.dragSelection)
            Now.dragSelection.burl.pt.to(this.space.pointer)
    }

    toAll(obj, fnc, onlyActive = false) {
        for (let cid in obj) {
            if (!obj.hasOwnProperty(cid))
                continue
            if (onlyActive)
                if (this.state.activeCids[cid] === false)
                    continue

            fnc(obj[cid], cid)
        }
    }

    checkBorningRelation() {
        if (!Now.downSelection || !Now.upSelection)
            return

        if (Now.downSelection.burl.oid === Now.upSelection.burl.oid)
            return

        //We assume only one relation per target and no type, for now
        if (Now.downSelection.node && Now.downSelection.node.hasTarget(Now.upSelection.burl.oid))
            return

        this.addRelation(Now.downSelection, Now.upSelection)
    }

    addRelation(originSelection, targetSelection) {

        this.getBurlSelectionId(targetSelection, (tid) => {
            if (originSelection.node) {
                this.addRelationToNode(originSelection.node, tid)
            }
            else {
                this.addRelationToContent(originSelection.burl.oid, tid)
            }
        })
    }

    addRelationToNode(node, tid, typeId) {
        let newNode = node.addRelationFork(tid, typeId)
        this.updateNode(node, newNode.toObj())
    }

    addRelationToContent(oid, tid, typeId) {
        let newNode = NodeType.getNewObj(oid, [tid])
        this.props.onNewNode(newNode)
    }

    getBurlSelectionId(burlSelection, callback) {
        //If there is no node, returns cid, otherwise gets node hash
        if (burlSelection.node)
            this.ipfsController.addIPLDObj(burlSelection.node.toObj(), callback)
        else
            callback(burlSelection.burl.oid)
    }

    //TODO These shouldn't be necessaries if we rely on activeNodes
    replaceBurlNode(burl, oldNode, newNode) {
        burl.removeNode(oldNode)
        burl.addNode(newNode)
    }

    //TODO These shouldn't be necessaries if we rely on activeNodes    
    /*replaceNode(oldNode, newNode) {
        delete this.nodes[oldNode.nodeCid]
        this.nodes[newNode.nodeCid] = newNode
    }*/

    updateNode(oldNode, newNodeObj) {

        //add the newNode
        this.ipfsController.addIPLDObj(newNodeObj, (newNid) => {
            let newNode = new NodeType(newNodeObj, newNid)
            this.props.onReplaceCid(oldNode.nodeCid, newNode.nodeCid)

            //siblings update
            let burl = this.burls[oldNode.origin.link]
            this.replaceBurlNode(burl, oldNode, newNode)

            //this.replaceNode(oldNode, newNode)

            //parents update
            let oldNodeParents = this.parents[oldNode.nodeCid].parents
            for (let oldParentNid of oldNodeParents) {
                let oldParent = this.nodes[oldParentNid]
                let oldParent2 = oldParent.removeRelationFork(oldNode.nodeCid)
                let newParent = oldParent2.addRelationFork(newNid)
                this.updateNode(oldParent, newParent.toObj())
            }
        })
    }


    bubbleUpUpdate(sonOldNid, sonNewNid) {
        this.props.onReplaceCid(sonOldNid, sonNewNid)

        let originParents = this.parents[sonOldNid]

        if (!originParents)
            throw (new Error('node with no origin parent object, this should not happen..', sonOldNid))

        for (let parentNid of originParents.parents) {
            let parentNode = this.nodes[parentNid]
            let removedTargetFork = parentNode.removeRelationFork(sonOldNid)
            let addedTargetFork = removedTargetFork.addRelationFork(sonNewNid)

            let newNode = addedTargetFork.toObj()
            this.ipfsController.addIPLDObj(newNode, (newNid) => {
                this.ipfsController.addIPLDObj(parentNode.toObj(), (oldNid) => {
                    let burl = this.burls[parentNode.oid]
                    this.replaceBurlNode(burl, parentNode, newNode)
                    this.bubbleUpUpdate(oldNid, newNid)
                })
            })
        }
    }

    //state changes >> update nodes 
    //animate >> update 
    setActiveCids(rootCids) {
        let prevActiveCids = this.state.activeCids
        this.toAll(prevActiveCids, (obj, cid) => { prevActiveCids[cid] = false })

        let allCids = prevActiveCids

        for (let cid of rootCids) {
            allCids = Object.assign(allCids, this.getLeaveCids(cid))
        }

        this.setState({ activeCids: allCids })
    }

    getLeaveCids(rootCid) {
        let cids = {}
        cids[rootCid] = true
        if (this.nodes[rootCid]) {
            let n = this.nodes[rootCid]
            cids[n.origin.link] = true
            this.toAll(n.relations, (r) => {
                let tid = r.target.link
                cids = Object.assign(cids, this.getLeaveCids(tid))
            })
        }
        return cids
    }

    paintBorningNode() {
        if (this.props.borningNodeText != null) {
            this.paint.bubble(this.props.borningNodePt, Now.originRadius(), '#ecd8')
            if (this.props.borningNodeText) {
                this.paint.text(this.props.borningNodeText, this.props.borningNodePt, Now.originRadius() * 2)
            }
            else {
                this.paint.text("what's in your mind?", this.props.borningNodePt, Now.originRadius() * 2, '#666')
            }
        }
    }

    paintBorningRelation() {
        if (!Now.isPressing)
            return

        if (!Now.downSelection)
            return

        let opt = Now.downSelection.burl.pt
        let tpt = this.space.pointer

        let targetRadius = 0

        if (Now.hoverSelection) {
            tpt = Now.hoverSelection.burl.pt
            targetRadius = Now.hoverSelection.id in this.nodes ? Now.nodeRadius() : Now.originRadius()
            //this.paint.bubbleOutline(opt, targetRadius, '#f36')
        }

        let originRadius = Now.downSelection.id in this.nodes ? Now.nodeRadius() : Now.originRadius()

        this.paint.bubbleOutline(opt, originRadius, '#f36')
        this.paint.arrow(opt, tpt, originRadius, targetRadius, '#f36')
    }

    selectNewId(newId) {
        if (!this.burls[newId].pt)
            return

        if (this.selectedIdHistory[this.selectedIdHistory.length - 1] !== newId) {
            this.selectedIdHistory.push(newId)
        }
        this.selectedId = newId
        this.selectedRelation = null
    }

    selectPreviousId() {
        if (this.selectedRelation) {
            this.selectedRelation = null
            return
        }
        if (this.selectedIdHistory.length <= 1)
            return
        this.selectedIdHistory.pop()
        this.selectedId = this.selectedIdHistory[this.selectedIdHistory.length - 1]
    }

    selectNextRelation(jumps) {
        let currentN = this._nodes[this.selectedId]
        if (!currentN)
            return

        let currentIndex = this.getRelationIndex(currentN, this.selectedRelation)
        if (currentIndex === undefined) {
            if (currentN.relationships)
                this.selectedRelation = currentN.relationships[0].destinationNode
            return
        }

        let nextIndex = (currentIndex + jumps) % currentN.relationships.length
        if (nextIndex < 0)
            nextIndex = currentN.relationships.length + nextIndex

        let relationship = currentN.relationships[nextIndex]
        if (relationship)
            this.selectedRelation = relationship.destinationNode
    }

    getRelationIndex(n, tid) {
        return n.relations.findIndex((r) => {
            return r.link === tid
        })
    }

    checkKey(e) {

        e = e || window.event;

        if (e.keyCode === '38') {//up arrow
            this.selectNewId(this.selectedRelation)
        }
        else if (e.keyCode === '40') {// down arrow
            this.selectPreviousId()
        }
        else if (e.keyCode === '37') {// left arrow
            this.selectNextRelation(-1)

        }
        else if (e.keyCode === '39') {// right arrow
            this.selectNextRelation(1)
        }
    }

    treeDown(cid, level = 1, onNode = () => { }, onContent = () => { }, onRelation = () => { }) {

        if (!cid)
            throw (new Error("No cid on tree down"))

        if (!this.nodes[cid]) {
            onContent(cid, level)
            return
        }

        let n = this.nodes[cid]

        for (let r of n.relations) {
            onRelation(n, r, level)
        }

        onNode(n, level)
        onContent(n.origin.link, level)

        level++
        for (let r of n.relations) {

            this.treeDown(r.target.link, level, onNode, onContent, onRelation)

        }

    }

    paintFocusTree(burlSelection) {
        let that = this
        function onNode(n, level) {
            let scaleFactor = 1
            let pt = that.burls[n.origin.link].pt
            that.paint.bubbleOutline(pt, Now.nodeRadius() * scaleFactor, '#f36')
        }

        function onRelation(n, r, level) {
            let scaleFactor = 1
            let opt = that.burls[n.origin.link].pt
            let tpt = that.getTargetPt(r.target.link)
            let targetIsNode = r.target.link in that.nodes
            let targetRadius = targetIsNode ? Now.nodeRadius() : Now.originRadius()
            that.paint.arrow(opt, tpt, Now.nodeRadius() * scaleFactor, targetRadius, '#f36')
        }

        function onContent(cid, level) {
            let b = that.burls[cid]
            let scaleFactor = 1
            if (b.hasPreview) {
                that.paint.bubbleOutline(b.pt, Now.originRadius() * scaleFactor, '#f36')
                that.paint.text(b.preview, b.pt, Now.originRadius() * 1.5 * scaleFactor, '#8B4B62')
            } else {
                that.paint.bubbleOutline(b.pt, Now.originRadius() * scaleFactor, '#f36')
                that.paint.text(b.oid, b.pt, Now.originRadius() * 1.5 * scaleFactor, '#BB6F6B88', false)
            }
        }

        if (burlSelection) {
            that.treeDown(burlSelection.id, 1, onNode, onContent, onRelation)
        }
    }

    paintAll() {
        let that = this
        function onNode(n, level) {
            let pt = that.burls[n.origin.link].pt
            that.paint.bubbleOutline(pt, Now.nodeRadius(), '#999')
        }

        function onRelation(n, r, level) {
            let opt = that.burls[n.origin.link].pt
            let tpt = that.getTargetPt(r.target.link)
            let targetIsNode = r.target.link in that.nodes
            let targetRadius = targetIsNode ? Now.nodeRadius() : Now.originRadius()
            that.paint.arrow(opt, tpt, Now.nodeRadius(), targetRadius, '#999')
        }

        function onContent(cid, level) {
            let b = that.burls[cid]

            if (!b) {
                console.warn('no burl for content', cid)
                return
                //throw(new Error("no burl for content", cid))
            }
            if (b.hasPreview) {
                that.paint.bubble(b.pt, Now.originRadius(), '#fff8')
                that.paint.bubbleOutline(b.pt, Now.originRadius(), '#999')
                that.paint.text(b.preview, b.pt, Now.originRadius() * 1.5, '#999')
            } else {
                that.paint.bubble(b.pt, Now.originRadius(), '#fff8')
                that.paint.bubbleOutline(b.pt, Now.originRadius(), '#999')
                that.paint.text(b.oid, b.pt, Now.originRadius() * 1.5, '#9999', false)
            }
        }

        this.bubbleDownFromCids(this.props.cids, onNode, onContent, onRelation)
    }

    bubbleDownFromCids(cids, onNode, onContent, onRelation) {
        for (let cid of cids)
            this.treeDown(cid, 1, onNode, onContent, onRelation)
    }

    getActiveCids() {
        let activeCids = []
        for (let cid in this.state.activeCids) {
            if (!this.state.activeCids.hasOwnProperty(cid))
                continue
            if (this.state.activeCids[cid] === true)
                activeCids.push(cid)

        }
        return activeCids
    }

}
