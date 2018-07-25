import React, { Component } from 'react';
import './Block.scss';

class Block extends Component {

    onBlockClick(block) {
        //TODO: show popop with this data
        console.log("block");
        console.log(block);
    }

    render() {
        let text = "{...}";
        let blockNumber = "Block " + this.props.block[0].blockNumber;

        return(
                <div>
                    <button className="block" onClick={this.onBlockClick.bind(this, this.props.block)}>
                        <h2 className="block-text">{text}</h2>
                    </button>
                    <h3 className="block-number-text">{blockNumber}</h3>
                </div>
        )
    }
}

export default Block;