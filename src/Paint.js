import { Group, Rectangle, Line, Pt } from 'pts';
import Shape from './Shape'

export default class Paint {
    constructor(form) {
        this.form = form
    }

    bubble(pt, radius = 30, color = '#eee') {
        this.form.fillOnly(color)
        this.form.point(pt, radius, 'circle')
    }

    bubbleOutline(pt, radius = 30, color = "#f36", thickness = 2) {
        this.form.strokeOnly(color, thickness)
        this.form.point(pt, radius, 'circle')
    }

    arrow(opt, tpt, originOffset, targetOffset, color = '#000', thickness = 2) {
        let line = new Group(opt, tpt)
        let originOffsetPt = Line.crop(line, new Pt(originOffset, originOffset), 0)
        let targetOffsetPt = Line.crop(line, new Pt(targetOffset, targetOffset), 1)

        let arrowLine = new Group(originOffsetPt, targetOffsetPt)
        this.form.strokeOnly(color, thickness)
        this.form.line(arrowLine)

        let arrowPointer = Shape.arrowPointer(opt, tpt, - originOffset)
        this.form.fillOnly(color, 1)
        this.form.polygon(arrowPointer)
    }

    text(text, opt, size, color = "#333", multiline = true) {
        //font style
        this.form.font(12).alignText("center");
        this.form.fill(color)
        //text box
        let tb = Rectangle.fromCenter(opt, size)

        if (multiline)
            this.form.paragraphBox(tb, text, 1.2, "middle", true)
        else
            this.form.textBox(tb, text, "middle", "…")
    }

}