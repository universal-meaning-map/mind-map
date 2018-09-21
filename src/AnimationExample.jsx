import { Pt, Group, Line, Create, Circle, Polygon, Rectangle, Util } from 'pts/dist/es5';
import PtsCanvas from "./PtsCanvas";

import nodes from "./mockData"

export class AnimationExample extends PtsCanvas {

    constructor() {
        super();
    }

    _create() {
        //We already have the data digested to be rendered
        //we mapped the data to a key-value of CID and nodes
        //We merge repeated nodes        
    }

    componentDidUpdate() {
        this.checkPause()
    }

    checkPause() {
        console.log("Helloooo")
        if (this.props.pause) {
            this.space.pause();

        } else {
            this.space.resume();
        }
    }

    // Override PtsCanvas' start function
    start(space, bound) {
        this._create();
    }


    // Override PtsCanvas' resize function
    resize() {
        this._create();
    }

    drawText(n)
    {
        let boxSize = 50
        //circle background
        this.form.fill("#fff")
        this.form.point(n.pt, boxSize*0.5, 'circle')
        //font style
        this.form.font(12 ).alignText( "center" );
        this.form.fill("#000")
        //text box
        let tb = Rectangle.fromCenter(n.pt, boxSize)
        this.form.textBox(tb, n['/'], "middle", "…" )
    }
    // Override PtsCanvas' animate function
    animate(time, ftime) {

        for (let cid in nodes) {
            if (!nodes.hasOwnProperty(cid))
                continue
            let n = nodes[cid]

            if(!n.pt)
            {
                n.pt = new Pt([Util.randomInt(this.space.width), Util.randomInt(this.space.height)])
            }

            if (n.relationships)
            {
                for(let r of n.relationships)
                {
                    let line = new Group( n.pt, nodes[r.destinationNode].pt)
                    this.form.strokeOnly("#999",1)
                    this.form.line(line)
                }
            }
            
            this.form.fillOnly("#f36")
            this.form.point(n.pt, 10, 'circle')
            this.drawText(n)
        }

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
