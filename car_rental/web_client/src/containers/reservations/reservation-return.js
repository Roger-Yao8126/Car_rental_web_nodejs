import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import Promise from 'bluebird';
import gql from 'graphql-tag';
import {
  Form,
  Button,
  Input,
  DatePicker,
  Alert
} from 'antd';
const { TextArea } = Input;

const fetchReservation = gql`
query fetchReservation(
  $id: String!
){
  reservation(
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

const returnReservationMutation = gql`
mutation returnReservationMutation(
  $id: String!
  $actual_end_time: String!
  $comment: String
){
  user_return_car(
    id: $id
    actual_end_time: $actual_end_time,
    comment: $comment
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

class ReservationReturn extends Component { 
  state= {
    reservation: null,
    alert: null,
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

  returnReservation = values => {
    const { history } = this.props;
    this.props.client.mutate({
      mutation: returnReservationMutation,
      variables: {
        id: this.state.reservation.id,
        actual_end_time: values.actual_end_time,
        comment: values.comment
      }
    })
    .then(res => {
      console.log("res is >>>", res);
      this.setState({
        alert: 'success',
        reservation: null,
      });
      Promise.delay(2000).then(() => {
        history.push('/reservations');
      });
    })
    .catch(err => {
      console.log("err is >>>", err);
      this.setState({
        alert: 'error',
      })
    })
  }

  render() {
    const { reservation, alert , loading} = this.state;
    if(loading) {
      return <div>Loading...</div>;
    }
    return reservation ? (
      <div className="container" style={{minHeight: '100vh'}}>
        <div className="row">
          <div className="col col-8 offset-2">
            <Form
              style={{border: "1px solid #abaaad", marginTop: '20px'}}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              layout="horizontal"
              size="middle"
              onFinish={this.returnReservation}
            >
              <h4>Return Vehicle</h4>
              <Form.Item label="Actual End Time" name="actual_end_time">
                <DatePicker showTime style={{width: '80%'}}/>
              </Form.Item>
              <Form.Item label="Comment" name="comment">
                <TextArea style={{height: '170px', width: '80%'}} />
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
    ): (<div>
      {alert === 'success' && (
        <Alert
          message="Car returned successfully"
          description="An Admin will review and update the contract after inspecting your vehicle. Thank you!"
          type="success"
          showIcon
        />
      )}
    </div>);
  }
}

export default withApollo(ReservationReturn);