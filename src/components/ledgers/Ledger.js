import React, { Component } from 'react';
import './Ledger.scss';
import Block from './Block';
import ArrowImg from './arrow.png';
import ArrowLeftImg from './arrowLeft.png';

class Ledger extends Component{
    constructor(props){
        super(props);
        this.firstBlockIndex = null;
        this.secondBlockIndex = null;
        this.thirdBlockIndex = null;
        this.updated = false;
    }

    scrollRight(){
        let len = 0;
        // if the last one is already shown, we cant scroll anymore
        if (this.props.ledger && this.props.ledger.blocks.length) {
            len = this.props.ledger.blocks.length
        } else {
            return;
        }

        if (this.thirdBlockIndex === null || len-1 === this.thirdBlockIndex) {
            //cant increment
            return;
        } else {
            this.firstBlockIndex++;
            this.secondBlockIndex++;
            this.thirdBlockIndex++;
            this.updated = true;
            this.forceUpdate();
        }
    }
    
    //scroll left, into past
    scrollLeft() {
        let len = 0;
        // if the last one is already shown, we cant scroll anymore
        if (this.props.ledger && this.props.ledger.blocks.length) {
            len = this.props.ledger.blocks.length
        } else {
            return;
        }

        if (this.firstBlockIndex === null || this.firstBlockIndex === 0) {
            //cant increment
            return;
        } else {
            this.firstBlockIndex--;
            this.secondBlockIndex--;
            this.thirdBlockIndex--;
            this.updated = true;
            this.forceUpdate();
        }
    }

    render() {
        if (this.props.ledger && this.props.ledger.blocks) {
            if (this.props.ledger.blocks.length >= 3) {
                //complicated logic
                let blocks = this.props.ledger.blocks;
                let len = blocks.length;

                if (this.firstBlockIndex === null || !this.updated) {
                    this.thirdBlockIndex = len - 1;
                    this.secondBlockIndex = len - 2;
                    this.firstBlockIndex = len - 3;
                }
                this.updated = false;
                let firstBlock = blocks[this.firstBlockIndex] !== void 0 ? blocks[this.firstBlockIndex] : null ;
                let secondBlock = blocks[this.secondBlockIndex] !== void 0 ? blocks[this.secondBlockIndex] : null ;
                let thirdBlock = blocks[this.thirdBlockIndex] !== void 0 ? blocks[this.thirdBlockIndex] : null ;

                return (
                    <div className="ledger-container">
                        {/* <img src={ArrowLeftImg} className="arrow-left"/> */}
                        <Block block={firstBlock} />
                        <Block block={secondBlock} />
                        <Block block={thirdBlock} />
                        {/* <img src={ArrowImg} className="arrow-right"/> */}
                    </div>
                )

            } else {
                // less than two so return all
                return (<div className="ledger-container">
                    {this.props.ledger.blocks[0] ? <Block block={this.props.ledger.blocks[0]}/> : null}
                    {this.props.ledger.blocks[1] ? <Block block={this.props.ledger.blocks[1]}/> : null}
                        </div>)
            }

        } else {
            return(<div className="ledger-container"> NO BLOCKS </div>); //todo change me
        }
    }
}

export default Ledger;