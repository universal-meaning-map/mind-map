import { Pt, Group, Line, Create, Circle, Polygon, Rectangle, Util, World, Particle,Triangle, Geom, Const } from 'pts/dist/es5';
import PtsCanvas from "./PtsCanvas";

import nodes from "./mockData"

export class IPLDRender extends PtsCanvas {

    constructor() {
        super();
        this.nodeSize = 50
        this.nodeArm = 10
        this.world = null
        this.pts=null
    }

    create() {
        this.world = new World(this.space.innerBound, 0.99, new Pt(0, 0));
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

    setNodePt(n,i) {
        if (!n.pt) {
            let random = new Pt([Util.randomInt(100), Util.randomInt(100)])
            let initPt = this.space.center.$add(random)
            n.pt = new Particle(initPt).size(this.nodeSize + this.nodeArm);
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
                let force = distance.$multiply(-1*forceAmount)
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
                let line = new Group(n.pt,destPt )
                this.form.strokeOnly(lineColor, 1)
                this.form.line(line)

                //arrow
                //Pt unit of same directions as relaationship line
                /*let sharpness = 0.3//
                let pointer = destPt.$subtract(n.pt).unit().multiply(50)
                let sideVertex1 = new Pt(pointer.y, -pointer.x).multiply(sharpness)
                let sideVertex2 = new Pt(-pointer.y, pointer.x).multiply(sharpness)
                let arrow = new Group(pointer, sideVertex1, sideVertex2)
                arrow.moveTo(destPt)
                */
                let arrow = this.getArrow(n.pt, destPt)
                
                this.form.fillOnly('#f36', 1)
                this.form.polygon(arrow)
                //let pointer = new Triangle.fromCircle([n.pt, destPt] )
                //this.form.fillOnly(lineColor)
                //this.form.polygon(pointer)
            }
        }
    }

    getArrow(originPt, destPt, offset = 0, length = 50, sharpness = 0.3)
    {
        
        let pointer = destPt.$subtract(originPt).unit().multiply(length)
        let sideVertex1 = new Pt(pointer.y, -pointer.x).multiply(sharpness)
        let sideVertex2 = new Pt(-pointer.y, pointer.x).multiply(sharpness)
        let arrow = new Group(pointer, sideVertex1, sideVertex2)
        arrow.moveTo(destPt)
        return arrow
    }


    drawText(n) {
        //font style
        this.form.font(12).alignText("center");
        this.form.fill("#333")
        //text box
        let tb = Rectangle.fromCenter(n.pt, this.nodeSize)
        this.form.textBox(tb, n['/'], "middle", "…")
    }

    drawBubble(n) {
        this.form.fillOnly("#eee")
        this.form.point(n.pt, this.nodeSize * 0.5, 'circle')
    }

    center()
    {
        let center = this.pts.centroid()
        console.log(center)
        let offset = center.subtract(this.space.center)
        this.pts.moveTo([100,100])
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

        //this.center()

        /*
        let nodeSize = 100
        this.nodesCircles.forEach(n => {
            this.form.fill(n.color).point(n.position, 100, 'circle');
            let p = Polygon.fromCenter(this.space.pointer,100 , 10)

            this.form.fill("#f00").polygon(p)
        });

        let n = this.nodesCircles[0]
        let p = this.space.center
        this.form.font(20 ).alignText( "center" );
        this.form.fill("#f368").point(p, nodeSize, 'circle')
        let tb = Rectangle.fromCenter(p, nodeSize)
        this.form.fill("#000").textBox(tb, n.nodeName, "middle", "...")

        */


        /*if (!this.noiseGrid) return;

        // Use pointer position to change speed
        let speed = this.space.pointer.$subtract(this.space.center).divide(this.space.center).abs();

        // Generate noise in a grid
        this.noiseGrid.forEach((p) => {
            p.step(0.01 * (1 - speed.x), 0.01 * (1 - speed.y));
            this.form.fillOnly("#123").point(p, Math.abs(p.noise2D() * this.space.size.x / 18), "circle");
        });*/

    }

}
