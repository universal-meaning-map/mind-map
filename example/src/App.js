import React, { Component } from 'react'
import IPLDRender from 'ipld-mindmap-ptsjs-render'
import IPFS from 'ipfs'
import InvisibleInput from 'ipld-mindmap-ptsjs-render/example/src/InvisibleInput'

var Buffer = require('buffer/').Buffer

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pauseAnimation: false,
            currentZoom: 1,
            lastZoom: 1,
            borningNode: { text: 'Unga bunga' },
            isBorning: false,
            cids:[]
            //cids: ['zdpuArtVCtqg54KPzzZPBDYvNmfjmqvB9bYtf6p6zPVq2DaGC']
        }

        this.ipfs = new IPFS()
        this.addNode = this.addNode.bind(this)
        this.addTextOrigin = this.addTextOrigin.bind(this)
    }

    addTextOrigin(text) {

        let file = {
            path: 'origin.txt',
            content: Buffer.from(text, 'utf8')
        }

        this.ipfs.files.add(file, (error, result) => {
            if (error)
                throw (error)

            let cid = result[0].hash
            this.addNewCID(cid)
        })
    }

    addNode(obj) {
        this.ipfs.dag.put(obj,{ format: 'dag-cbor', hashAlg: 'sha2-256' }, (error, result) => {
            if (error)
                throw (error)

            let cid = result.toBaseEncodedString()
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
        this.addTextOrigin(text)
        this.setState({ hasFocus: false })
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
                    ipfs={this.ipfs}
                    cids={this.state.cids}
                    name="IPLDRender"
                    background="#fff"
                    onPinchStart={this.onPinchStart.bind(this)}
                    onPinchMove={this.onPinchMove.bind(this)}
                    onLongPressStart={this.onLongPressStart.bind(this)}
                    onLongPressEnd={this.onLongPressEnd.bind(this)}
                    onPressStart={this.onPressStart.bind(this)}
                    longPressDelay = {100}
                    borningNode={this.state.borningNode}
                    onNewNode={this.addNode}
                    zoom={this.state.currentZoom}
                    loop={true} />
                </div>
            </div>
        );
    }
}