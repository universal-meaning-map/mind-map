import React, { Component } from 'react';
import {IPLDRender} from './IPLDRender'
export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            variance: 0.2,
            pauseAnimation: false
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

                <div><IPLDRender
                    name="IPLDRender"
                    background="#fff"
                    pause={true}/>
                </div>

            </div>
        );
    }
}