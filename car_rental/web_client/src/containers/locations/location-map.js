import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import { Button } from 'antd';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

const getAllLocationsQuery = gql`
  query serachLocations {
    searchLocations {
      id
      name
      address
      capacity
      geo {
        type
        coordinates
      }
    }
  }
`;

export class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { stores: [] };
  }

  componentDidMount() {
    this.props.client
      .query({
        query: getAllLocationsQuery,
        variables: {},
      })
      .then((res) => {
        console.log('res is >>>', res);
        this.setState({
          stores: res.data.searchLocations,
        });
      });
  }

  goToCarSearch = (location) => () => {
    const { history } = this.props;
    history.push({
      pathname: '/vehicles-search',
      search: `?default_location=${location.id}`,
    });
  };

  displayMarkers = () => {
    return this.state.stores.map((store, index) => {
      return (
        <Marker
          key={index}
          id={index}
          position={{
            lat: store.geo.coordinates[1],
            lng: store.geo.coordinates[0],
          }}
          onClick={this.goToCarSearch(store)}
        />
      );
    });
  };

  render() {
    return (
      <div>
        <label>
          Don't have a particular location
          <Button type="link" href="/vehicles/search">
            Go To Car Search Directly
          </Button>
        </label>
        <Map
          google={this.props.google}
          zoom={8}
          style={mapStyles}
          initialCenter={{ lat: 37.335186, lng: -121.881073 }}
        >
          {this.displayMarkers()}
        </Map>
      </div>
    );
  }
}

const mapStyles = {
  width: '100%',
  height: '100%',
};

export default withApollo(
  GoogleApiWrapper({
    apiKey: 'AIzaSyBTs0GaUitU90wa6DrQTS2NAeTf-LnC4lc',
  })(MapContainer)
);
