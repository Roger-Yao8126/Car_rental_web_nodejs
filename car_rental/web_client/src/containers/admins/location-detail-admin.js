import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import {
  Form,
  Input,
  Button,
  InputNumber
} from 'antd';
import { openNotificationWithIcon } from '../../utils';

const locationQuery = gql`
  query getLocation($id: String!){
    location(
      id: $id
    )
    {
      id,
      name,
      address,
      capacity,
      geo {
        type,
        coordinates
      }
    }
  }
`;

const updateLocationMutation = gql`
  mutation updateLocation(
    $id: String!
    $name: String
    $address: String
    $capacity: Int
    $lng: Float
    $lat: Float
  ){
    updateLocation(
      id: $id
      name: $name
      address: $address
      capacity: $capacity
      geo: [$lng, $lat]
    )
    {
      id,
      name,
      address,
      capacity,
      geo {
        type,
        coordinates
      }
    }
  }
`;

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 24,
  },
};

class LocationDetailAdmin extends Component {
  state = {
    location: null,
  }

  componentDidMount() {
    const { match } = this.props;
    const location_id = match.params.location_id;
    this.props.client.query({
      query: locationQuery,
      variables: { id: location_id },
    })
    .then(res => {
      console.log("res is >>>", res);
      const location = _.assign({}, res.data.location, {
        lng: _.get(res.data.location, ['geo','coordinates', 0]),
        lat: _.get(res.data.location, ['geo','coordinates', 1]),
      })
      this.setState({
        location: location
      })
    })
  }

  handleSubmit = location => {
    this.props.client.mutate({
      mutation: updateLocationMutation,
      variables: {
        id: this.state.location.id,
        name: location.name,
        address: location.address,
        capacity: location.capacity,
        lng: location.lng,
        lat: location.lat
      }
    })
    .then(res => {
      console.log("res is >>>", res);
      openNotificationWithIcon('success', 'Location Updated!', 'Location Successfully Updated!');
    })
  }

  render() {
    const { location } = this.state;
    return location ? (
      <div className="container" style={{minHeight: '100vh'}}>
        <div className="row">
          <div className="col col-8 offset-2" style={{marginTop: '40px'}}>
            <Form
              style={{border: '1px solid #abaaad', alignSelf: 'center'}}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              layout="horizontal"
              size="middle"
              initialValues={this.state.location}
              onFinish={this.handleSubmit}
            >
              <label>Update Location Info</label>
              <Form.Item label="Name" name="name">
                <Input style={{width: '80%'}} />
              </Form.Item>
              <Form.Item label="Address" name="address">
                <Input style={{width: '80%'}} />
              </Form.Item>
              <Form.Item label="Capacity" name="capacity">
                <InputNumber style={{width: '80%'}} />
              </Form.Item>
              <Form.Item label="Longitude" name="lng">
                <InputNumber style={{width: '80%'}} />
              </Form.Item>
              <Form.Item label="Latitude" name="lat">
                <InputNumber style={{width: '80%'}} />
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>

    ): <div>Loading...</div>;
  }
}

export default withRouter(withApollo(LocationDetailAdmin));