import { Pt, Group, Line, Create, Circle, Polygon, Rectangle, Util, World, Particle, Triangle, Geom, Const, UIButton, UI } from 'pts/dist/es5';
import PtsCanvas from "./PtsCanvas";

import nodes from "./mockData"

export class IPLDRender extends PtsCanvas {

    constructor() {
        super();
        this.nodeRadius = 20
        this.nodeArm = 50
        this.world = null
        this.pts = null
        this.btns = []
        this.previousSelectedCID = null
        this.selectedCID = null
        this.selectedRelationship = undefined
        this.ui = null

        document.onkeydown = this.checkKey.bind(this);
    }

    create() {
        this.world = new World(this.space.innerBound, 0.9, new Pt(0, 0));
        let i = 0
        let group = []
        for (let cid in nodes) {
            if (!nodes.hasOwnProperty(cid))
                continue

            let n = nodes[cid]
            this.setNodePt(n, i)
            group.push(n.pt)
            if (i == 0)
                this.selectedCID = n.cid
            i++

            this.addInteraction(n)
        }
        this.pts = new Group(group)
    }

    addInteraction(n) {
        n.btn = UIButton.fromCircle(Circle.fromCenter(n.pt, this.nodeRadius))
        n.btn.onClick((a) => {
            this.selectedCID = n.cid
        })

        //n.btn.onHover(console.log, console.log)
        this.btns.push(n.btn)
    }

    updateBtn(n) {
        n.btn.group[0].to(n.pt)
    }

    componentDidUpdate() {
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
        this.create();
    }

    resize() {
        //this.create();
    }

    setNodePt(n, i) {
        if (!n.pt) {
            let random = new Pt([Util.randomInt(100), Util.randomInt(100)])
            let initPt = this.space.center.$add(random)
            n.pt = new Particle(initPt).size(this.nodeRadius + this.nodeArm);
            this.world.add(n.pt)
        }
    }

    addForces(nodes, n) {
        if (n.relationships) {
            for (let r of n.relationships) {
                let destPt = nodes[r.destinationNode].pt
                //the attraction force will be proporcional to its distance
                let distance = n.pt.$subtract(destPt)
                let forceAmount = 2
                //negative so it attracts
                let force = distance.$multiply(-1 * forceAmount)
                n.pt.addForce(force)
                //oposite force is added to the destination pt
                destPt.addForce(force.multiply(-1))
            }
        }
    }

    drawRelationships(nodes, n) {
        let lineColor = "#999"
        let pointerSize = 10
        if (n.relationships) {
            for (let r of n.relationships) {
                let destPt = nodes[r.destinationNode].pt
                let line = new Group(n.pt, destPt)
                this.form.strokeOnly(lineColor, 1)
                this.form.line(line)

                let arrow = this.getArrow(n.pt, destPt, -this.nodeRadius)
                this.form.fillOnly('#f36', 1)
                this.form.polygon(arrow)
            }
        }
    }

    getArrow(originPt, destPt, offset = 1, length = 10, sharpness = 0.3) {
        let pointer = destPt.$subtract(originPt)
        let offsetPt = destPt
        if (pointer.magnitude()) {
            pointer.unit()
            offsetPt = pointer.$unit().multiply(offset).add(destPt)
        }
        pointer.multiply(length)
        let sideVertex1 = new Pt(pointer.y, -pointer.x).multiply(sharpness)
        let sideVertex2 = new Pt(-pointer.y, pointer.x).multiply(sharpness)
        let arrow = new Group(pointer, sideVertex1, sideVertex2)
        arrow.moveTo(offsetPt)
        return arrow
    }

    drawText(n) {
        //font style
        this.form.font(12).alignText("center");
        this.form.fill("#333")
        //text box
        let tb = Rectangle.fromCenter(n.pt, this.nodeRadius * 2)
        this.form.textBox(tb, n.cid, "middle", "…")
    }

    drawBubble(n) {
        this.form.fillOnly("#eee")
        this.form.point(n.pt, this.nodeRadius, 'circle')
    }

    drawHighlightBubble(pt, color = "#f36") {
        this.form.strokeOnly(color)
        this.form.point(pt, this.nodeRadius, 'circle')
    }

    drawHighlightLine(pt1, pt2, color = "#f36") {
        this.form.strokeOnly(color)
        this.form.line([pt1, pt2])
    }

    center() {
        let center = this.pts.centroid()
        let offset = center.subtract(this.space.center)
        this.pts.moveTo([100, 100])
    }

    highlight(n) {
        if (!n)
            return

        this.drawHighlightBubble(n.pt)
        if (!this.selectedRelationship)
            return

        for (let r of n.relationships) {
            if (r.destinationNode === this.selectedRelationship) {
                let destNode = nodes[r.destinationNode]
                this.drawHighlightLine(n.pt, destNode.pt)
                this.drawHighlightBubble(destNode.pt)
            }
        }
    }

    animate(time, ftime) {

        for (let cid in nodes) {
            if (!nodes.hasOwnProperty(cid))
                continue

            let n = nodes[cid]
            this.updateBtn(n)
            this.addForces(nodes, n)
            this.drawRelationships(nodes, n)
            this.drawBubble(n)
            this.drawText(n)
            this.world.update(ftime)
        }
        this.highlight(nodes[this.selectedCID])

    }

    action(type, px, py) {
        UI.track(this.btns, type, new Pt(px, py));
    }

    selectNextNode() {
        this.selectedCID = this.nodes[this.selectedCID].relationships
    }

    selectNextRelationship(jumps) {
        let currentN = nodes[this.selectedCID]
        let currentIndex = this.getRelationshipIndex(currentN, this.selectedRelationship)
        console.log(currentIndex)
        if (currentIndex === undefined)
        {
            if(currentN.relationships.length>0)
            this.selectedRelationship = currentN.relationships[0].destinationNode
            return
        }
        
        let nextIndex = (currentIndex+jumps)%currentN.relationships.length
        console.log(currentIndex, nextIndex)
        if(nextIndex<0)
            nextIndex = currentN.relationships.length+nextIndex
        let relationship = currentN.relationships[nextIndex]
        if(relationship)
            this.selectedRelationship = relationship.destinationNode
        
        console.log(nextIndex,  relationship)
        
    }

    getRelationshipIndex(n, relationshipCid) {
        if(!n.relationships)
            return
        return n.relationships.findIndex((r) => {
            console.log(r.destinationNode, relationshipCid)
            return r.destinationNode === relationshipCid
        })
    }

    checkKey(e) {

        e = e || window.event;

        if (e.keyCode == '38') {
            this.previousSelectedCID = this.selectedCID
            this.selectedCID = this.selectedRelationship
            this.selectedRelationship = null
        }
        else if (e.keyCode == '40') {
            // down arrow
        }
        else if (e.keyCode == '37') {
            this.selectNextRelationship(-1)
            // left arrow
        }
        else if (e.keyCode == '39') {
            this.selectNextRelationship(1)
            // right arrow
        }

    }

}
