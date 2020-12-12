import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import _ from 'lodash';
import gql from 'graphql-tag';
import {
  Form,
  Input,
  Button,
  InputNumber,
  List
} from 'antd';
import { openNotificationWithIcon } from '../../utils';

const fetchVehicleTypes = gql`
  query getVehicleTypes {
    vehicle_types {
      id,
      name,
      hourly_rate
    }
  }
`;

const addVehicleTypeMutation = gql`
  mutation addVehicleType(
    $name: String!
    $hourly_rate: Float!
  ){
    addVehicleType(
      name: $name
      hourly_rate: $hourly_rate
    )
    {
      id,
      name,
      hourly_rate
    }
  }
`;

const delVehicleTypeMutation = gql`
  mutation delVehicleType(
    $id: String!
  ){
    delVehicleType(
      id: $id
    )
    {
      id,
      name,
      hourly_rate
    }
  }
`;

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 24,
  },
};

class VehicleTypes extends Component { 
  state= {
    vehicle_types: []
  }
  
  componentDidMount() {
    this.props.client.query({
      query: fetchVehicleTypes,
      variables: {},
    })
    .then(res => {
      console.log("res is >>>", res);
      this.setState({
        vehicle_types: res.data.vehicle_types
      })
    })
  }

  goToVehicleType = item => () => {
    const { history } = this.props;
    history.push(`/admin/vehicle-types/${item.id}`);
  }

  handleSubmit = values => {
    this.props.client.mutate({
      mutation: addVehicleTypeMutation,
      variables: {
        name: values.name,
        hourly_rate: values.hourly_rate
      },
    })
    .then(res => {
      console.log("res is >>>", res);
      const vehicle_types = this.state.vehicle_types;
      vehicle_types.push(res.data.addVehicleType);
      this.setState({
        vehicle_types: vehicle_types
      }, () => {
        openNotificationWithIcon('success', 'Vehicle type Created!', 'Vehicle type Successfully Created!');
      })
    })
  }

  handleDelete = item => () => {
    console.log("item is >>>", item);
    this.props.client.mutate({
      mutation: delVehicleTypeMutation,
      variables: {
        id: item.id
      },
    })
    .then(res => {
      console.log("res is >>>", res);
      const vehicle_types = _.remove(this.state.vehicle_types, type => {
        return type.id !== item.id;
      });
      this.setState({
        vehicle_types: vehicle_types
      })
    })
  }

  render() {
    return (
      <div className="container" style={{minHeight: '100vh'}}>
        <div className="row">
          <div className="col col-8 offset-2">
            Vehicle Types
            <List
              style={{textAlign: 'left'}}
              itemLayout="horizontal"
              dataSource={this.state.vehicle_types}
              renderItem={item => (
                <List.Item style={{borderBottom: "1px solid #abaaad"}}>
                  <List.Item.Meta
                    title={item.name}
                  />
                  <Button onClick={this.goToVehicleType(item)} style={{marginRight: '5px'}}>Go To Detail</Button>
                  <Button onClick={this.handleDelete(item)}>Delete</Button>
                </List.Item>
              )}
            />
          </div>
          <div className="col col-8 offset-2">
            <Form
              style={{border: "1px solid #abaaad", marginTop: '10px'}}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              layout="horizontal"
              size="middle"
              onFinish={this.handleSubmit}
            >
              <label>Add Vehicle Type</label>
              <Form.Item
                label="Vehicle Type"
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Please enter enter vehicle type name!',
                  },
                ]}
              >
                <Input  style={{width: '100%'}}/>
              </Form.Item>
              <Form.Item
                label="Vehicle Hourly Rate"
                name="hourly_rate"
                rules={[
                  {
                    required: true,
                    message: 'Please enter enter vehicle hourly rate!',
                  },
                ]}
              >
                <InputNumber  style={{width: '100%'}}/>
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

export default withApollo(VehicleTypes);