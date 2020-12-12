import _ from 'lodash';
import moment from 'moment';
class Auth {

  /**
   * Authenticate a user. Save a token string in Local Storage
   *
   * @param {string} token
   */
  static authenticateUser(token, role, membership_expiration_date) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('membership_expiration_date', membership_expiration_date);
  }

  /**
   * Check if a user is authenticated - check if a token is saved in Local Storage
   *
   * @returns {boolean}
   */
  static isUserAuthenticated() {
    return localStorage.getItem('token') !== null;
  }

  static getUserRole() {
    return localStorage.getItem('role');
  }

  static getUserMembershipExpirationDate() {
    return localStorage.getItem('membership_expiration_date');
  }

  static isAuthorizedAs(requiredRole) {
    if (!this.isUserAuthenticated()) {
      return false;
    }
    const assignedRole = localStorage.getItem('role');
    if(!assignedRole) return false;
    if(assignedRole === 'Admin') {
      return true;
    } else if (assignedRole === 'Staff') {
      if(_.includes(['Staff', 'Customer'], requiredRole)) {
        return true;
      } else {
        return false;
      }
    } else if (assignedRole === 'Customer') {
      if (requiredRole === 'Customer') {
        return true;
      } else {
        return false;
      }
    } else { //undefined role
      return false;
    }
  }

  static isMembershipExpired() {
    const membershipExpDate = localStorage.getItem('membership_expiration_date');
    if (!membershipExpDate) {
      return false;
    }
    const currentTime = moment();
    if (currentTime.isAfter(moment(membershipExpDate))) {
      return true;
    } else {
      return false;
    }
  }

  static isMembershipSoonExpired() {
    const membershipExpDate = localStorage.getItem('membership_expiration_date');
    if (!membershipExpDate) {
      return false;
    }
    const currentTime = moment().add(1, 'M');
    if (moment(currentTime).isAfter(moment(membershipExpDate))) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Deauthenticate a user. Remove a token from Local Storage.
   *
   */
  static deauthenticateUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('membership_expiration_date');
  }

  /**
   * Get a token value.
   *
   * @returns {string}
   */

  static getToken() {
    return localStorage.getItem('token');
  }

}

export default Auth;