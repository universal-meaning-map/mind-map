import { Pt, Group, Circle, Rectangle, Util, World, Particle, UIButton, UI } from 'pts';
import PtsCanvas from "./PtsCanvas.jsx"
import Converter from "./Converter.js"
import React, { Component } from 'react'
import NodeType from './NodeType'
import Shape from './Shape'
import Paint from './Paint'
import Burl from './Burl'
import Now from './Now'
import BurlSelection from './BurlSelection'
import OriginParents from './OriginParents'
import CID from 'cids'

export default class IPLDReodeder extends PtsCanvas {

    constructor(props) {
        super(props);

        this.state.ipfsIsReady = false
        this.start.worldIsReady = false
        this.state.activeCids = {}
        this.world = null
        this.nodes = {}
        this.pts = {}
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

        this.setIpfs()

        this._ptsToDraw = []
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.zoom)
            this.onZoomChange(nextProps.zoom)

        if (JSON.stringify(nextProps.cids) === JSON.stringify(this.props.cids))
            return

        if (!this.state.worldIsReady)
            return

        if (!this.state.ipfsIsReady)
            return

        this.setCids(nextProps.cids)
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.ipfs && this.props.ipfs)
            this.setIpfs()

        this.checkPause()
    }

    onCanvasReady() {
        this.paint = new Paint(this.form)
    }

    isJsIpfs(ipfsId) {
        if (ipfsId.agentVersion.indexOf('js') !== -1)
            return true
        return false
    }

    setIpfs() {
        console.log('Setting Ipfs')

        if (!this.props.ipfs) {
            console.warn('No ipfs yet...')
            return
        }

        let that = this
        this.props.ipfs.id().then((id) => {
            console.log('Peer id', id)

            if (this.isJsIpfs(id)) {
                console.log("isJS")

                if (this.props.ipfs.isOnline()) {
                    this.onIpfsReady()
                }
                else {
                    console.log('isOffline')
                    this.props.ipfs.on('start', () => {
                        console.log('Was offline')
                        this.onIpfsReady()
                    })
                }
            }
            else {
                console.log("isGo")
                this.onIpfsReady()
            }
        })
    }

    onIpfsReady() {
        this.setState({ ipfsIsReady: true })
        this.setCids(this.props.cids)
    }

    setCids(cids) {
        if (!this.state.worldIsReady)
            return

        if (!this.state.ipfsIsReady)
            return


        for (let cid of cids) {

            if (!this.pts[cid])
                this.loadCID(cid)
        }
    }

    loadCID(cid) {

        //Check if is valid cid
        if (!cid)
            return
        //We display the cid right away, will replace it later once its content is loaded

        if (this.state.activeCids[cid])
            return

        this.newBurl(cid)

        if (this.isDag(cid)) {
            this.loadDag(cid)
        }

        else {
            console.log('Loading something else')
            loadFile(cid)
        }
    }

    onCidLoaded(cid) {
        //console.log('On cid loaded', cid)
        this.bubbleDown(this.props.cids)
    }

    getCodec(cidStr) {
        let cidObj = new CID(cidStr)
        return cidObj.codec
    }

    isDag(cid) {
        let codec = this.getCodec(cid)

        if (codec === 'dag-cbor' || codec === 'dag-pb')
            return true
        return false
    }

    loadDag(cid) {
        this.props.ipfs.dag.get(cid, (error, result) => {
            if (error) {
                console.warn("props.ipfs.dag.get", cid, error)
                return
            }

            let data = result.value

            if (NodeType.isNode(data)) {
                this.createNode(data, cid)
                this.onCidLoaded(cid)
            }
            else {
                this.createIPLD(data, cid)
            }
        })
    }

    createIPLD(data, cid) {
        //console.log("Note implemented", cid, data)
        this.loadFile(cid)
    }

    loadFile(cid, onFail) {
        this.props.ipfs.files.cat(cid, (error, file) => {

            if (error) {
                console.warn("ipfs.files.cat...", cid, error)
                //onFail()
                return
            }
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

        if (this.pts[oid])
            return

        let pt = this.addNewPtParticle(oid)

        this.pts[oid] = pt

        let b = new Burl(oid, pt)
        this.burls[oid] = b

        let btn = b.setInteraction(this.onBurlDown, this.onBurlUp, this.onBurlHover, this.onBurlLeave, this.onBurlMove)

        let op = new OriginParents(oid)
        this.parents[oid] = op

        return b
    }

    addNewPtParticle(oid) {
        let initPt = Shape.randomPt(this.space.center)
        let particle = new Particle(initPt).size(Now.originRadius() + Now.nodeArm());
        particle.id = oid // this is so we can retreive it later on
        this.world.add(particle, oid)
        return particle
    }

    createNode(data, nid) {
        if (this.nodes[nid])
            return


        let n = new NodeType(data)
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

        this.getParticleIndex()

        delete this.burls[oid]
        this.world.remove('particle', this.getParticleIndex(oid))
        delete this.pts[oid]

        /*
        console.log('Particle Index', this.getParticleIndex(oid))

        console.log('Nodes')
        this.toAll(this.nodes, (obj, cid) => { console.log('   ', cid) })

        console.log('Burls')
        this.toAll(this.burls, (a, id) => { console.log('   ', id) })

        console.log('Pts')
        this.toAll(this.pts, (a, id) => { console.log('   ', id) })

        console.log("Removed", oid)
        */
    }

    getParticleIndex(pid) {
        for (let i = 0; i < this.world.particleCount; i++) {
            if (this.world.particle(i).id === pid) {
                return i
            }
        }
        return -1
    }

    onBurlDown(pt, burl) {
        Now.hoverSelection = this.getBurlSelection(pt, burl)
        Now.downSelection = Now.hoverSelection
    }

    onBurlUp(pt, burl) {
        Now.hoverSelection = this.getBurlSelection(pt, burl)
        Now.upSelection = Now.hoverSelection
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
        this.toAll(this.pts, (pt) => { pt.radius = Now.nodeArm() })
    }

    checkPause() {
        if (this.props.pause) {
            this.space.pause();

        } else {
            this.space.resume();
        }
    }

    start(space, bound) {
        this.world = new World(this.space.innerBound, 0.7, new Pt(0, 0));
        this.setState({ worldIsReady: true })
        this.setCids(this.props.cids)
    }

    resize() {
        //this.create();
    }


    addForces(n) {

        for (let r of n.relations) {
            //targetPt
            let tpt = this.getTargetPt(r.target.link)
            //the attraction force will be proporcional to its distance
            let oid = n.origin.link
            if (!this.pts[oid])
                return

            let opt = this.pts[oid]

            let forceAmount = 2
            let distance = opt.$subtract(tpt)
            //negative so it attracts
            let force = distance.$multiply(-1 * forceAmount)
            opt.addForce(force)
            //oposite force is added to the destination pt
            tpt.addForce(force.multiply(-1))
        }
    }

    getTargetPt(id) {
        if (this.pts[id])
            return this.pts[id]
        if (this.nodes[id])
            return this.getTargetPt(this.nodes[id].origin.link)
    }

    drawRelations(n) {
        let lineColor = "#999"
        for (let r of n.relations) {
            let opt = this.pts[n.origin.link]
            let tpt = this.getTargetPt(r.target.link)
            this.paint.arrow(opt, tpt, Now.originRadius(), lineColor)
        }
    }

    drawBurl(b) {
        //node bubble
        if (b.nodes.length) {
            this.paint.bubble(b.pt, Now.nodeRadius(), '#EA967455')
        }
        //preview bubble
        if (b.hasPreview) {
            this.paint.bubble(b.pt, Now.originRadius(), '#FCBC8055')
            this.paint.text(b.preview, b.pt, Now.originRadius() * 1.5, '#8B4B62')
        }
        //cid bubble
        else {
            this.paint.bubble(b.pt, Now.originRadius(), '#F7E29C55')
            this.paint.text(b.oid, b.pt, Now.originRadius() * 1.5, '#BB6F6B88', false)
        }
    }

    paintHighlights() {
        if (Now.downSelection) {
            if (Now.downSelection.node) {
                this.paint.bubbleOutline(Now.downSelection.burl.pt, Now.nodeRadius(), '#f36')
                //this.paintNodeTree(Now.downSelection.node)
            }
            else {
                this.paint.bubbleOutline(Now.downSelection.burl.pt, Now.originRadius(), '#f36')

            }
        }

        if (Now.hoverSelection) {
            if (Now.hoverSelection.node) {
                this.paintNodeTree(Now.hoverSelection.node)
                //this.paint.bubbleOutline(Now.hoverSelection.burl.pt, Now.nodeRadius(), '#f365')
            }
            else {
                this.paint.bubbleOutline(Now.hoverSelection.burl.pt, Now.originRadius(), '#f365')

            }
        }
    }

    paintNodeTree(n) {
        let opt = this.pts[n.origin.link]
        this.paint.bubbleOutline(opt, Now.nodeRadius(), '#f3f')

        for (let r of n.relations) {
            let tid = r.target.link
            let tpt = this.getTargetPt(tid)
            this.paint.arrow(opt, tpt, 0, '#f3f')

            if (this.nodes[tid]) {
                this.paintNodeTree(this.nodes[tid])
            }
            else {
                this.paint.bubbleOutline(tpt, Now.originRadius(), '#f3f')
            }
        }
    }

    animate(time, ftime) {
        let onlyActive = true
        this.world.update(ftime)
        this.toAll(this.nodes, this.addForces.bind(this), onlyActive)
        this.toAll(this.nodes, this.drawRelations.bind(this), onlyActive)
        this.toAll(this.burls, this.drawBurl.bind(this), onlyActive)
        this.paintBorningNode()
        this.paintBorningRelation()
        this.paintHighlights()

        this.world.drawParticles((p, i) => { this.form.fillOnly('#00f5').point(p, 10, "circle") });

        for (let pt of this._ptsToDraw)
            this.paint.bubble(pt, 10, '#f36')
        this._ptsToDraw = []
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

        let that = this

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
        this.updateNode(node, newNode)
    }

    addRelationToContent(oid, tid, typeId) {
        let oldId = oid
        let newNode = NodeType.getNewObj(oid, [tid])
        this.props.onNewNode(newNode)
    }

    getBurlSelectionId(burlSelection, callback) {
        //If there is no node, returns cid, otherwise gets node hash
        if (burlSelection.node)
            burlSelection.node.getObjCid(callback)
        else
            callback(burlSelection.burl.oid)
    }

    updateNode(newNode, oldNode) {

        this.addIPLDObj(newNode, (newNid) => {
            oldNode.getObjCid((oldNid) => {
                console.log('update', newNid, oldNid, newNode, oldNode)
                this.props.onReplaceCid(oldNid, newNid)
                this.bubbleUpUpdate(oldNid, newNid)
            })

        })

        /* newNode.getObjCid((newNid) => {
             oldNode.getObjCid((oldNid) => {
                 console.log('old node',oldNid, oldNode)
                 this.props.onNewNode(newNode)
                 this.bubbleUpUpdate(newNid, oldNid)
             })
         })
         */
    }

    bubbleUpUpdate(oldNid, newNid) {
        console.log('updating', oldNid + '>>' + newNid)
        let originParents = this.parents[oldNid]
        if (!originParents) {
            console.log('no more parents', oldNid, newNid)
            return
        }

        for (let pnid of originParents.parents) {
            let parentNode = this.nodes[pnid]
            let removedTargetFork = parentNode.removeRelationFork(oldNid)
            let addedTargetFork = removedTargetFork.addRelationFork(newId)

            let newNode = addedTargetFork.toObj()
            this.addIPLDObj(newNode, (newNid) => {
                parentNode.getObjCid((oldNid) => {
                    this.props.onReplaceCid(oldNid, newNid)
                })

            })

        }
        //this.props.onNewNode(newNode)
        //we find all the parents of an id and update them recursively
    }

    //state changes >> update nodes 
    //animate >> update 
    bubbleDown(rootCids) {
        let prevActiveCids = this.state.activeCids
        this.toAll(prevActiveCids, (obj, cid) => { prevActiveCids[cid] = false })

        let allCids = prevActiveCids

        for (let cid of rootCids) {
            allCids = Object.assign(allCids, this.getLeaveCids(cid))
        }

        this.setState({ allCids: allCids })
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
        if (this.props.borningNode) {
            this.paint.bubble(this.props.borningNode.pt, Now.originRadius(), '#ecd8')
            if (this.props.borningNode.text) {
                this.paint.text(this.props.borningNode.text, this.props.borningNode.pt, Now.originRadius() * 2)
            }
            else {
                this.paint.text("what's in your mind?", this.props.borningNode.pt, Now.originRadius() * 2, '#666')
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

        if (Now.hoverSelection)
            tpt = Now.hoverSelection.burl.pt

        this.paint.arrow(opt, tpt, 0, '#f36')
    }

    action(type, px, py) {
        Now.updateAction(type)
        this.toAll(this.burls, (burl, oid) => {
            UI.track([burl.btn], type, new Pt(px, py));
        })
    }

    selectNewId(newId) {
        if (!this.pts[newId])
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

    addIPLDObj(obj, callaback = () => { }) {
        this.props.ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (error, result) => {
            if (error)
                throw (error)
            let cid = result.toBaseEncodedString()
            console.log("ipld cid added", cid, obj)
            callaback(cid)
        })
    }
}
