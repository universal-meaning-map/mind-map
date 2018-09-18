
import { Pt, Group, Line, Create } from 'pts/dist/es5';
import PtsCanvas from "./PtsCanvas";


/**
 * Chart example component, which extends PtsCanvas
 */
export class ChartExample extends PtsCanvas {

    _renderChart() {
        // Given the data, distribute bars across the space's size
        let w = (this.space.size.x) / this.props.data.length;
        let bars = this.props.data.map((d, i) => {
            return new Group(new Pt(i * w, this.space.size.y), new Pt(i * w, this.space.size.y - d * this.space.size.y - 1));
        });

        // Draw a line controlled by mouse pointer
        let line = new Group(new Pt(0, this.space.pointer.y), new Pt(this.space.size.x, this.space.pointer.y));
        this.form.stroke("#fff", 3).line(line, 10, "circle");

        // Draw the bars and also check intersection with the pointer's line
        let intersects = bars.map((b, i) => {
            this.form.stroke("#123", w - 1).line(bars[i]);
            return Line.intersectLine2D(b, line)
        });

        // Draw intersection points
        this.form.fillOnly("#f6c").points(intersects, w / 2);
    }


    // Override PtsCanvas' animate function
    animate(time, ftime) {
        this._renderChart();
    }


    // Override PtsCanvas' action function
    action(type, x, y) {
        this.space.clear(); // since we're not animating continuously, manually clear canvas and re-render chart
        this._renderChart();
    }


    // Override PtsCanvas' resize function
    resize(size, evt) {
        if (this.form.ready) {
            this.space.clear();
            this._renderChart();
        }
    }

}


/**
 * Chart example component, which extends PtsCanvas
 */
