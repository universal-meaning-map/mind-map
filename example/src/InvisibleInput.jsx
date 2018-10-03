import React from 'react';

export default class InvisibleInput extends React.Component {

    constructor()
    {
        super()
        this.state = {
            text: 'unga',
            hasFocus:false
        }
    }

    /*componentDidMount() {
        this.nameInput.focus();
    }*/

    onChange(e) {
        //this.setState({ value: e.target.value })
        this.props.onChange(e.target.value)
    }

    /*componentWillReceiveProps(oldProps) {
        console.log(this.state)
        if (this.props.hasFocus){
            console.log("FOOCUS")
            setTimeout(this.nameInput.focus,30)
    
        }
    }*/
    
    getStyle(){
        if(this.props.hide)
        return {display:'hidden'}
        else return {}
    }
    
    render() {
        
        return (
            <div style={this.getStyle()}>
                <input
                    defaultValue="Won't focus"
                />
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

