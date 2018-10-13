export default class BurlSelection {
    constructor(burl, node) {
        this._burl = burl

        this._node = node
    }

    get burl() {
        return this._burl
    }

    get node() {
        return this._node
    }

    get id() {

        if (this.node)
            return this._node.nodeCid
        else
            return this._burl.oid

    }
}