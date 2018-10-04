import React from 'react';

export default class InvisibleInput extends React.Component {

    constructor() {
        super()
        this.state = {
            text: '...',
        }
        document.onkeydown = this.checkKey.bind(this);
    }

    checkKey(e) {
        e = e || window.event;

        if (e.keyCode === 13 && e.shiftKey) {
            return
        }

        if (e.keyCode === 13) {
            if (this.props.onReturn)
                this.props.onReturn()
        }
    }

    onChange(e) {
        let newText = e.target.value
        this.props.onChange(newText)
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
                    <textarea
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

