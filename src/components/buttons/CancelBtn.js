import React, { Component } from 'react';
import './CancelBtn.scss';

class CancelBtn extends Component {
    render() {
        return <button className="cancel-button" onClick={this.props.onClick}> X </button>

    }
}

export default CancelBtn;