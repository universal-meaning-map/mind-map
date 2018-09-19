import React, { Component } from 'react';
import { ChartExample } from './PtsExamples';
import {AnimationExample} from './AnimationExample'
export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            variance: 0.2,
            pauseAnimation: false
        }

        this.mockData(0.2);

    }

    mockData(variance) {
        let gaussian = (x) => {
            let mean = 0;
            return (1 / Math.sqrt(2 * Math.PI * variance)) * Math.exp(-(x - mean) * (x - mean) / (2 * variance));
        };

        this.chartData = [];
        for (let i = -5; i < 5; i += 0.1) {
            this.chartData.push(gaussian(i));
        }
    }

    handleChange(event) {
        this.setState({ variance: event.target.value });
    }

    handleClick(event) {
        this.setState({ pauseAnimation: !this.state.pauseAnimation });
    }

    componentWillUpdate(nextProps, nextState) {
        this.mockData(nextState.variance);
    }

    render() {
        return (

            <div className="App">

                <div><AnimationExample
                    name="pts_chart"
                    background="#f36"
                    pause={true}/>
                </div>
                
                <div><ChartExample
                    name="pts_chart"
                    background="#0c9"
                    loop={false} data={this.chartData}
                    variance={this.state.variance} /></div>
                <div>
                    <h3>ChartExample Component</h3>
                    <p><label>Variance: <input
                        type="range"
                        value={this.state.variance}
                        min={0.05}
                        max={5}
                        step={0.05}
                        onChange={this.handleChange.bind(this)} /></label> ({this.state.variance})</p>
                </div>
            </div>
        );
    }
}