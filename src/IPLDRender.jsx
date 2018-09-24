import { Pt, Group, Line, Create, Circle, Polygon, Rectangle, Util, World, Particle, Triangle, Geom, Const } from 'pts/dist/es5';
import PtsCanvas from "./PtsCanvas";

import nodes from "./mockData"

export class IPLDRender extends PtsCanvas {

    constructor() {
        super();
        this.nodeRadius = 20
        this.nodeArm = 50
        this.world = null
        this.pts = null
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
            i++
        }
        this.pts = new Group(group)
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
        let pointer = destPt.$subtract(originPt).unit().multiply(length)
        let sideVertex1 = new Pt(pointer.y, -pointer.x).multiply(sharpness)
        let sideVertex2 = new Pt(-pointer.y, pointer.x).multiply(sharpness)
        let arrow = new Group(pointer, sideVertex1, sideVertex2)
        let offsetPt = pointer.$unit().multiply(offset).add(destPt)
        arrow.moveTo(offsetPt)
        return arrow
    }

    drawText(n) {
        //font style
        this.form.font(12).alignText("center");
        this.form.fill("#333")
        //text box
        let tb = Rectangle.fromCenter(n.pt, this.nodeRadius * 2)
        this.form.textBox(tb, n['/'], "middle", "…")
    }

    drawBubble(n) {
        this.form.fillOnly("#eee")
        this.form.point(n.pt, this.nodeRadius, 'circle')
    }

    center() {
        let center = this.pts.centroid()
        let offset = center.subtract(this.space.center)
        this.pts.moveTo([100, 100])
    }

    animate(time, ftime) {

        for (let cid in nodes) {
            if (!nodes.hasOwnProperty(cid))
                continue

            let n = nodes[cid]

            this.addForces(nodes, n)
            this.drawRelationships(nodes, n)
            this.drawBubble(n)
            this.drawText(n)
            this.world.update(ftime)
        }

    }

}
