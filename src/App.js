import React, { Component } from 'react'
import IPLDRender from './PtsRender'
import InvisibleInput from './InvisibleInput'
import getIpfs from 'window.ipfs-fallback'

import QueryString from 'query-string'

var Buffer = require('buffer/').Buffer

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pauseAnimation: false,
            currentZoom: 1,
            lastZoom: 1,
            borningNodeText: null,
            borningNodePt: null,
            cids: [],
            ipfs: null,
            autoLayout: true,
            src: ''
        }

        this.replaceCid = this.replaceCid.bind(this)
        this.addNode = this.addNode.bind(this)
        this.addTextOrigin = this.addTextOrigin.bind(this)
        this.resolveIPNS = this.resolveIPNS.bind(this)
        this.onHashChanged = this.onHashChanged.bind(this)

        getIpfs()
            .then((ipfs) => {
                console.warn('Got IPFS')
                ipfs.id().then((peer) => {
                    this.resolveIPNS(peer.id)
                })
                this.setState({ ipfs: ipfs })
                this.checkHash()
            })
            .catch((error) => console.error)

        window.addEventListener('hashchange', this.onHashChanged, false);
        this.onHashChanged()
    }

    onHashChanged() {
        this.checkHash()
    }

    checkHash() {
        let parsedHash = QueryString.parse(window.location.hash)
        this.loadProperties(parsedHash)
    }

    loadProperties(p) {
        let autoLayout = true
        let isDebug = false
        if ('src' in p)
            this.loadSrc(p.src)
        if ('autoLayout' in p)
            autoLayout = p.autoLayout
        if ('isDebug' in p)
            isDebug = p.isDebug

        this.setState({ autoLayout: autoLayout, isDebug: isDebug })
    }

    loadSrc(cid) {
        if (this.state.ipfs) {
            this.loadDag(cid, (data) => {

                this.setState({ cids: data.cids })
            })
        }
    }

    addTextOrigin(text, onAdded = () => { }) {

        let file = {
            path: 'origin.txt',
            content: Buffer.from(text, 'utf8')
        }

        this.state.ipfs.files.add(file, (error, result) => {
            if (error)
                throw (error)

            let cid = result[0].hash
            //this.publishToIPNS(cid)

            onAdded(cid)
        })
    }

    replaceCid(cidToRemove, cidToAdd) {

        let index = this.state.cids.indexOf(cidToRemove)
        if (index === -1)
            return

        let cids = [...this.state.cids]
        cids.splice(index, 1, cidToAdd)
        this.setState({ cids: cids })
    }

    addNode(obj) {
        this.addIpldObj(obj, (cid) => {
            this.addCID(cid)
        })
    }

    addIpldObj(obj, callback) {
        this.state.ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (error, result) => {
            if (error)
                throw (error)
            let cid = result.toBaseEncodedString()
            callback(cid)
        })
    }

    save() {
        let obj = {}
        obj.cids = [...this.state.cids]
        this.addIpldObj(obj, (cid) => {
            this.setState({ src: cid })
            this.makeHash()
        })
    }

    makeHash() {
        let hashObj = {}
        hashObj.autoLayout = this.state.autoLayout
        hashObj.src = this.state.src
        hashObj.isDebug = this.state.isDebug
        let newHash = QueryString.stringify(hashObj)
        window.location.hash = newHash
    }

    addCID(cid) {

        if (this.state.cids.indexOf(cid) === -1) {
            this.setState({ cids: [...this.state.cids, cid] })
        }
        else {
            console.log('cid exists already', cid)
        }

        this.save()
    }

    publishToIPNS(cid) {
        let that = this
        this.state.ipfs.name.publish(cid, function (err, res) {
            console.log(res)
            if (!res)
                return
            // You now receive a res which contains two fields:
            //   - name: the name under which the content was published.
            //   - value: the "real" address to which Name points.
            console.log(`https://gateway.ipfs.io/ipns/${res.name}`)

            that.state.ipfs.name.resolve(res.name, function (err, name) {
                console.log('resolving', name)
                // /ipfs/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm
            })
        })
    }

    resolveIPNS(ipns) {
        let that = this
        this.state.ipfs.name.resolve(ipns, function (err, result) {
            console.log('IPNS resolved', result)
            if (!result || !result.path)
                return
            let cid = result.path.replace('/ipfs/', '')
            console.log(cid)
            that.addCID(cid)
        })
    }

    handleChange(event) {
        this.setState({ variance: event.target.value });
    }

    handleClick(event) {
        //this.setState({ pauseAnimation: !this.state.pauseAnimation });
    }

    onPinchStart(e) {
        this.setState({ lastZoom: this.state.currentZoom })
    }

    onPinchMove(e) {
        let zoomDelta = e.zoom
        let currentZoom = this.state.lastZoom * zoomDelta
        this.setState({ currentZoom: currentZoom })
    }

    onPressStart(mousePosition) {
        // this.setState({ hasFocus: false })
    }

    onLongPressStart(mousePosition) {
        this.setState({
            borningNodeText: '',
            borningNodePt: mousePosition,
            cid: null
        })
    }

    onLongPressEnd(mousePosition) {
        this.setState({ hasFocus: true })
    }

    onInputChange(value) {

        this.setState({ borningNodeText: value })
    }

    onInputReturn(text) {
        if (text) {
            this.addTextOrigin(text, (cid) => {
                this.setState({ borningNodeCid: cid })
                this.addCID(cid)
            })
        }
        this.setState({ hasFocus: false, borningNodeText: null })
    }

    getInvisibleInput() {
        return <InvisibleInput
            onChange={this.onInputChange.bind(this)}
            onReturn={this.onInputReturn.bind(this)}
            text={this.state.borningNodeText}
            hide={this.state.isDebug} />
    }


    loadDag(cid, callback) {
        this.state.ipfs.dag.get(cid, (error, result) => {
            if (error) {
                console.warn("ipfs.dag.get", cid, error)
                callback(null, cid)
                return
            }

            let data = result.value
            callback(data, cid)
        })
    }

    render() {
        let invisibleInput = (<div />)
        if (this.state.hasFocus)
            invisibleInput = this.getInvisibleInput()

            
        return (
            <div
                className="App"
                style={{ touchAction: 'none' }}
                onClick={this.handleClick.bind(this)}>

                {invisibleInput}
                <div><IPLDRender
                    ipfs={this.state.ipfs}
                    cids={this.state.cids}
                    name="IPLDRender"
                    background="#fff"
                    onPinchStart={this.onPinchStart.bind(this)}
                    onPinchMove={this.onPinchMove.bind(this)}
                    onLongPressStart={this.onLongPressStart.bind(this)}
                    onLongPressEnd={this.onLongPressEnd.bind(this)}
                    onPressStart={this.onPressStart.bind(this)}
                    longPressDelay={500}
                    borningNodeText={this.state.borningNodeText}
                    borningNodePt={this.state.borningNodePt}
                    borningNodeCid={this.state.borningNodeCid}
                    onNewNode={this.addNode}
                    onReplaceCid={this.replaceCid}
                    zoom={this.state.currentZoom}
                    loop={true}
                    autoLayout={this.state.autoLayout}
                    isDebug={this.state.isDebug} />
                </div>
            </div>
        );
    }
}