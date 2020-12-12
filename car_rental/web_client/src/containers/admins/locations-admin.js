import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import _ from 'lodash';
import gql from 'graphql-tag';
import {
  Form,
  Input,
  InputNumber,
  Button,
  List
} from 'antd';
import { openNotificationWithIcon } from '../../utils';

const getAllLocationsQuery = gql`
query serachLocations {
  searchLocations {
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

const addLocationMutation = gql`
  mutation addLocation(
    $name: String!
    $address: String!
    $capacity: Int!
    $lng: Float!
    $lat: Float!
  ){
    addLocation(
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

const deleteLocationMutation = gql`
mutation delLocation(
  $location_id: String!
){
  delLocation(
    location_id: $location_id
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
    offset: 10,
    span: 14,
  },
};

class AddLocation extends Component {
  state = {
    locations: []
  };

  componentDidMount() {
    this.props.client.query({
      query: getAllLocationsQuery,
      variables: {}
    })
    .then(res => {
      this.setState({
        locations: res.data.searchLocations,
      })
    })
  }

  handleDelete = item => () => {
    this.props.client.mutate({
      mutation: deleteLocationMutation,
      variables: {
        location_id: item.id
      },
    })
    .then(res => {
      console.log("res is >>>", res);
      const locations = _.remove(this.state.locations, l => {
        return l.id !== item.id;
      });
      this.setState({
        locations
      })
    })
  }

  handleSubmit = (values) => {
    this.props.client.mutate({
      mutation: addLocationMutation,
      variables: values
    })
    .then(res =>{
      console.log("res is >>>", res);
      const locations = this.state.locations;
      locations.push(res.data.addLocation);
      openNotificationWithIcon('success', 'Location Added!', 'Location Successfully Added!');
      this.setState({
        locations
      })
    })
  }

  goToLocationDetail = location => () => {
    const { history } = this.props;
    history.push(`/admin/locations/${location.id}`);
  }


  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col col-8">
            <Form
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 14 }}
              layout="horizontal"
              size="middle"
              style={{marginTop: '20px'}}
              onFinish={this.handleSubmit}
            >
              <h4>Add Location</h4>
              <Form.Item
                label="Location Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Please input location name!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Location Address"
                name="address"
                rules={[
                  {
                    required: true,
                    message: 'Please input location address!',
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Capacity"
                name="capacity"
                rules={[
                  {
                    required: true,
                    message: 'Please input capacity!',
                  },
                ]}
              >
                <InputNumber style={{width: '100%'}} />
              </Form.Item>
              <Form.Item
                label="Longitude"
                name="lng"
                rules={[
                  {
                    required: true,
                    message: 'Please input longitude!',
                  },
                ]}
              >
                <InputNumber style={{width: '100%'}} />
              </Form.Item>
              <Form.Item
                label="Latitude"
                name="lat"
                rules={[
                  {
                    required: true,
                    message: 'Please input latitude!',
                  },
                ]}
              >
                <InputNumber style={{width: '100%'}} />
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <div className="row">
          <div className="col col-10">
            <List
              style={{textAlign: 'left'}}
              itemLayout="horizontal"
              dataSource={this.state.locations}
              renderItem={item => (
                <List.Item  style={{border: "1px solid #abaaad", marginTop:'1px', textAlign: 'left'}}>
                  <List.Item.Meta
                    style={{marginLeft: '10px'}}
                    title={`Name: ${item.name}`}
                    description={`Address: ${item.address}`}
                  />
                  <Button style={{marginRight: '10px'}} onClick={this.goToLocationDetail(item)}>Edit Location</Button>
                  <Button style={{marginRight: '10px'}} onClick={this.handleDelete(item)}>Delete Location</Button>
                </List.Item>
              )}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withApollo(AddLocation);