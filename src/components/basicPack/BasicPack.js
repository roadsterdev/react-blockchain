import React, { Component } from 'react';
import './BasicPack.scss';
import BasicPackImg from './BasicPack.png';


class BasicPack extends Component {
    constructor(props) {
        super(props);
    }
        
    render() {
        return( 
            <div>
                <div className="basic-pack">
                     <button className="popupbtn">   
                   <img src= {BasicPackImg} className="pack-of-cards" alt="Pack-of-Cards"/>
                     </button>
                </div>
                
           </div>
        )
    }
}

export default BasicPack;