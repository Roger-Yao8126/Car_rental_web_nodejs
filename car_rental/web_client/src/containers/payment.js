import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import moment from 'moment';
import _ from 'lodash';
import gql from 'graphql-tag';
import Promise from 'bluebird';
import { Form, Button, Input, Card, Checkbox } from 'antd';

const userQuery = gql`
  query getUserInfo {
    userbytoken {
      reservation {
        vehicle {
          make
          model
        }
        id
        start_time
        end_time
        normal_price
        status
      }
      username
      credit_card_info {
        credit_card_number
        card_holder_name
        billing_address
        exp_date
      }
    }
  }
`;

const unpaidReservationQuery = gql`
query fetchReservations {
  search_user_reservations(
    status: "unpaid"
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

const payReservationMutation = gql`
  mutation user_pay_reservation($id: String!) {
    user_pay_reservation(id: $id) {
      id
      status
    }
  }
`;

const deleteReservationMuation = gql`
mutation delReservation($id: String!) {
  delReservation(id: $id) {
    vehicle {
      make
      model
    }
    id
    start_time
    end_time
    normal_price
    status
  }
}
`;

class Payment extends Component {
  state = {
    reservations: null,
    card: null,
  };
  onChange = (reservation) => () => {
    const reservations = this.state.reservations;
    reservation.checked = !reservation.checked;
    console.log('reservation.checked>>>' + reservation.checked);
    const index = _.findIndex(reservations, function (o) {
      return o.id === reservation.id;
    });
    if(index !== -1) {
      reservations[index] = reservation;
    }
    reservations[index] = reservation;
    this.setState({ reservations: reservations });
  };

  handleSubmit = (values) => {
    const { history } = this.props;
    const reservations = _.filter(this.state.reservations, r => r.checked=== true);
    const untouchedReservations = _.filter(this.state.reservations, r => r.checked!== true);
    console.log('reservation in submit>>>', reservations);
    const promises = [];
    _.forEach(reservations, (r) => {
      const promise = this.props.client.mutate({
        mutation: payReservationMutation,
        variables: {
          id: r.id,
        },
      });
      promises.push(promise);
    });
    return Promise.all(promises)
    .then(() => {
      this.setState({
        reservations: untouchedReservations
      }, () => {
        history.push('/reservations')
      })
    })
  };

  componentDidMount() {
    // const { match } = this.props;
    // const cardId = match.params.card_id;
    return Promise.all([
      this.props.client
      .query({
        query: userQuery,
      }),
      this.props.client.query({
        query: unpaidReservationQuery,
      })
    ])
    .spread((res1, res2) => {
      console.log('res1 is >>>', res1);
      console.log('res2 is >>>', res2);

      this.setState({
        reservations: res2.data.search_user_reservations,
        card: res1.data.userbytoken.credit_card_info,
      });
    });
  }

  deleteReservation = (reservation) => () => {
    this.props.client.mutate({
      mutation: deleteReservationMuation,
      variables: {id: reservation.id}
    })
    .then(res => {
      console.log("res is >>>", res);
      let reservations = this.state.reservations;
      reservations = _.filter(reservations, r => r.id !== reservation.id);
      this.setState({
        reservations,
      })
    })
  }

  render() {
    const { card } = this.state;
    const { reservations } = this.state;

    console.log('card >>>', card);
    console.log('reservation >>>', reservations);
    return card ? (
      <div className="container" style={{minHeight: '100vh'}}>
        <h4>Unpaid Reservations</h4>
        <div className="row">
          {_.map(reservations, (reservation) => (
            <div className="col col-4">
              <Card title="Reservation" bordered={false} style={{ width: 300 }}>
                <div className="site-card-border-less-wrapper" style={{marginLeft: 'auto', marginRight: 'auto'}}>
                  
                    <div style={{textAlign: 'left'}}>
                      <p>
                        <b>
                        {reservation.vehicle.make + ' ' + reservation.vehicle.model}
                        </b>
                      </p>
                      <p><b>Start Time: </b>{`${moment(moment.utc(reservation.start_time)).local().format('YYYY-MM-DD h:mm:ss')}`}</p>
                      <p><b>End Time: </b>{` ${moment(moment.utc(reservation.end_time)).local().format('YYYY-MM-DD h:mm:ss')}`}</p>
                      <p><b>Price: </b>{_.round(reservation.normal_price, 2)}</p>
                      <p><b>Status: </b>{`${reservation.status}`}</p>
                      <Checkbox
                        onChange={this.onChange(reservation)}
                        checked={reservation.checked}
                      >
                        Select to Pay
                      </Checkbox>
                      <Button onClick={this.deleteReservation(reservation)}>Delete</Button>
                    </div>
                  
                </div>
              </Card>
            </div>
            ))}
        </div>
        <div className="row" style={{marginTop: '20px'}}>
          <div className="col col-4 offset-4">
              <Card title="Payment Method" bordered={false} style={{ width: 300, }}>
                <p>{card.card_holder_name}</p>
                <p>{card.credit_card_number}</p>
                <p>{card.billing_address}</p>
                <p>{card.exp_date}</p>
                <Form
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 14 }}
                  layout="horizontal"
                  size="middle"
                  onFinish={this.handleSubmit}
                >
                  <Form.Item label="CVV" name="CVV">
                    <Input />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

          </div>
        </div>
      </div>
    ) : (
      <div>Loading...</div>
    );
  }
}
export default withRouter(withApollo(Payment));
