import React, { Component } from 'react';
import './BlockPopup.scss';
import CancelBtn from './../buttons/CancelBtn';

const TRANSFER = "Transfer";
const ISSUE = "IssueKard";

class BlockPopup extends Component {

    blockText() {
        let block = this.props.blockInfo;
        let addresses = this.props.addresses;
        return block.map((item) => {
            let eventValues = item.returnValues;
            let eventType = "Type: " + item.event;
            let kardId = "Kard ID: " + eventValues.kardId;
            let txHash = "Transaction Hash: " + item.transactionHash;
            let eventInfo;

            if (item.event === TRANSFER) {
                let from = "From: " + addresses[eventValues.from];
                let to = "To: " + addresses[eventValues.to];

                eventInfo = <div><p className="event-text">{txHash}</p><p className="event-text">{eventType}</p><p className="event-text">{kardId}</p><p className="event-text">{from}</p><p className="event-text">{to}</p></div>
            } else if (item.event === ISSUE) {
                let owner = "Issued To: " + addresses[eventValues.owner]; //TODO: swap with name

                eventInfo = <div><p className="event-text">{txHash}</p><p className="event-text">{eventType}</p><p className="event-text">{kardId}</p><p className="event-text">{owner}</p></div>
            } else {
                console.log(eventType);
            }

            return (
                <div className="event-info">
                    {eventInfo}
                </div>
            )
        });
    }
    render() {
        let blockNumber = this.props.blockInfo[0].blockNumber;
        let blockHash = this.props.blockInfo[0].blockHash;
        let headerText = "Block #" + blockNumber;
        let kaleidoInfo = this.props.kaleidoInfo;
        let explorerLink = ".kaleido.io/block/" + blockNumber + "?consortia=" + kaleidoInfo.consortia + "&environment=" + kaleidoInfo.environment;
        let prefix = "https://explorer" + (kaleidoInfo.locale ? kaleidoInfo.locale : "");
        explorerLink = prefix + explorerLink;
        if(this.props.visible) {
        return(
            <div className="overlay">
                <div className="block-popup-container">
                  <CancelBtn onClick={this.props.cancel}/>
                <div className="block-info-text">
                    <h2>{headerText}</h2>
                    <a target="_blank" href={explorerLink}>View in Kaleido Explorer</a>
                    <p className="blockhash">{blockHash}</p>
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