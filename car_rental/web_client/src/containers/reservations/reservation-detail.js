import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import moment from 'moment';
import _ from 'lodash';
import gql from 'graphql-tag';
import {
  Card,
  Descriptions,
} from 'antd';

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
      images,
      location {
        name
      }
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

class ReservationDetail extends Component { 
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
              <p><b>USER :</b> {_.get(reservation, ['user', 'email'])}</p>
              <p><b>Proposed Start Time :</b> { moment(moment.utc(reservation.start_time)).local().format('YYYY-MM-DD h:mm:ss')}</p>
              <p><b>Proposed End Time :</b> {moment(moment.utc(reservation.end_time)).local().format('YYYY-MM-DD h:mm:ss')}</p>
              <p><b>Actual Start Time :</b> { reservation.actual_start_time ? moment(moment.utc(reservation.actual_start_time)).local().format('YYYY-MM-DD h:mm:ss'): 'N/A'}</p>
              <p><b>Actual End Time :</b> { reservation.actual_end_time ? moment(moment.utc(reservation.actual_end_time)).local().format('YYYY-MM-DD h:mm:ss'): 'N/A'}</p>
              <p><b>Regular Price :</b> ${_.round(reservation.normal_price, 2)}</p>
              <p><b>Penalty Fee :</b> ${_.round(reservation.penalty_fee, 2)}</p>
              <p><b>Status :</b> {reservation.status}</p>
              <p><b>User Comment :</b> {reservation.comment}</p>
              <p><b>Admin Note :</b> {reservation.admin_note}</p>
            </Card>
          </div>
          <div className="col col-6">
            <h4>Vehicle Detail</h4>
            <Card 
              key={reservation.id}
              hoverable
              cover={<img alt="example" src={_.get(reservation.vehicle,['images', 0])} height="300px" />}
              bordered={true}
              style={{textAlign: 'left'}}
            >
              <Descriptions title="Vehicle Info">
                <Descriptions.Item label={<b>TYPE</b>}>{_.get(reservation.vehicle, ['vehicle_type', 'name'])}</Descriptions.Item>
                <Descriptions.Item label={<b>MAKE</b>}>{reservation.vehicle.make}</Descriptions.Item>
                <Descriptions.Item label={<b>HOURLY RATE</b>}>{reservation.vehicle.default_hourly_rate}</Descriptions.Item>
                <Descriptions.Item label={<b>MODEL</b>}>{reservation.vehicle.model}</Descriptions.Item>
                <Descriptions.Item label={<b>YEAR</b>}>
                  {reservation.vehicle.year}
                </Descriptions.Item>
                <Descriptions.Item label={<b>REG TAG</b>}>{reservation.vehicle.registration_tag}</Descriptions.Item>
                <Descriptions.Item label={<b>MILEAGE</b>}>{reservation.vehicle.current_mileage}</Descriptions.Item>
                <Descriptions.Item label={<b>CONDITION</b>}>{reservation.vehicle.condition}</Descriptions.Item>
                <Descriptions.Item label={<b>CAPACITY</b>}>{reservation.vehicle.capacity}</Descriptions.Item>
                <Descriptions.Item label={<b>LOCATION</b>}>{_.get(reservation.vehicle, ['location', 'name'])}</Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </div>
      </div>
    ): <div></div>;
  }
}

export default withApollo(ReservationDetail);