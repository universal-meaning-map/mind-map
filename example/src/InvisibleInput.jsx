import React from 'react';

export default class InvisibleInput extends React.Component {

    constructor() {
        super()
        this.state = {
            text: '...',
        }
    }

    onChange(e) {
        this.props.onChange(e.target.value)
    }

    getStyle() {
        if (this.props.hide)
            return { display: 'hidden' }
        else return {}
    }

    render() {

        return (
            <div style={this.getStyle()}>
                <input
                    ref={(input) => { this.nameInput = input }}
                    value={this.props.text}
                    onChange={this.onChange.bind(this)}
                    autoFocus={true}
                />
            </div>
        );
    }
}

