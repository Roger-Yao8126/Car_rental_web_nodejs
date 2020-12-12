import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Layout } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './App.css';

import PrivateRoute from './PrivateRoute';
import Header from './containers/header';
// regular or customer route component
import SearchVehicles from './containers/vehicles/search-vehicles';

import VehicleTypes from './containers/vehicle-types';
import VehicleTypeDetail from './containers/vehicle-types/vehicle-type';
import Login from './containers/login';
import Register from './containers/register';
import UserDetail from './containers/users/user-detail';
import Payment from './containers/payment';
import MembershipRenew from './containers/membership-renew';
import LocationMap from './containers/locations/location-map';
import VehicleDetailPage from './containers/vehicles/vehicle-detail';
import ListReservations from './containers/reservations/list-reservations';
import ReservationReturn from './containers/reservations/reservation-return';
import ReservationDetail from './containers/reservations/reservation-detail';

// admin route component 
import AddVehicleAdmin from './containers/admins/add-vehicle-admin';
import UsersAdmin from './containers/admins/users-search-admin';
import UserDetailAdmin from './containers/admins/user-detail-admin';
import LocationsAdmin from './containers/admins/locations-admin';
import LocationDetailAdmin from './containers/admins/location-detail-admin';
import ReservationsAdmin from './containers/admins/reservations-admin';
import VehicleDetailAdminPage from './containers/admins/vehicle-detail-admin';
import ParameterInfosAdminPage from './containers/admins/parameter-infos-admin';
import SearchVehiclesAdminPage from './containers/admins/search-vehicles-admin';
import ReservationCloseAdmin from './containers/admins/reservation-close-admin';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Layout>
            <Header />
            <Switch>
              {/* customer route or public route */}
              <PrivateRoute
                path="/"
                exact
                component={LocationMap}
                requiredRole="Customer"
              />
              <PrivateRoute
                exact
                path="/vehicles-search"
                component={SearchVehicles}
                requiredRole="Customer"
              />
              <PrivateRoute
                exact
                path="/vehicles/:vehicle_id"
                component={VehicleDetailPage}
                requiredRole="Customer"
              />

              <PrivateRoute
                exact path = "/user-profile"
                component={UserDetail}
                requiredRole="Customer"
              />
              
              <PrivateRoute
                exact
                path="/membership/renew"
                component={MembershipRenew}
                requiredRole="Customer"
              />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <PrivateRoute exact path="/locations" component = {LocationMap} requiredRole="Customer" />
              <PrivateRoute exact path="/reservations/" component={ListReservations} requiredRole="Customer" />
              <PrivateRoute exact path="/reservations/:reservation_id/return" component={ReservationReturn} requiredRole="Customer" />
              <PrivateRoute exact path="/reservations/:reservation_id/detail" component={ReservationDetail} requiredRole="Customer" />
              {/* admin route */}
              <PrivateRoute
                exact
                path="/admin/vehicles-add"
                component={AddVehicleAdmin}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/vehicles-search"
                component={SearchVehiclesAdminPage}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/vehicles/:vehicle_id"
                component={VehicleDetailAdminPage}
                requiredRole="Admin" 
              />
              <PrivateRoute
                exact
                path="/payment/"
                component={Payment}
                requiredRole="Customer"
              />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <PrivateRoute
                exact
                path="/locations"
                component={LocationMap}
                requiredRole="Customer"
              />

              {/* admin route */}
              <PrivateRoute
                exact
                path="/admin/vehicles/add"
                component={AddVehicleAdmin}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/vehicles/:vehicle_id"
                component={VehicleDetailAdminPage}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/vehicle-types"
                component={VehicleTypes}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/vehicle-types/:vehicle_type_id"
                component={VehicleTypeDetail}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/reservations"
                component={ReservationsAdmin}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/reservations/:reservation_id/close"
                component={ReservationCloseAdmin}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/users"
                component={UsersAdmin}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/users/:user_id"
                component={UserDetailAdmin}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/locations"
                component={LocationsAdmin}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/locations/:location_id"
                component={LocationDetailAdmin}
                requiredRole="Admin"
              />
              <PrivateRoute
                exact
                path="/admin/parameter-infos"
                component={ParameterInfosAdminPage}
                requiredRoles="Admin"
              />
            </Switch>
          </Layout>
        </Router>
      </div>
    );
  }
}
