import React, { Component } from 'react'
import IPLDRender from 'ipld-mindmap-ptsjs-render'
import InvisibleInput from 'ipld-mindmap-ptsjs-render/example/src/InvisibleInput'
import getIpfs from 'window.ipfs-fallback'

var Buffer = require('buffer/').Buffer

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pauseAnimation: false,
            currentZoom: 1,
            lastZoom: 1,
            borningNode: null,
            cids: ["zdpuAxN9YnjyNiU8QqZUeenaeNXgiR1TUKDSbrFJKnme4ZLNa", "QmRdgTtGVofrnT3hFsk9fHX5wc2NGzsZ8XR5Lv1tcsi2mo"],
            ipfs: null
        }

        this.addNode = this.addNode.bind(this)
        this.addTextOrigin = this.addTextOrigin.bind(this)
        this.resolveIPNS = this.resolveIPNS.bind(this)
        
        let that = this

        getIpfs()
            .then((ipfs) => {
                console.warn('Got IPFS')
                ipfs.id().then((peer) => {
                    this.resolveIPNS(peer.id)
                })
                this.setState({ ipfs: ipfs })
            })
            .catch((error) => console.error)
    }

    addTextOrigin(text) {

        let file = {
            path: 'origin.txt',
            content: Buffer.from(text, 'utf8')
        }

        this.state.ipfs.files.add(file, (error, result) => {
            if (error)
                throw (error)

            let cid = result[0].hash
            //this.publishToIPNS(cid)
            this.addNewCID(cid)
        })
    }

    addNode(obj) {
        this.state.ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' }, (error, result) => {
            if (error)
                throw (error)
                let cid = result.toBaseEncodedString()
                console.log('New node added', cid)
            //this.publishToIPNS(cid)
            this.addNewCID(cid)
        })
    }

    addNewCID(cid) {

        if (this.state.cids.indexOf(cid) === -1) {
            this.setState({ cids: [...this.state.cids, cid] })
        }
        else {
            console.log('cid exists already', cid)
        }
    }

    publishToIPNS(cid) {
        let that = this
        this.state.ipfs.name.publish(cid, function (err, res) {
            console.log(res)
            if(!res)
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
            if(!result || !result.path)
                return
            let cid = result.path.replace('/ipfs/','')
            console.log(cid)
            that.addNewCID(cid)
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
        let borningNode = {
            text: '',
            pt: mousePosition
        }
        this.setState({
            borningNode: borningNode,
        })
    }

    onLongPressEnd(mousePosition) {
        this.setState({ hasFocus: true })
    }

    onInputChange(value) {
        let borningNode = {
            text: value,
            pt: this.state.borningNode.pt
        }

        this.setState({ borningNode: borningNode })
    }

    onInputReturn(text) {
        if (text)
            this.addTextOrigin(text)
        this.setState({ hasFocus: false, borningNode: null })
    }

    getInvisibleInput() {
        return <InvisibleInput
            onChange={this.onInputChange.bind(this)}
            onReturn={this.onInputReturn.bind(this)}
            text={this.state.borningNode.text}
            hide={false} />
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
                    borningNode={this.state.borningNode}
                    onNewNode={this.addNode}
                    zoom={this.state.currentZoom}
                    loop={true} />
                </div>
            </div>
        );
    }
}