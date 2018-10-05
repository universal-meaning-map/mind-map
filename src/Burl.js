import { UIButton } from 'pts'
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

        this.setInteraction()
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

    setInteraction() {
        let area = this.getInteractionArea()
        this._btn = UIButton.fromCircle([this.pt, area])

        this._btn.onClick(() => {
            console.log('Hello', this._oid)
            //this.selectNewId(oid)
        })
    }

    updateInteraction() {
        if (!this._btn)
            this.setInteraction()
        this._btn.group = this.getInteractionArea()
    }

    getInteractionArea() {
        let area = [Now.originRadius(), Now.originRadius()]
        if (this._nodes.length > 0)
            area = [Now.nodeRadius() * 1.2, Now.nodeRadius() * 1.2]

        return area
    }

    addInteraction() {

        let oid = n.origin.link
        let pt = this.pts[oid]

        let area = [Now.nodeRadius(), Now.nodeRadius()]
        let btn = UIButton.fromCircle([pt, area])
        btn.onClick((a) => {
            console.log('Hello', oid)
            this.selectNewId(oid)
        })

        //n.btn.onHover(console.log, console.log)
        this.btns.push(btn)
    }


}

