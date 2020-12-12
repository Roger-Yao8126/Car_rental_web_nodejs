 
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import _ from 'lodash';
import gql from 'graphql-tag';
import { Form, Input, Button, InputNumber, Card, Select, Checkbox } from 'antd';

const userQuery = gql`
  query getUserInfo {
    userbytoken {
      reservation {
        vehicle {
          make
          model
        }
        start_time
        end_time
        normal_price
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

class Payment extends Component {
  onChange = (reservation) => () => {
    const reservations = this.state.reservations;
    reservation.checked = !reservation.checked;
    console.log('reservation.checked>>>' + reservation.checked);
    const index = _.findIndex(reservation, function (o) {
      return o._id === reservation._id;
    });
    reservations[index] = reservation;
    this.setState({ reservations: reservations });
  };

  handleSubmit = (reservations) => {};

  state = {
    reservation: null,
    card: null,
  };

  componentDidMount() {
    // const { match } = this.props;
    // const cardId = match.params.card_id;
    this.props.client
      .query({
        query: userQuery,
      })
      .then((res) => {
        console.log('res is >>>', res);
        var reservations = res.data.userbytoken.reservation;
        reservations = _.filter(reservations, (r) => r.status === 'unpaid');
        console.log('filtered res>>>', reservations);

        this.setState({
          reservations: res.data.userbytoken.reservation,
          card: res.data.userbytoken.credit_card_info,
        });
      });
  }

  render() {
    const { card } = this.state;
    const { reservations } = this.state;
    console.log('card >>>', card);
    console.log('reservation >>>', reservations);
    return card ? (
      <div>
        <Card title="Reservation" bordered={false} style={{ width: 300 }}>
          <div className="site-card-border-less-wrapper">
            {_.map(reservations, (reservation) => (
              <div>
                <p>
                  {reservation.vehicle.make + ' ' + reservation.vehicle.model}
                </p>
                <p>{reservation.start_time}</p>
                <p>{reservation.end_time}</p>
                <Checkbox
                  onChange={this.onChange(reservation)}
                  checked={reservation.checked}
                >
                  Select to Cancel
                </Checkbox>
              </div>
            ))}
          </div>
        </Card>
        <div className="site-card-border-less-wrapper">
          <Card title="Payment Method" bordered={false} style={{ width: 300 }}>
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
              <Form.Item label="Code" name="creditCode">
                <InputNumber />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    ) : (
      <div>Loading...</div>
    );
  }
}
export default withRouter(withApollo(Payment));