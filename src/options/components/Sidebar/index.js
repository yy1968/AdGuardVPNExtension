import React from 'react';
import { NavLink } from 'react-router-dom';

import Rate from './Rate';
import './sidebar.pcss';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar__logo" />
            <nav className="sidebar__nav">
                <NavLink className="sidebar__link" exact activeClassName="sidebar__link--active" to="/">
                    Settings
                </NavLink>
                <NavLink className="sidebar__link" exact activeClassName="sidebar__link--active" to="/account">
                    Account
                </NavLink>
                <NavLink className="sidebar__link" exact activeClassName="sidebar__link--active" to="/about">
                    About
                </NavLink>
            </nav>
            <div className="sidebar__rate">
                <Rate />
            </div>
        </div>
    );
};

export default Sidebar;
