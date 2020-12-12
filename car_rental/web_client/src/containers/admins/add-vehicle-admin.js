import React, { Component } from 'react';
import Promise from 'bluebird';
import { withApollo } from 'react-apollo';
import _ from 'lodash';
import gql from 'graphql-tag';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
} from 'antd';
import { openNotificationWithIcon } from '../../utils';
const { Option } = Select;

const fetchVehicleTypes = gql`
  query getVehicleTypes {
    vehicle_types {
      id,
      name
    }
  }
`;

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

const addVehicleMutation = gql`
  mutation addVehicle(
    $vehicle_type: String!
    $default_hourly_rate: Float!
    $make: String!
    $model: String!
    $year: Int!
    $registration_tag: String!
    $current_mileage: Float!
    $condition: String!
    $capacity: Int!
    $images: [String!]
  ){
    addVehicle(
      vehicle_type: $vehicle_type
      default_hourly_rate: $default_hourly_rate
      make: $make
      model: $model
      year: $year
      registration_tag: $registration_tag
      current_mileage: $current_mileage
      condition: $condition
      capacity: $capacity
      images: $images
    )
    {
      id,
      vehicle_type {
        id,
        name
      },
      default_hourly_rate,
      make,
    }
  }
`;

const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

class AddVehicle extends Component {
  state = {
    vehicle_types: []
  }

  componentDidMount() {
    return Promise.all([
      this.props.client.query({
        query: fetchVehicleTypes,
        variables: {}
      }),
      this.props.client.query({
        query: getAllLocationsQuery,
        variables: {}
      }),
    ])
    .spread((res, res2) => {
      this.setState({
        vehicle_types: res.data.vehicle_types,
        locations: res2.data.searchLocations,
      })
    })
  }

  handleSubmit = (values) => {
    this.props.client.mutate({
      mutation: addVehicleMutation,
      variables: {
        vehicle_type: values.vehicle_type,
        default_hourly_rate: values.default_hourly_rate,
        make: values.make,
        model: values.model,
        year: values.year,
        registration_tag: values.registration_tag,
        current_mileage: values.current_mileage,
        condition: values.condition,
        capacity: values.capacity,
        images: [values.images]
      }
    })
    .then(res =>{
      console.log("res is >>>", res);
      openNotificationWithIcon('success', 'Vehicle Successfully Added!', 'Vehicle Successfully Added!');
    })
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
          <Form.Item
            label="Vehicle Type"
            name="vehicle_type"
            rules={[
              {
                required: true,
                message: 'Please select vehicle type!',
              },
            ]}
          >
            <Select placeholder="Select vehicle type">
              {_.map(this.state.vehicle_types, t =>(
                <Option value={t.id} key={t.id}>{t.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Location"
            name="location_id"
            rules={[
              {
                required: true,
                message: 'Please select location!',
              },
            ]}
          >
            <Select showSearch  placeholder="Select Location" allowClear style={{width: '100%'}}>
              {_.map(this.state.locations, l =>(
                <Option value={l.id} key={l.id}>{l.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Default Hourly Rate"
            name="default_hourly_rate"
            rules={[
              {
                required: true,
                message: 'Please enter hourly rate!',
              },
            ]}
          >
            <InputNumber style={{width: '100%'}} />
          </Form.Item>
          <Form.Item
            label="Vehicle Make"
            name="make"
            rules={[
              {
                required: true,
                message: 'Please enter vehicle make!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Vehicle Model"
            name="model"
            rules={[
              {
                required: true,
                message: 'Please enter vehicle model!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Vehicle Year"
            name="year"
            rules={[
              {
                required: true,
                message: 'Please enter vehicle year!',
              },
            ]}
          >
            <InputNumber style={{width: '100%'}} />
          </Form.Item>
          <Form.Item
            label="Vehicle Registration Tag"
            name="registration_tag"
            rules={[
              {
                required: true,
                message: 'Please enter registration tag!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Current Mileage"
            name="current_mileage"
            rules={[
              {
                required: true,
                message: 'Please enter current mileage',
              },
            ]}
          >
            <InputNumber style={{width: '100%'}} />
          </Form.Item>
          <Form.Item
            label="Condition"
            name="condition"
            rules={[
              {
                required: true,
                message: 'Please select vehicle condition!',
              },
            ]}
          >
            <Select placeholder="Select vehicle condition">
              <Option value="new" key="new">new</Option>
              <Option value="like new" key="like new">like new</Option>
              <Option value="good" key="good">good</Option>
              <Option value="acceptable" key="acceptable">acceptable</Option>
              <Option value="need cleaning" key="need cleaning">need cleaning</Option>
              <Option value="need maintenance" key="need maintenance">need maintenance</Option>
              <Option value="need repair" key="need repair">need repair</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Capacity"
            name="capacity"
            rules={[
              {
                required: true,
                message: 'Please enter vehicle capacity!',
              },
            ]}
          >
            <InputNumber style={{width: '100%'}} />
          </Form.Item>
          <Form.Item
            label="Image URL"
            name="images"
            rules={[
              {
                required: true,
                message: 'Please enter vehicle image url!',
              },
            ]}
          >
            <Input />
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
    );
  }
}

export default withApollo(AddVehicle);