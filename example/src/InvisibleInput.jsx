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

    getZIndex(hide) {
        if (hide)
            return -1
        return 'auto'
    }

    render() {

        return (
            <div style={{ position: 'relative', zIndex: this.getZIndex(this.props.hide) }}>
                <div style={{ position: 'absolute' }}>
                    <input
                        ref={(input) => { this.nameInput = input }}
                        value={this.props.text}
                        onChange={this.onChange.bind(this)}
                        autoFocus={true}
                    />
                </div>
            </div >
        );
    }
}

