import { Pt, Group, Util } from 'pts';

export default class Shape {
    static arrowPointer(originPt, destPt, length = 10, sharpness = 0.3) {
        let pointer = destPt.$subtract(originPt)
        let offsetPt = destPt
        if (pointer.magnitude()) {
            pointer.unit()
            offsetPt = pointer.$unit().add(destPt)
        }
        pointer.multiply(length)
        let sideVertex1 = new Pt(pointer.y, -pointer.x).multiply(sharpness)
        let sideVertex2 = new Pt(-pointer.y, pointer.x).multiply(sharpness)
        let arrow = new Group(pointer, sideVertex1, sideVertex2)
        arrow.moveTo(offsetPt)
        return arrow
    }

    static randomPt(center, extend = 100) {
        let pt = new Pt([Util.randomInt(extend), Util.randomInt(extend)])
        pt.add(center).subtract(extend * 0.5)
        return pt
    }
}