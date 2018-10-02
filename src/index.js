import { Pt, Group, Circle, Rectangle, Util, World, Particle, UIButton, UI } from 'pts';
import PtsCanvas from "./PtsCanvas.jsx"
import Converter from "./Converter.js"
import React, { Component } from 'react'
import NodeType from './NodeType'
import Shape from './Shape'
import Paint from './Paint'

export default class IPLDReodeder extends PtsCanvas {

    constructor(props) {
        super(props);
        this.nodeRadius = 50
        this.nodeArm = 50

        this.world = null
        this.nodes = {}
        this.pts = {}
        this.btns = []

        this.selectedId = null
        this.selectedRelation = undefined
        this.selectedIdHistory = []
        this.paint = {}
        
        document.onkeydown = this.checkKey.bind(this);
        
        this.setIpfs()
    }
    
    onCreated()
    {
        this.paint = new Paint(this.form)

    }

    setIpfs() {
        if (!this.props.ipfs) throw (new Error('No IPFS object'))
        let that = this
        this.props.ipfs.on('start', () => {
            that.onIpfsReady(that.props.ipfs)
        })

        if (this.props.ipfs.isOnline())
            this.onIpfsReady()
    }

    onIpfsReady(ipfs) {
        for (let cid of this.props.cids)
            this.loadOriginCid(cid)
    }

    loadOriginCid(nid) {
        //nid = node id (node cid or node link)
        ipfs.dag.get(nid, (error, result) => {
            if (error) {
                throw (error)
            }

            let n = new NodeType(result.value)
            this.nodes[n.origin.link] = n
            this.setNodePts(n, nid)
        })
    }

    setNodePts(n, nid) {
        //origin id (origin cid or link)
        let oid = n.origin.link
        if (!this.pts[oid]) {
            this.pts[oid] = this.addNewPtParticle()
        }
        //node pt has its own pt wich is the same as the content pt
        this.pts[nid] = this.pts[oid]

        //interaction to node
        this.addInteraction(n)
        //relationships
        for (let r of n.relations) {
            let tid = r.target.link
            if (!this.pts[tid]) {
                this.pts[tid] = this.addNewPtParticle()
            }
        }
    }

    ptExists(cid) {
        return (this.pts[cid] ? true : false)
    }

    addInteraction(n) {
        let oid = n.origin.link
        let pt = this.pts[oid]

        let size = [this.getNodeRadius(), this.getNodeRadius()]
        let btn = UIButton.fromCircle([pt, size])
        btn.onClick((a) => {
            console.log('Hello', oid)
            this.selectNewId(oid)
        })

        //n.btn.onHover(console.log, console.log)
        this.btns.push(btn)
    }

    componentDidUpdate(prevProps) {
        this.checkPause()
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
    }

    resize() {
        //this.create();
    }

    addNewPtParticle() {
        let initPt = Shape.randomPt(this.space.center)
        let particle = new Particle(initPt).size(this.getNodeRadius() + this.getNodeArm());
        this.world.add(particle)
        return particle
    }

    addForces(n) {

        for (let r of n.relations) {
            //targetPt
            let tpt = this.pts[r.target.link]
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

    drawRelations(n) {
        let lineColor = "#999"
        for (let r of n.relations) {
            let opt = this.pts[n.origin.link]
            let tpt = this.pts[r.target.link]
            this.paint.arrow(opt, tpt, this.getNodeRadius(), lineColor)
        }
    }

    getNodeRadius() {
        return (this.nodeRadius * this.props.zoom)
    }

    getNodeArm() {
        return (this.nodeArm * this.props.zoom)
    }

    drawText(n) {
        let oid = n.origin.link
        let opt = this.pts[oid]
        this.paint.text(oid,opt,this.getNodeRadius()*2)
    }

    drawContentBubble(pt) {
        this.paint.bubble(pt, this.getNodeRadius(), 'eee')
    }

    drawNodeBubble(n) {
        let pt = this.pts[n.origin.link]
        this.paint.bubble(pt, this.getNodeRadius() * 1.2, '#fee')
    }

    drawHighlightLine(pt1, pt2, color = "#f36") {
        this.form.strokeOnly(color)
        this.form.line([pt1, pt2])
    }

    highlight() {
        if (!this.pts[this.selectedId])
            return
        let npt = this.pts[this.selectedId]
        let n = this.nodes[this.selectedId]
        this.paint.bubbleOutline(npt, this.nodeRadius)
        /*
        if (!this.selectedRelation)
            return

        for (let r of n.relationships) {
            if (r.destinationNode === this.selectedRelation) {
                let tpt = this.pts[r.destinationNode]
                this.drawHighlightLine(npt, tpt)
                this.drawHighlightBubble(npt)
            }
        }*/
    }

    animate(time, ftime) {
       // console.log(this.form)
        this.world.update(ftime)
        this.toAll(this.nodes, this.addForces.bind(this))
        this.toAll(this.nodes, this.drawRelations.bind(this))
        this.toAll(this.nodes, this.drawNodeBubble.bind(this))
        this.toAll(this.pts, this.drawContentBubble.bind(this))
        this.toAll(this.nodes, this.drawText.bind(this))
        this.highlight()
    }

    toAll(obj, fnc) {
        for (let cid in obj) {
            if (!obj.hasOwnProperty(cid))
                continue
            fnc(obj[cid])
        }
    }

    action(type, px, py) {
        UI.track(this.btns, type, new Pt(px, py));
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

}
