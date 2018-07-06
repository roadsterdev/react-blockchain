import React, { Component } from 'react';
import './Card.scss'; 
import { ItemTypes } from './Constant';
import PropTypes from 'prop-types';
import Star from './star.png';
import Diamond from './diamond.png';
import { DragSource } from 'react-dnd';


const cardSource = {

    beginDrag(props) {
        console.log('cardId', props);
    
        return {props}
    },

    endDrag(props, monitor, component) {
        if(!monitor.didDrop()) {
            return;
        }
        console.log("HERE", props);
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

        console.log(this.props);
    }

   renderCard() {

    const circle = {
        backgroundColor: 'white',
        width: '2rem',
        height: '2rem',
        borderRadius: '50%'
        }
    
    const triangle = {
        color: 'transparent',
        width: '0',
        height: '0',
        borderRight: '1rem solid transparent',
        borderLeft: '1rem solid transparent',
        borderBottom: '2rem solid white'
    }

    const square = {
        backgroundColor: 'white',
        width: '2rem',
        height: '2rem'
    }

    const star =
    {
        backgroundImage: `url(${Star})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '12rem',
        height: '12rem'
        
    }

    const diamond = {
        backgroundImage: `url(${Diamond})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '12rem',
        height: '12rem'
    }

        const color= ["#202CE0", "#51C2FA", "#F99243", "#EE34A8", "#00CD79"];
        const shapes = [circle, triangle, star, square, diamond];


    
        const styles = {
        width: '4rem',
        height: '6rem',
        borderRadius: '12px',
        backgroundColor: color[this.props.color],
        marginBottom: '20px'
        };
    
        return (
                <div className="card" style={styles}>
                    <div style= {shapes[this.props.shape]}
                ></div>
                </div>
        )
    }
    render() {
        console.log("render props", this.props);
        const {connectDragSource, isDragging} = this.props;
        const opacity = isDragging ? 0 : 1;
   
        
        return connectDragSource( 
            <div style={{ opacity }}>
                {this.renderCard()}
            </div>
            // <div className={`card ${color}`}>
            //     <div className={`${shape}`}></div> 
            // </div> 
        )
    }
}

// Card.propTypes = {
//     connectDragSource: PropTypes.func.isRequired,
//     isDragging: PropTypes.bool.isRequired
// };

export default DragSource(ItemTypes.CARD, cardSource, collect) (Card);
