import React, { Component } from 'react';
import Promise from 'bluebird';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import {
  Form,
  Input,
  Button,
  Card,
  Select
} from 'antd';
import { openNotificationWithIcon } from '../../utils';
const { Option } = Select;

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 22,
  },
};

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

const fetchVehicle =  gql`
  query GetVehicle($id: String!) {
    vehicle(id: $id) {
      id,
      vehicle_type {
        name
      },
      default_hourly_rate,
      make,
      model,
      year,
      registration_tag,
      current_mileage,
      condition,
      capacity,
      images,
      location {
        location_id: id,
        name,
        address,
        capacity,
        geo {
          type,
          coordinates
        }
      },
      last_service_time,
      reservation {
        reservation_id:id,
        start_time,
        end_time,
        actual_start_time,
        actual_end_time,
        normal_price,
        penalty_fee,
        status
      },
      comments {
        comment_content,
        comment_time
      },
      is_available
    }
  }
`;

const updateVehicleMutation = gql`
  mutation updateVehicle(
    $id: String!
    $make: String
    $condition: String
    $registration_tag: String
    $location_id: String
  ){
    updateVehicle(
      id: $id
      make: $make
      condition: $condition
      registration_tag: $registration_tag
      location_id: $location_id
    )
    {
      id,
      make,
      condition
      registration_tag,
      location {
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
  }
`;

const delVehicleMutation = gql`
  mutation delVehicle(
    $id: String!
  ){
    delVehicle(
      id: $id
    )
    {
      id,
      make,
      registration_tag
    }
  }
`;

class VehicleAdminPage extends Component {
  state = {
    locations: [],
    vechile: null,
  }
  componentDidMount() {
    const { match } = this.props;
    return Promise.all([
      this.props.client.query({
        query: getAllLocationsQuery,
        variables: {}
      }),
      this.props.client.query({
        query: fetchVehicle,
        variables: {
          id: match.params.vehicle_id
        }
      })
    ])
    .spread((res1, res2) => {
      this.setState({
        
        locations: res1.data.searchLocations,
        vehicle: res2.data.vehicle,
      })
    })
  }

  handleSubmit = values => {
    const { vehicle } = this.state;
    console.log("values >>>", values);
    this.props.client.mutate({
      mutation: updateVehicleMutation,
      variables: {
        id: vehicle.id,
        make: values.make,
        condition: values.condition,
        registration_tag: values.registration_tag,
        location_id: values.location_id
      }
    })
    .then(res =>{
      openNotificationWithIcon('success', 'Vehicle Successfully Updated!', 'Vehicle Successfully Updated!');
      console.log("res is >>>", res);
    })
  }

  handleDelete = vehicle => () => {
    const { history } = this.props;
    this.props.client.mutate({
      mutation: delVehicleMutation,
      variables: {
        id: vehicle.id
      }
    })
    .then(res =>{
      console.log("res is >>>", res);
      history.push(`/admin/vehicles-search`);
    })
  }

  render() {
    const { vehicle } = this.state;
    return vehicle ? (
      <div className="container-fluid" style={{minHeight: '100vh'}}>
        <h4>Admin Vehicle Edit Page</h4>
        <div className="row">
          <div className="col-12">
            <Card
              key={vehicle.id}
              bordered={true}
              hoverable
              cover={<img alt="example" src={_.get(vehicle,['images', 0])} />}
              style={{textAlign: 'left', width: '400px', marginLeft: 'auto', marginRight: 'auto'}}
            >
              <p><b>TYPE:</b> {_.get(vehicle, ['vehicle_type', 'name'])}</p>
              <p><b>MAKE:</b> {vehicle.make}</p>
              <p><b>HOURLY RATE:</b> {vehicle.default_hourly_rate}</p>
              <p><b>MODEL:</b> {vehicle.model}</p>
              <p><b>YEAR:</b> {vehicle.year}</p>
              <p><b>REG TAG:</b> {vehicle.registration_tag}</p>
              <p><b>MILEAGE:</b> {vehicle.current_mileage}</p>
              <p><b>CONDITION:</b> {vehicle.condition}</p>
              <p><b>CAPACITY:</b> {vehicle.capacity}</p>
              <p><b>LOCATION:</b> {_.get(vehicle, ['location', 'name'])}</p>
              <Button onClick={this.handleDelete(vehicle)}>Delete</Button>
            </Card>
          </div>
          <div className="col-6 offset-3" style={{marginTop: '10px'}}>
            <Form
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 14 }}
              layout="horizontal"
              size="middle"
              onFinish={this.handleSubmit}
              initialValues={vehicle}
              style={{border: "1px solid #abaaad"}}
            >
              <h4>Edit Vehicle</h4>
              <Form.Item label="Car Make" name="make">
                <Input style={{width: '80%'}} />
              </Form.Item>
              <Form.Item label="Car Condition" name="condition">
                <Select placeholder="Select vehicle condition" style={{width: '80%'}}>
                  <Option value="new" key="new">new</Option>
                  <Option value="like new" key="like new">like new</Option>
                  <Option value="good" key="good">good</Option>
                  <Option value="acceptable" key="acceptable">acceptable</Option>
                  <Option value="need cleaning" key="need cleaning">need cleaning</Option>
                  <Option value="need maintenance" key="need maintenance">need maintenance</Option>
                  <Option value="need repair" key="need repair">need repair</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Location" name="location_id">
                <Select showSearch  placeholder="Select Location" allowClear style={{width: '80%'}}>
                  {_.map(this.state.locations, l =>(
                    <Option value={l.id} key={l.id}>{l.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Registration Tag" name="registration_tag">
                <Input style={{width: '80%'}} />
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
    ) : <div>Loading...</div>;
  }
}

export default withApollo(withRouter(VehicleAdminPage));