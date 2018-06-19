import React, { Component } from 'react';
import './Header.scss';
import './../styles/text.scss';



class Header extends Component {
    render() {
        return(
            <div className="dashboard-header">
                {/*<img src={HeaderImg} className="header-image" alt="header-image" /> */}
                <h1 className="primary-header">My Dashboard</h1>
            </div>
        )

    }

}

export default Header; 