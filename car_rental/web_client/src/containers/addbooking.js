import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

const addBookingMutation = gql`
  mutation newBooking($vehicle_id: String!, $booking_price: Float!, $start_time: String!, $end_time:String!){
    newBooking(
      vehicle_id: $vehicle_id
      booking_price: $booking_price
      start_time: $start_time
      end_time:$end_time
    )
    {
      id,
      booking {
        id,
        booking_price
      }
    }
  }
`;

class AddBooking extends Component {
  state = {
    vehicle_id: "5e6488352bdbcfce4113feda",
    booking_price: 11.12,
    start_time: "2020-04-03 11:12:13",
    end_time:"2020-04-01 11:12:13"
  }
  
  handleSubmit = () => {
    this.props.client.mutate({
      mutation: addBookingMutation,
      variables: {
        vehicle_id: this.state.vehicle_id,
        booking_price: this.state.booking_price,
        start_time: this.state.start_time,
        end_time: this.state.end_time,
      }
    })
    .then(res =>{
      console.log("res is >>>", res);
    })
  }

  render() {
    return (
      <div>
        <button onClick={this.handleSubmit}>Submit</button>
      </div>
    );
  }
}

export default withApollo(AddBooking);