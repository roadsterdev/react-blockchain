import React, { Component } from 'react';
import './PlatinumPack.scss';
import PlatinumPackImg from './PlatinumPack.png';

class PlatinumPack extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return( 
           <div>
            <div className="platinum-pack">
            <button className="popupbtn-platinum" onClick={this.props.click}>  
                <img src= {PlatinumPackImg} className="pack-of-platinumcards" alt="Pack-of-Cards"/>
            </button>
            </div>
           </div>
        )
    }
}

export default PlatinumPack;