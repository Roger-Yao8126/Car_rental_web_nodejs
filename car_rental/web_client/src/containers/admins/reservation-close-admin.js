import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import _ from 'lodash';
import gql from 'graphql-tag';
import {
  Card,
  Form,
  Button,
  Input,
  InputNumber
} from 'antd';
import { openNotificationWithIcon } from '../../utils';

const tailLayout = {
  wrapperCol: {
    offset: 1,
    span: 22,
  },
};

const fetchReservation = gql`
query fetchReservation(
  $id: String!
){
  reservation(
    id: $id
  )
  {
    reservation_id: id,
    vehicle {
      vehicle_id:id,
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
      images
    }
    user {
      user_id: id,
      email
    }
    normal_price,
    penalty_fee,
    start_time,
    end_time,
    actual_start_time,
    actual_end_time,
    status,
    comment,
    admin_note
  }
}
`;

const closeReservationMutation = gql`
mutation closeReservation(
  $id: String!
  $admin_note: String
  $normal_price: Float
  $penalty_fee: Float
){
  admin_close_reservation(
    id: $id
    admin_note: $admin_note
    normal_price: $normal_price
    penalty_fee: $penalty_fee
  )
  {
    id,
    start_time,
    end_time,
    normal_price
    penalty_fee
    actual_start_time
    actual_end_time
    status
    comment
    admin_note
    user {
      id,
      email
    }
  }
}
`;

class ReservationCloseAdmin extends Component { 
  state= {
    reservation: null,
    loading: true,
  }

  componentDidMount() {
    const { match } = this.props;
    const reservation_id = match.params.reservation_id;
    this.props.client.query({
      query: fetchReservation,
      variables: {
        id: reservation_id,
      },
    })
    .then(res => {
      console.log("res is >>>", res);
      this.setState({
        reservation: res.data.reservation,
        loading: false,
      })
    })
  }

  closeReservation = values => {
    this.props.client.mutate({
      mutation: closeReservationMutation,
      variables: {
        id: this.state.reservation.reservation_id,
        admin_note: values.admin_note,
        normal_price: values.normal_price,
        penalty_fee: values.penalty_fee
      }
    })
    .then(res => {
      console.log("res is >>>", res);
      openNotificationWithIcon('success', 'Reservation Closed!', 'Reservation Successfully Closed!');
    })
  }

  render() {
    const { reservation, loading} = this.state;
    if(loading) {
      return <div>Loading...</div>;
    }
    return reservation ? (
      <div className="container" style={{minHeight: '100vh'}}>
        <div className="row">
          <div className="col col-6">
            <h4>Reservation Detail</h4>
            <Card 
              key={reservation.reservation_id}
              hoverable
              title={`Status: ${_.capitalize(reservation.status)}`}
              bordered={true}
              style={{textAlign: 'left'}}
            >
              <p><b>USER</b> : {_.get(reservation, ['user', 'email'])}</p>
              <p><b>Proposed Start Time :</b> {reservation.start_time}</p>
              <p><b>Proposed End Time :</b> {reservation.end_time}</p>
              <p><b>Actual Start Time :</b> {reservation.actual_start_time}</p>
              <p><b>Actual End Time :</b> {reservation.actual_end_time}</p>
              <p><b>Regular Price :</b> ${reservation.normal_price}</p>
              <p><b>Penalty Fee :</b> ${reservation.penalty_fee}</p>
              <p><b>Status :</b> {reservation.status}</p>
              <p><b>User Comment :</b> {reservation.comment}</p>
              <p><b>Admin Note :</b> {reservation.admin_note}</p>
            </Card>
          </div>
          <div className="col col-6">
            <Form
              style={{border: "1px solid #abaaad", marginTop: '40px'}}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              layout="horizontal"
              size="middle"
              initialValues={this.state.reservation}
              onFinish={this.closeReservation}
            >
              <h4>Close Reservation</h4>
              <Form.Item label="Regular Price" name="normal_price">
                <InputNumber />
              </Form.Item>
              <Form.Item label="Penalty Fee" name="penalty_fee">
                <InputNumber />
              </Form.Item>
              <Form.Item label="Note to User" name="admin_note">
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
    ): <div></div>;
  }
}

export default withApollo(ReservationCloseAdmin);