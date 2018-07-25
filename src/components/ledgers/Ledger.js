import React, { Component } from 'react';
import './Ledger.scss';
import Block from './Block';
import ArrowImg from './arrow.png';
import ArrowLeftImg from './arrowLeft.png';

class Ledger extends Component{
    render() {
        return(
            <div className="ledger-container">
            {/* <img src={ArrowLeftImg} className="arrow-left"/> */}
              <Block/>
            {/* <img src={ArrowImg} className="arrow-right"/> */}
            </div>

        )
    }
}

export default Ledger;