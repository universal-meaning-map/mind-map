import { UIButton, UIDragger } from 'pts'
import Now from './Now'

const OTYPE = {
    UNDEFINED: 'undefined',
    TEXT: 'text',
    IMAGE: 'image'
}

export default class Burl {

    constructor(oid, pt) {
        this._oid = oid
        this._pt = pt
        this._nodes = []
        this._fileExtension = OTYPE.UNDEFINED
        this._file = null
        this._btn = null

        //this.setInteraction()
    }

    get oid() {
        return this._oid
    }

    get pt() {
        return this._pt
    }

    get nodes() {
        return this._nodes
    }

    addNode(n) {
        this._nodes.push(n)
    }

    set file(file) {
        this._file = file
    }

    get file() {
        return this._file
    }

    get preview() {
        return this._file.toString('utf-8')
    }

    get hasPreview() {
        if (this._file)
            return true
        return false
    }

    get btn() {
        return this._btn
    }

    setInteraction(onDown, onUp, onHover, onLeave) {
        let area = this.getInteractionArea()
        this._btn = UIButton.fromCircle([this.pt, area])
        this._btn.on('down', (ui, pt) => { onDown(pt, this) })
        this._btn.on('up', (ui, pt) => { onUp(pt, this) })
        this._btn.onHover((ui, pt) => { onHover(pt, this) }, (ui, pt) => { onLeave(pt, this) })
        return this._btn
    }

    /*updateInteraction() {
        if (!this._btn)
            this.setInteraction()
        this._btn.group = this.getInteractionArea()
    }*/

    getInteractionArea() {
        let area = [Now.originRadius(), Now.originRadius()]
        if (this._nodes.length > 0)
            area = [Now.nodeRadius() * 1.2, Now.nodeRadius() * 1.2]

        return area
    }


}

