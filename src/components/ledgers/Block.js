import React, { Component } from 'react';
import './Block.scss';

class Block extends Component {
    render() {

        let text = "{...}";
        return(

            <div className="block-container" > 

                <div>
                    <button className="block">
                        <h2 className="block-text"> {text} </h2>
                    </button> 
                    <h3 className="block-number-text"> Block 12</h3>
                </div>
        
                <div>
                    <button className="block">
                        <h2 className="block-text"> {text} </h2>
                    </button>
                    <h3 className="block-number-text"> Block 13</h3>
                </div>

                <div>
                <button className="block">
                    <h2 className="block-text"> {text}</h2>
                </button>
                <h3 className="block-number-text"> Block 14</h3>
                </div>
        
            </div>
        )
    }
}

export default Block;