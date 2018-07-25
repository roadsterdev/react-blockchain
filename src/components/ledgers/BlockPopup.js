import React, { Component } from 'react';
import './BlockPopup.scss';
import CancelBtn from './../buttons/CancelBtn';

class BlockPopup extends Component {

    blockText() {
        let block = this.props.blockInfo;

        block.map((item) => {
            return (
                <div>
                    <p> {item.address} </p>
                    <p> {item.blockNumber}</p>
                    <p> {item.event} </p>
                    <p>{item.returnValues}</p>
                </div>
            )
        }); 
    }
    render() {

        if(this.props.visible) {
        return(
            <div className="overlay">
                <div className="block-popup-container">
                  <CancelBtn onClick={this.props.cancel}/>
                <div className="block-info-text">
                    {this.blockText()}
                </div>

                </div>
            </div>
        );
    }
    return null;
    }
}

export default BlockPopup;