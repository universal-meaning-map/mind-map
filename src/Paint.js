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

    text(text, opt, size, color = "#333", truncate = true) {
        let finalText = text
        //font style
        this.form.font(12).alignText("center");
        this.form.fill(color)
        //text box
        let tb = Rectangle.fromCenter(opt, size)

        if(truncate)
            this.form.paragraphBox(tb, text, 1.2, "middle", true)
        else
            this.form.textBox(tb, text, "middle", "…")
    }

}