import React, { Component, Fragment } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Layout, Button, Menu, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import Auth from '../Auth';

const { Header } = Layout;

const menu = (
  <Menu>
    <Menu.Item>
      <Link to="/admin/vehicles-add">
        Add Vehicle
      </Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/admin/vehicles-search">
        Vehicles Search
      </Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/admin/vehicle-types">
        Vehicle Types
      </Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/admin/reservations">
        Vehicle Reservations
      </Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/admin/users">
        Users
      </Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/admin/locations">
        Locations
      </Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/admin/parameter-infos">
        Rates Information
      </Link>
    </Menu.Item>
  </Menu>
);

class Nav extends Component {
  
  logout = () => {
    const { history } = this.props;
    Auth.deauthenticateUser();
    history.push('/login');
  }

  render() {
    return (
      <Header style={{backgroundColor: '#D3D3D3', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent:'start'}}>
        <h4 style={{alignSelf: 'left', paddingRight: '5px'}} >Rent-A-Car</h4>
        {Auth.getUserRole()==='Admin'&&
          <Fragment>
            <Dropdown overlay={menu} >
              <Button style={{marginLeft: '5px', alignSelf: 'left'}} onClick={e => e.preventDefault()} >
                Admin Tools <DownOutlined />
              </Button>
            </Dropdown>
          </Fragment>
        }
        {Auth.isAuthorizedAs('Customer')&& !Auth.isMembershipExpired() && (
          <Fragment>
            <Button type="link" style={{alignSelf: 'left'}} href="/locations">Locations</Button>
            <Button type="link" style={{alignSelf: 'left'}} href="/vehicles-search">Vehicles</Button>
            <Button type="link" style={{alignSelf: 'left'}} href="/payment/">Payment</Button>
            <Button type="link" style={{alignSelf: 'left'}} href="/reservations/">Reservations</Button>
            <Button type="link" style={{alignSelf: 'left'}} href="/user-profile">User Profile</Button>
          </Fragment>
        )}
        <div style={{flex: 'auto'}}></div>
        {Auth.isUserAuthenticated() &&<Button onClick={this.logout} style={{alignSelf: 'right'}}>logout</Button>}
      </Header>
    );
  }
}

export default withRouter(Nav);