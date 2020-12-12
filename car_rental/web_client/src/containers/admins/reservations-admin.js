import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import moment from 'moment';
import _ from 'lodash';
import gql from 'graphql-tag';
import {
  Form,
  List,
  Avatar,
  Button,
  Select,
} from 'antd';

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 24,
  },
};


const searchReservations = gql`
query searchReservations(
  $status: String!
) { 
  reservations(
    status: $status
  ) {
      id,
      start_time,
      end_time,
      normal_price
      penalty_fee
      actual_start_time
      actual_end_time
      status
      user {
        id,
        email
      }
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
  }
}
`;

class ReservationsAdmin extends Component { 
  state= {
    status: 'returned',
    reservations: []
  }

  searchReservations = values => {
    this.props.client.query({
      query: searchReservations,
      variables: {
        status: values.status,
      },
    })
    .then(res => {
      console.log("res is >>>", res);
      this.setState({
        reservations: res.data.reservations,
        status: values.status,
      })
    })
  }


  finalizeContract = contract => () => {
    console.log('contract is >>>', contract)
    const { history } = this.props;
    history.push(`/admin/reservations/${contract.id}/close`);
  }

  goToReservationDetail = reservation => () => {
    const { history } = this.props;
    history.push(`/reservations/${reservation.id}/detail`);
  }

  resetReservation = () => {
    this.setState({
      reservations: []
    })
  }

  render() {
    const { status } = this.state;
    return (
      <div className="container" style={{minHeight: '100vh'}}>
        <div className="row">
          <div className="col col-8 offset-2">
            <Form
              style={{border: "1px solid #abaaad", marginTop: '10px'}}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              layout="horizontal"
              size="middle"
              initialValues={{status:this.state.status}}
              onValuesChange={this.resetReservation}
              onFinish={this.searchReservations}
            >
              <label>Select Reservation Status</label>
              <Form.Item label="Reservation Status" name="status">
                <Select>
                  <Select.Option value="paid">Paid</Select.Option>
                  <Select.Option value="canceled">Canceled</Select.Option>
                  <Select.Option value="pickup">In Use</Select.Option>
                  <Select.Option value="returned">Returned</Select.Option>
                  <Select.Option value="closed">Closed</Select.Option>
                </Select>
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
          <div className="col col-8 offset-2">
            Reservations
            <List
              style={{textAlign: 'left'}}
              itemLayout="horizontal"
              dataSource={this.state.reservations}
              renderItem={reservation => (
                <List.Item style={{borderBottom: "1px solid #abaaad"}}>
                  <List.Item.Meta
                    title={`${reservation.vehicle.make} ${reservation.vehicle.model}`}
                    avatar={<Avatar src={_.get(reservation.vehicle,['images', 0])} />}
                    description={`Start Time: ${moment(moment.utc(reservation.start_time)).local().format('YYYY-MM-DD h:mm:ss')}`}
                  />
                  {status==='returned' && (
                    <Button onClick={this.finalizeContract(reservation)}>Inspect and Invoice</Button>
                  )}
                  {status!=='returned'&& (
                    <Button onClick={this.goToReservationDetail(reservation)}>Detail</Button>
                  )}
                </List.Item>
              )}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withApollo(ReservationsAdmin);