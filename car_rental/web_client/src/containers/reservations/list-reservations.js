import React, { Component, Fragment } from 'react';
import { withApollo } from 'react-apollo';
import moment from 'moment';
import _ from 'lodash';
import gql from 'graphql-tag';
import {
  Form,
  Button,
  List,
  Select,
  Avatar
} from 'antd';
import { openNotificationWithIcon } from '../../utils';

const fetchReservations = gql`
query fetchReservations(
  $status: String!
){
  search_user_reservations(
    status: $status
  )
  {
    id,
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
    }
    normal_price,
    penalty_fee,
    start_time,
    end_time,
    actual_start_time,
    actual_end_time,
    status
  }
}
`;

const cancelReservationMutation = gql`
mutation cancelReservationMutation(
  $id: String!
){
  cancel_reservation(
    id: $id
  )
  {
    id,
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
    }
    normal_price,
    penalty_fee,
    start_time,
    end_time,
    actual_start_time,
    actual_end_time,
    status
  }
}
`;

const pickUpReservationMutation = gql`
mutation pickupReservationMutation(
  $id: String!
  $actual_start_time: String!
){
  user_pickup_car(
    id: $id
    actual_start_time: $actual_start_time
  )
  {
    id,
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
    }
    normal_price,
    penalty_fee,
    start_time,
    end_time,
    actual_start_time,
    actual_end_time,
    status
  }
}
`;

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 24,
  },
};

const isWithin1Hr = (start_time)  => {
  return moment().add(1, 'hours').isAfter(moment(moment.utc(start_time)).local());
}

class ListReservations extends Component { 
  state= {
    status: 'paid',
    reservations: []
  }

  searchReservations = values => {
    console.log("values is >>>", values);
    this.props.client.query({
      query: fetchReservations,
      variables: {
        status: values.status,
      },
    })
    .then(res => {
      console.log("res is >>>", res);
      this.setState({
        reservations: res.data.search_user_reservations,
        status: values.status,
      }, () => {
        if (_.isEmpty(res.data.search_user_reservations)) {
          openNotificationWithIcon('warning', 'You do not have reservations.', 'You do not have reservations under this category!');
        } else {
          openNotificationWithIcon('success', 'Here are your reservations!', 'Here are your reservations!');
        }
      })
    })
  }

  cancelReservation = reservation => () => {
    this.props.client.mutate({
      mutation: cancelReservationMutation,
      variables: {
        id: reservation.id
      }
    })
    .then(() => {
      let { reservations } = this.state;
      reservations = _.filter(reservations, r => r.id !== reservation.id);
      this.setState({
        reservations,
      })
    })
  }

  pickupReservation = reservation => () => {
    this.props.client.mutate({
      mutation: pickUpReservationMutation,
      variables: {
        id: reservation.id,
        actual_start_time: moment().toISOString(),
      }
    })
    .then(() => {
      let { reservations } = this.state;
      reservations = _.filter(reservations, r => r.id !== reservation.id);
      this.setState({
        reservations,
      })
    })
  }

  returnReservation = reservation => () => {
    const { history } = this.props;
    history.push(`/reservations/${reservation.id}/return`);
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
      <div className="container-fluid" style={{minHeight: '100vh'}}>
        <div className="row">
          <div className="col col-6 offset-3">
            <Form
              style={{border: "1px solid #abaaad", marginTop: '30px'}}
              labelCol={{ span: 10 }}
              wrapperCol={{ span: 10 }}
              layout="horizontal"
              size="middle"
              initialValues={{status:this.state.status}}
              onValuesChange={this.resetReservation}
              onFinish={this.searchReservations}
            >
              <h4>Select Reservation Status</h4>
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
          <div className="col col-6 offset-3">
            <label>Got an unpaid reservation? Please go to <Button type="link" href="/payment/" style={{padding: '0px'}}>Payment</Button> and pay to reserve.</label>
          </div>
          <div className="col col-8 offset-2" style={{marginTop: '10px'}}>
            <h4>Reservations</h4>
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
                  {status==='paid'&& (
                    <Fragment>
                      {!isWithin1Hr(reservation.start_time) ? <Button onClick={this.cancelReservation(reservation)} type="primary" style={{marginRight: '5px', backgroundColor: 'red', color: 'white', borderColor: 'red'}}>Cancel</Button> :
                       <Button onClick={this.cancelReservation(reservation)} type="primary" style={{marginRight: '5px', backgroundColor: 'red', color: 'white', borderColor: 'red'}}>Cancel With Late Fee</Button> }
                      <Button onClick={this.pickupReservation(reservation)} style={{marginRight: '5px'}} type="primary">Pick Up</Button>
                    </Fragment>
                  )}
                  {status==='pickup'&&
                      <Button onClick={this.returnReservation(reservation)} style={{marginRight: '5px'}} type="primary">Return Car</Button>
                  }
                  {status!=='paid'&& (
                    <Button onClick={this.goToReservationDetail(reservation)} style={{marginRight: '5px'}}>Detail</Button>
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

export default withApollo(ListReservations);