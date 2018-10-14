import { UIButton, UIDragger, Group, Pt } from 'pts'
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
        this._isHover = false
        this._size = new Pt(Now.originRadius(), Now.originRadius())
        this._downTimestamps = []
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
        for (let node of this._nodes) {
            if (node.nodeCid === n.nodeCid)
                return
        }
        this._nodes.push(n)
        this._size.to(Now.nodeRadius())
    }

    removeNode(n) {
        for (let i = 0; i <= this._nodes.length; i++) {
            if (this._nodes[i].nodeCid === n.nodeCid) {
                this._nodes.splice(i, 1)
                return
            }
        }
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

    get isHover() {
        return this._isHover
    }

    setInteraction(onDown, onUp, onHover, onLeave, onMove) {

        this._btn = UIButton.fromCircle(new Group(this._pt, this._size))
        this._btn.on('down', (ui, pt) => {
            let now = Date.now()
            if (now - this._downTimestamps[this._downTimestamps.length - 1] > 400)

                this._downTimestamps = [now]
            else
                this._downTimestamps.push(now)

            let times = this._downTimestamps.length

            onDown(pt, this, times)

        })
        this._btn.on('up', (ui, pt) => {
            onUp(pt, this)
        })
        this._btn.onHover(
            (ui, pt) => {
                this._isHover = true
                onHover(pt, this)
            },
            (ui, pt) => {
                this._isHover = false
                onLeave(pt, this)
            })

        this._btn.on('move',
            (ui, pt) => {
                if (this.isHover) {
                    onMove(pt, this)
                }
            })

        return this._btn
    }

}

