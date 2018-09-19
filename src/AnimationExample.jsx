import { Pt, Group, Line, Create, Circle } from 'pts/dist/es5';
import PtsCanvas from "./PtsCanvas";

export class AnimationExample extends PtsCanvas {

    constructor() {
        super();
        this.noiseGrid = [];
        this.nodesData = [
            {
                nodeName: 'Node1',
                relationships: ['Node2', 'Node3'],
                color:'#f00'
            },
            {
                nodeName: 'Node2',
                relationships: [],
                color:'#0f0'
            },
            {
                nodeName: 'Node3',
                relationships: [],
                color:'#00f'
            }
        ]
        this.nodesCircles =[]
    }

    _create() {

        //this.form.fillOnly("#f36").circle(node)
        // Create a line and a grid, and convert them to `Noise` points
        /*let gd = Create.gridPts(this.space.innerBound, 30, 10);
        this.noiseGrid = Create.noisePts(gd, 0.05, 0.1, 20, 20);
        this.checkPause()
        */

        this.nodesCircles = this.nodesData.map((n)=>{
            let c = Object.assign({},n)
            c.position = Pt.make(2,400,true)
            return c
        })
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


    // Override PtsCanvas' animate function
    animate(time, ftime) {

        this.nodesCircles.forEach(n => {
            this.form.fill(n.color).point(n.position, 100, 'circle');
            
        });

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
