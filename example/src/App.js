import React, { Component } from 'react'
import IPLDRender from 'ipld-mindmap-ptsjs-render'
//import './IpfsController'
import IPFS from 'ipfs'
import { toHexString } from 'multihashes';
import InvisibleInput from 'ipld-mindmap-ptsjs-render/example/src/InvisibleInput';

const cids = [
    //'zdpuAvYJaZxBjTV4WH3irwThm5t2a7yTccoN9cWpDmtV4CiNz',//not using link properly
    //'zdpuAyvmoJWTiVrCv1aCHV5xUZ1fxUf4XLkrprKPMMFCNKfj3',
    //'zdpuAxh9rv4ZTUFfogJh7ysjBW7F5iKEyPZ3somVv2B3UvtkS'
    'zdpuArtVCtqg54KPzzZPBDYvNmfjmqvB9bYtf6p6zPVq2DaGC'
]


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pauseAnimation: false,
            currentZoom: 1,
            lastZoom: 1,
            borningNode: { text: 'Unga bunga' },
            isBorning: false
        }

        this.ipfs = new IPFS()
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

    onLongPressStart(mousePosition) {
        console.log('press')
        let borningNode = {
            text: this.state.borningNode.text,
            pt: mousePosition
        }
        this.setState({
            borningNode: borningNode
        })
    }

    onPressStart(mousePosition) {
        console.log('start')
        this.setState({ hasFocus: false })
    }

    onPressEnd(mousePosition) {
        console.log('end')
        this.setState({ hasFocus: true })
    }

    onInputChange(value) {
        let borningNode = {
            text: value,
            pt: this.state.borningNode.pt
        }

        this.setState({ borningNode: borningNode })
    }

    getInvisibleInput() {
        return <InvisibleInput
            hasFocus={this.state.hasFocus}
            onChange={this.onInputChange.bind(this)}
            text={this.state.borningNode.text}
            hide />
    }

    render() {
        let invisibleInput = (<div/>)
        if(this.state.hasFocus)
            invisibleInput = this.getInvisibleInput()

        return (

            <div
                className="App"
                style={{ touchAction: 'none' }}
                onClick={this.handleClick.bind(this)}>

                <div><IPLDRender
                    ipfs={this.ipfs}
                    cids={cids}
                    name="IPLDRender"
                    background="#fff"
                    onPinchStart={this.onPinchStart.bind(this)}
                    onPinchMove={this.onPinchMove.bind(this)}
                    onLongPressStart={this.onLongPressStart.bind(this)}
                    onPressStart={this.onPressStart.bind(this)}
                    onPressEnd={this.onPressEnd.bind(this)}
                    borningNode={this.state.borningNode}
                    zoom={this.state.currentZoom}
                    loop={true} />
                </div>

                {invisibleInput}


            </div>
        );
    }
}