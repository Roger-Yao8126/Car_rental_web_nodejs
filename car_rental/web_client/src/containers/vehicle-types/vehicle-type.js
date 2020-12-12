import React, { Component } from 'react';
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

const vehicleTypeQuery = gql`
  query getVehicletype($id: String!){
    vehicle_type(
      id: $id
    )
    {
      id,
      name,
      hourly_rate
    }
  }
`;

const updateVehicleTypeMutation = gql`
  mutation updateVehicleType(
    $id: String!
    $name: String
    $hourly_rate: Float
  ){
    updateVehicleType(
      id: $id
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

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 24,
  },
};

class VehicleTypeDetail extends Component {
  state = {
    vehicleType: null,
  }

  componentDidMount() {
    const { match } = this.props;
    const vehicle_type_id = match.params.vehicle_type_id;
    this.props.client.query({
      query: vehicleTypeQuery,
      variables: { id: vehicle_type_id },
    })
    .then(res => {
      console.log("res is >>>", res);
      this.setState({
        vehicleType: res.data.vehicle_type
      })
    })
  }

  handleSubmit = values => {
    this.props.client.mutate({
      mutation: updateVehicleTypeMutation,
      variables: {
        id: this.state.vehicleType.id,
        name: values.name,
        hourly_rate: values.hourly_rate,
      },
    })
    .then(res => {
      console.log("res is >>>", res);
      openNotificationWithIcon('success', 'Vehicle type Updated!', 'Vehicle type Successfully Updated!');
      this.setState({
        vehicleType: res.data.updateVehicleType
      })
    })
  }

  render() {
    const { vehicleType } = this.state;
    return vehicleType ? (
      <div className="container" style={{minHeight: '100vh'}}>
        <div className="row">
          <div className="col col-8 offset-2" style={{marginTop: '40px'}}>
            <Form
              style={{border: '1px solid #abaaad', alignSelf: 'center'}}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              layout="horizontal"
              size="middle"
              initialValues={this.state.vehicleType}
              onFinish={this.handleSubmit}
            >
              <label>Update Vehicle Type Info</label>
              <Form.Item label="Name" name="name">
                <Input style={{width: '80%'}} />
              </Form.Item>
              <Form.Item label="Hourly Rate" name="hourly_rate">
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

export default withRouter(withApollo(VehicleTypeDetail));