import React, { Component } from 'react';
import './components/card/Card.scss';
import './components/styles/text.scss';
import './App.scss';
import Footer from './components/footer/Footer';
import TradingContainer from './components/trade/tradingContainer';
import MyCardsContainer from './components/mycards/MyCardsContainer';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import ProposePopup from './components/modal/proposeTradePopUp';
import Checkmark from './components/loader/Checkmark';
import Dashboard from './components/dashboardPopUP/Dashboard';
import Ledger from './components/ledgers/Ledger';

const userGetKards = `/kards/user`;
const joeGetKards = `/kards/joe`;
const getBalance = `/balance/user`; // joe balance should always be the same as the user's

// History endpoints. /user vs /joe determines which node to talk to
const userLedgerHistory = "/history/all/user";
const joeLedgerHistory = "/history/all/joe";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myKards: {},
            joeKards: {},
            myProposedCard: [],
            joeProposedCard:[],
            ether: '',
            visible: true,
            myLedger: {},
            joeLedger: {},
            consortia: "",
            environment: "",
            locale: "",
            contractAddress: "",
        };
        this.getLaunchData();
    }

    getLaunchData() {
        window.fetch("/launch", {
            method: "GET"
        }).then((results) => {
            if (!results.ok) {
                console.log("Error while getting backend data");
                console.log(results);
            }
            return results.json();
        }).then((response) => {
            if (response.error) {
                alert(response.error);
                return;
            }
            this.setState({consortia: response.consortia,
            environment: response.environment,
            locale: response.locale,
            contractAddress: response.contractAddress});

            this.refreshKards();
        });
    }

    collectCards(card) {
        let cardId= parseInt(card.id);

        if (this.state.myKards.kards[cardId]) {
            this.setState({
                myProposedCard: this.state.myKards.kards[cardId]
            });

            this.setState(prevState=> {
                let myCardsNow= prevState.myKards;
                delete this.state.myKards.kards[cardId];
                return this.state.myKards;
            });
            //This is getting rid of the card in the container as you drag it to the trading container

        } else if (this.state.joeKards.kards[cardId]) {
            this.setState({
                joeProposedCard: this.state.joeKards.kards[cardId]
            });

            this.setState(prevState=> {
                let joeCardsNow= prevState.joeKards;
                delete this.state.joeKards.kards[cardId];
                return this.state.joeKards;
            });
            //This is getting rid of the card in the container as you drag it to the trading container
        }
    }

    emptyTradeCards() {
      this.setState({
        myProposedCard: [],
        joeProposedCard: []
      })

    }

    // Formats the ledger event data into a more usable format
    formatLedger(ledger) {
        let formattedLedger = {};
        if (ledger && ledger.events) {
            let addresses = {};
            addresses[ledger.addresses.joeAddress] = "Joe";
            addresses[ledger.addresses.userAddress] = "Me";

            formattedLedger["addresses"] = addresses;
            formattedLedger.blocks = [];
            let indexCounter = -1;
            let currentBlockNumber = -1;
            ledger.events.forEach((element) => {
                if (element.blockNumber !== currentBlockNumber) {
                    currentBlockNumber = element.blockNumber;
                    indexCounter++;
                }
                // For each returned event, we want to sort them by block number
                // If this is the first event in this block, let create a new array
                // otherwise just push the event into the array
                if (!formattedLedger.blocks[indexCounter]) {
                    formattedLedger.blocks[indexCounter] = [];
                }
                formattedLedger.blocks[indexCounter].push(element);
            });
            let kaleidoInfo = {};
            kaleidoInfo.consortia = this.state.consortia;
            kaleidoInfo.environment = this.state.environment;
            kaleidoInfo.locale = this.state.locale;
            formattedLedger.kaleidoInfo = kaleidoInfo;
        }

        return formattedLedger;
    }

    refreshLedgers() {
        window.fetch( userLedgerHistory, {
            method: "GET",
            headers: {
                'content-type': 'application/json'
            }
        }).then(results => {
            return results.json();
        }).then(resultBody => {
            this.setState({myLedger: this.formatLedger(resultBody)});
        });

        window.fetch( joeLedgerHistory, {
            method: "GET",
            headers: {
                'content-type': 'application/json'
            }
        }).then(results => {
            return results.json();
        }).then(resultBody => {
            this.setState({joeLedger: this.formatLedger(resultBody)});
        });
    }

    refreshKards() {
        window.fetch( userGetKards, {
            method: "GET",
            headers: {
                'content-type': 'application/json'
            }
        }).then(results => {
            return results.json();
        }).then(resultBody => {
            this.setState({myKards: resultBody});
            this.refreshLedgers();
        });

        window.fetch( joeGetKards, {
            method: "GET",
            headers: {
                'content-type': 'application/json'
            }
        }).then(results => {
            return results.json();
        }).then(resultBody => {
            this.setState({joeKards: resultBody});
            this.refreshLedgers()
        });

        window.fetch( getBalance, {
            method: "GET",
            headers: {
                'content-type': 'application/json'
            }
        }).then(results => {
            return results.json();
        }).then(resultBody => {
            this.setState({ether: resultBody.balance})
        });
    }

    clickOut() {
        this.setState({visible:false})
    }

    render() {
        //TODO: change h1/h2
        return (
          <div>
            <Dashboard  visible={this.state.visible} click={this.clickOut.bind(this)}/>
            <div>
              <div className="square-container">
                <div className="my-cards">
                    <h2>My Cards</h2>
                       <MyCardsContainer data={this.state.myKards} trade={(card)=>this.collectCards(card)}/>
                  </div>

                <div classname="middle-container">
                    <ProposePopup 
                        myKards={this.state.myProposedCard} joeKards={this.state.joeProposedCard} refresh={this.refreshKards.bind(this)}
                        empty={this.emptyTradeCards.bind(this)}
                        smartContractAddress={this.state.contractAddress}
                    />
                </div>
                  <div className="other-players-cards">
                <h2>Joe's Cards</h2>
                  <TradingContainer moredata={this.state.joeKards} trade={(card) => this.collectCards(card)}/>
                </div>
              </div>
            </div>
            <div className="middle-white-container">
                <div className="my-ledger">
                    <Ledger ledger={this.state.myLedger}/>
                </div>

                <div className="the-ether-count">
                <div className="ether-left">{this.state.ether}</div>
                <h3 className="ether-text"> Ether </h3>
                </div>

                <div className="joe-ledger">
                    <Ledger ledger={this.state.joeLedger}/>
                </div>
            </div>
            <Checkmark/>
            <Footer refreshKards={this.refreshKards.bind(this)}/>
          </div>
        );
    }
}

export default  DragDropContext(HTML5Backend) (App);
