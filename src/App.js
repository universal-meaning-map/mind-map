import React, { Component } from 'react'
import { IPLDRender } from './IPLDRender'

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            variance: 0.2,
            pauseAnimation: false,
            currentZoom: 1
        }
    }

    handleChange(event) {
        this.setState({ variance: event.target.value });
    }

    handleClick(event) {
        this.setState({ pauseAnimation: !this.state.pauseAnimation });
    }

    onPinchMove(e) {
        console.log(e.distance)
        let zoomDelta = e.zoom
        let currentZoom = this.state.currentZoom * zoomDelta
        this.setState({ currentZoom: currentZoom })
    }

    render() {
        return (

            <div className="App" style={{touchAction:'none'}}>

                <div><IPLDRender
                    name="IPLDRender"
                    background="#fff"
                    onPinchMove={this.onPinchMove.bind(this)}
                    zoom={this.state.currentZoom}
                    pause={true} />
                </div>

            </div>
        );
    }
}