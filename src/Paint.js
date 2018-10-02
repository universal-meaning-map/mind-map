import { Group, Rectangle } from 'pts';
import Shape from './Shape'

export default class Paint {
    constructor(form) {
        this.form = form
    }

    bubble(pt, radius = 30, color = '#eee') {
        this.form.fillOnly(color)
        this.form.point(pt, radius, 'circle')
    }

    bubbleOutline(pt, radius = 30, color = "#f36") {
        this.form.strokeOnly(color)
        this.form.point(pt, radius, 'circle')
    }

    arrow(opt, tpt, arrowOffset, color) {
        let line = new Group(opt, tpt)
        this.form.strokeOnly(color, 1)
        this.form.line(line)

        let arrowPointer = Shape.arrowPointer(opt, tpt, - arrowOffset)
        this.form.fillOnly(color, 1)
        this.form.polygon(arrowPointer)
    }

    text(text, opt, size) {
        //font style
        this.form.font(12).alignText("center");
        this.form.fill("#333")
        //text box
        let tb = Rectangle.fromCenter(opt, size)
        this.form.textBox(tb, text, "middle", "…")
    }

}