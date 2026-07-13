import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { logoutUser } from '../../slices/thunks';
import { getLoggedinUser } from '../../helpers/api_helper';

//import images
import avatar1 from "../../assets/images/users/avatar-1.jpg";

const ProfileDropdown = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const profiledropdownData = createSelector(
        (state) => state.Login,
        (state) => ({ employee: state.user?.employee })
    );
    const { employee: reduxEmployee } = useSelector(profiledropdownData);
    // Falls back to sessionStorage since a hard page reload resets Redux
    // state but the session (and useProfile()'s auth guard) stays valid.
    const employee = reduxEmployee || getLoggedinUser()?.employee;

    const [isProfileDropdown, setIsProfileDropdown] = useState(false);
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <React.Fragment>
            <Dropdown isOpen={isProfileDropdown} toggle={toggleProfileDropdown} className="ms-sm-3 header-item topbar-user">
                <DropdownToggle tag="button" type="button" className="btn">
                    <span className="d-flex align-items-center">
                        <img className="rounded-circle header-profile-user" src={avatar1}
                            alt="Header Avatar" />
                        <span className="text-start ms-xl-2">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{employee?.name || 'Account'}</span>
                            <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">{employee?.role}</span>
                        </span>
                    </span>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                    <h6 className="dropdown-header">Welcome {employee?.name}!</h6>
                    <div className="dropdown-divider"></div>
                    <DropdownItem onClick={handleLogout}>
                        <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
                        <span className="align-middle">Logout</span>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default ProfileDropdown;
