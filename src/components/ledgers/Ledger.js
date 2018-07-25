import React, { Component } from 'react';
import './Ledger.scss';
import Block from './Block';
import ArrowImg from './arrow.png';
import ArrowLeftImg from './arrowLeft.png';

class Ledger extends Component{
    render() {
        return(
            <div className="ledger-container">
            <button className="arrow-left-button">
                <img src={ArrowLeftImg} className="arrow-left"/>
            </button>
              <Block/>
            <button className="arrow-right-button">
                <img src={ArrowImg} className="arrow-right"/>
            </button>
            </div>

        )
    }
}

export default Ledger;