import React, { Component } from 'react';
import './Card.scss'; 
import { ItemTypes } from './Constant';
import PropTypes from 'prop-types';
import Star from './star.png';
import Diamond from './diamond.png';
import { DragSource } from 'react-dnd';


const cardSource = {

    beginDrag(props) {
    
        return {props}
    },

    endDrag(props, monitor, component) {
        if(!monitor.didDrop()) {
            return;
        }
        return props.tradeCards(props);
    }
}


function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
}

class Card extends Component {
    constructor(props) {
        super(props);
    }

   renderCard() {


        const color= ["#202CE0", "#F99243", "#51C2FA", "#EE34A8", "#00CD79"];
        const shapes = ['circle','square','diamond','triangle','star'];
        const effects = ['','fade-effect', 'flashing-effect','shaking-effect', 'wobbling-effect'];



    
        const styles = {
        width: '4rem',
        height: '6rem',
        borderRadius: '12px',
        backgroundColor: color[this.props.color],
        marginBottom: '20px'
        };

        const { effect, shape} = this.props;
        if(!shape || !this.props.color) return null;
   
        return (
                <div className="card" style={styles}>

                    <div className={`${shapes[parseInt(shape)]} ${effect ? effects[parseInt(effect)]: null}`}></div>
                </div>
        )
    }
    render() {

        const {connectDragSource, isDragging} = this.props;
   
        
        return connectDragSource( 
            <div>
                {this.renderCard()}
            </div>
        )
    }
}

export default DragSource(ItemTypes.CARD, cardSource, collect) (Card);
