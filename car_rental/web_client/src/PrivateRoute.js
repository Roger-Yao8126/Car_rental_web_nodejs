import React from 'react';
import {
  Route,
  Redirect
} from 'react-router-dom';

import Auth from './Auth';

const PrivateRoute = ({ component: Component, requiredRole, ...rest }) => (
  <Route {...rest} render={(props) => {
    if (Auth.isAuthorizedAs(requiredRole) === true) {
      return <Component {...props} />;
    } else if (Auth.isUserAuthenticated()) {
      console.log("Auth.isMembershipExpired()>>>", Auth.isMembershipExpired());
      return <Redirect to='/' />;
    } else {
      return (
        <Redirect
        to={{
          pathname: "/login",
          state: {
            fromUrl: props.location.pathname
          }
        }}
        />
      );
    }
  }} />
)

export default PrivateRoute;