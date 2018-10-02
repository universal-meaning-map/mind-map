import React, { Component } from 'react'
import IPLDRender from 'ipld-mindmap-ptsjs-render'
//import './IpfsController'
import IPFS from 'ipfs'

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
            lastZoom: 1
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

    render() {
        return (

            <div
                className="App"
                style={{ touchAction: 'none' }}
                onClick={this.handleClick.bind(this)}>

                <div><IPLDRender
                    ipfs = {this.ipfs}
                    cids = {cids}
                    name="IPLDRender"
                    background="#fff"
                    onPinchStart={this.onPinchStart.bind(this)}
                    onPinchMove={this.onPinchMove.bind(this)}
                    zoom={this.state.currentZoom}
                    loop={true} />
                </div>

            </div>
        );
    }
}