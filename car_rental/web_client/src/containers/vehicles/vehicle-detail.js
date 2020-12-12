import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';
import {
  Form,
  Input,
  Button,
  Card,
  List,
  Modal,
  DatePicker,
  Avatar,
} from 'antd';

import Gallery from "react-photo-gallery";

import Auth from '../../Auth';
import { openNotificationWithIcon } from '../../utils';
import { selectReservation } from '../../redux/reservations';
const { TextArea } = Input;

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 22,
  },
};

const tailLayout2 = {
  wrapperCol: {
    offset: 0,
    span: 24,
  },
};

let allViews = Object.keys(Views).map(k => Views[k]);

const ColoredDateCellWrapper = ({ children }) =>
  React.cloneElement(React.Children.only(children), {
    style: {
      backgroundColor: 'lightblue',
    },
  })
const localizer = momentLocalizer(moment);

const fetchVehicle =  gql`
  query fetchVehicle($id: String!) {
    vehicle(id: $id) {
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
        location_id:id,
        name,
        address,
        capacity,
        geo {
          type,
          coordinates
        }
      },
      last_service_time,
      reservation {
        reservation_id:id,
        start_time,
        end_time,
        actual_start_time,
        actual_end_time,
        normal_price,
        penalty_fee,
        status
      },
      comments {
        comment_content,
        comment_time
      },
      is_available
    }
  }
`;

const addCommentMutation = gql`
  mutation addComment(
    $vehicle_id: String!
    $comment_content: String!
  ){
    addComment(
      vehicle_id: $vehicle_id,
      comment_content: $comment_content
    )
    {
      comment_id:id,
      comment_content,
      comment_time,
      user {
        user_id: id
      }
    }
  }
`;

const addUnpaidReservationMutation = gql`
  mutation addUnpaidReservationMutation($vehicle_id: String!, $start_time: String!, $end_time:String!){
    generate_unpaid_reservation(
      vehicle_id: $vehicle_id
      start_time: $start_time
      end_time:$end_time
    )
    {
      id,
      vehicle {
        vehicle_id: id
      }
      start_time
      end_time
    }
  }
`;

const checkReservationTimeAvailableQuery = gql`
query checkReservationTimeAvailable(
  $vehicle_id: String!
  $available_from: String!
  $available_to: String!
) {
  checkReservationTimeAvailable(
    vehicle_id: $vehicle_id
    available_from: $available_from
    available_to: $available_to
  )
}
`;

const fetchSimilarVehicles = gql`
  query getVehicles(
    $make: String,
    $available_from: String,
    $to: String,
  ) {
    vehicles(
      make:$make,
      available_from: $available_from,
      to: $to,
      is_active: true
    ) {
      vehicle_id: id,
      default_hourly_rate,
      vehicle_type {
        vehicle_type_id: id,
        name
      },
      make,
      model,
      year,
      images,
      condition,
      capacity,
      current_mileage,
      location {
        name
      },
      registration_tag
    }
  }
`;

const getPhotos = images => {
  return _.map(images, image => {
    return {
      src: image,
      width: 4,
      height: 3
    }
  })
}

class VehicleDetailPage extends Component {

  state = {
    vehicle: null,
    error: null,
    similarVehicles: [],
    showSimilarCarModal: false,
  };

  componentDidMount() {
    const { match } = this.props;
    this.props.client.query({
      query: fetchVehicle,
      variables: {
        id: match.params.vehicle_id
      }
    })
    .then(res => {
      console.log("res is >>>", res);
      this.setState({
        vehicle: res.data.vehicle
      })
    })
  }

  addComment = values => {
    this.props.client.mutate({
      mutation: addCommentMutation,
      variables: {
        comment_content: values.comment_content,
        vehicle_id: this.props.match.params.vehicle_id
      }
    })
    .then(res =>{
      console.log("res is >>>", res);
      const {vehicle} = this.state;
      vehicle.comments = [].concat(vehicle.comments);
      vehicle.comments.push(res.data.addComment);
      this.setState({vehicle: vehicle})
    })
  }

  addReservation = () => {
    const { history } = this.props;
    this.props.client.mutate({
      mutation: addUnpaidReservationMutation,
      variables:  {
        vehicle_id: this.props.reservations.reservation.vehicle_id,
        start_time: this.props.reservations.reservation.start_time && this.props.reservations.reservation.start_time,
        end_time: this.props.reservations.reservation.end_time && this.props.reservations.reservation.end_time,
      }
    })
    .then(res => {
      console.log("res is >>>", res);
      history.push('/payment/');
    })
  }

  storeReservation = values => {
    const reservation = {
      vehicle_id: this.props.match.params.vehicle_id,
      start_time: values.start_time && values.start_time.toISOString(),
      end_time: values.end_time && values.end_time.toISOString(),
    };
    this.props.client.query({
      query: checkReservationTimeAvailableQuery,
      variables: {
        vehicle_id: reservation.vehicle_id,
        available_from: reservation.start_time,
        available_to: reservation.end_time
      }
    })
    .then(res => {
      console.log("res is >>>",res);
      const isAvailable = res.data.checkReservationTimeAvailable;
      if (isAvailable) {
        openNotificationWithIcon('success', 'Congratulations!', 'It looks like your vehicle is available at the selected time.');
        this.props.selectReservation(reservation);
      } else {
        return this.props.client.query({
          query: fetchSimilarVehicles,
          variables: {
            make: this.state.vehicle.make,
            available_from: reservation.start_time,
            to: reservation.end_time,
          }
        })
        .then(res => {
          console.log("res is >>>",res);
          this.setState({
            similarVehicles: res.data.vehicles,
            showSimilarCarModal: true,
          })
        })
      }
    })
  }

  checkValues = (changedValues, allValues) => {
    const start_time = allValues.start_time;
    const end_time = allValues.end_time;
    if(!start_time || !end_time) {
      this.setState({
        error: null,
      })
    }
    if(moment(start_time).add(3, 'days') < moment(end_time)) {
      // booking is more than 72 hours long
      this.setState({
        error: "You cannot book more than 72 hours",
      })
    } else {
      this.setState({
        error: null,
      })
    }
  }

  goToVehicleDetailPage = (vehicle) => () => {
    const { history } = this.props;
    console.log("vehicle is >>>", vehicle);
    this.setState({
      showSimilarCarModal: false
    }, () => {
      history.push(`/vehicles/${vehicle.vehicle_id}`);
      history.go();
    })
  }

  closeModal = () => {
    this.setState({
      showSimilarCarModal: false,
    })
  }

  render() {
    const { vehicle } = this.state;
    let reservations;
    if (vehicle) {
      reservations = _.map(vehicle.reservation, b => {
        return {
          id: b.reservation_id,
          start: new Date(moment(moment.utc(b.start_time)).local()),
          end: new Date(moment(moment.utc(b.end_time)).local()),
          title: "Booked",
        }
      });
    }
    return vehicle ? (
      <div className="container-fluid">
        <div className="row" style={{height: '750px'}}>
          <div className="col-3" >
            <h4>Vehicle Info</h4>
            <Card
              key={vehicle.vehicle_id}
              hoverable
              cover={<img alt="example" src={_.get(vehicle,['images', 0])} height="300px"/>}
              bordered={true}
              style={{textAlign: 'left'}}
            >
              <p><b>TYPE:</b> {_.get(vehicle, ['vehicle_type', 'name'])}</p>
              <p><b>MAKE:</b> {vehicle.make}</p>
              <p><b>HOURLY RATE:</b> {vehicle.default_hourly_rate}</p>
              <p><b>MODEL:</b> {vehicle.model}</p>
              <p><b>YEAR:</b> {vehicle.year}</p>
              <p><b>REG TAG:</b> {vehicle.registration_tag}</p>
              <p><b>MILEAGE:</b> {vehicle.current_mileage}</p>
              <p><b>CONDITION:</b> {vehicle.condition}</p>
              <p><b>CAPACITY:</b> {vehicle.capacity}</p>
              <p><b>LOCATION:</b> {_.get(vehicle, ['location', 'name'])}</p>
            </Card>
          </div>
          <div className="col-6" style={{height: '750px', overflowY: 'scroll'}}>
            <h4>Pictures</h4>
            <Gallery photos={getPhotos(vehicle.images)} />
          </div>
          <div className="col-3">
            <h4>Comments</h4>
            <List
              bordered
              itemLayout="horizontal"
              style={{textAlign: 'left', minHeight: '460px', overflowY: 'scroll'}}
              dataSource={vehicle.comments}
              renderItem={comment => (
                <List.Item style={{borderBottom: "1px solid #abaaad", backgroundColor: 'white'}}>
                  <List.Item.Meta
                    title={<h5 style={{overflowWrap: 'break-word'}}>{comment.comment_content}</h5>}
                    description={moment(moment.utc(comment.comment_time)).local().format("MM/DD/YYYY HH:MM")}
                  />
                </List.Item>
              )}
            />
            {Auth.isUserAuthenticated() && (
              <Form
                labelCol={{ span: 0 }}
                wrapperCol={{ span: 24 }}
                layout="horizontal"
                size="middle"
                style={{paddingTop: '10px'}}
                onFinish={this.addComment}
              >
                <label>Add Comment</label>
                <Form.Item name="comment_content">
                  <TextArea style={{height: '170px', width: '100%'}} />
                </Form.Item>
                <Form.Item {...tailLayout}>
                  <Button type="primary" htmlType="submit">
                    Add Comment
                  </Button>
                </Form.Item>
              </Form>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col col-4 offset-4">
            <h4>Reserve Vehicle</h4>
          <Form
            style={{border: '1px solid #abaaad', alignSelf: 'center'}}
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 10 }}
            layout="horizontal"
            size="middle"
            onValuesChange={this.checkValues}
            onFinish={this.storeReservation}
          >
            <label>{this.state.error}</label>
            <Form.Item label="Start Time" name="start_time"
              rules={[
                {
                  required: true,
                  message: 'Please ent a start time',
                },
              ]}
            >
              <DatePicker showTime />
            </Form.Item>
            <Form.Item label="End Time" name="end_time"
              rules={[
                {
                  required: true,
                  message: 'Please ent an end time',
                },
              ]}
            >
              <DatePicker showTime />
            </Form.Item>

            <Form.Item {...tailLayout2}>
              {!this.state.error && (
                <Button type="primary" htmlType="submit">
                  Check Booking
                </Button>)
              }
            </Form.Item>
            <Form.Item {...tailLayout2}>
                {this.props.reservations.reservation && !this.state.error &&(
                <Button type="primary" onClick={this.addReservation} style={{marginTop: '5px'}}>
                  Pay and Reserve
                </Button>
              )}
            </Form.Item>
          </Form>

          </div>
        </div>
        <div style={{marginTop: '10px'}}>
          <h4>Vehicle Availability Calendar</h4>
          <Calendar
            events={reservations}
            views={allViews}
            step={60}
            showMultiDayTimes
            defaultDate={new Date()}
            components={{
              timeSlotWrapper: ColoredDateCellWrapper,
            }}
            style={{ height: 800 }}
            localizer={localizer}
          />
        </div>
        <Modal
          title="Similar Vehicles"
          visible={this.state.showSimilarCarModal}
          onOk={this.closeModal}
          onCancel={this.closeModal}
        >
          <h6 style={{textAlign: 'center'}}>Your vehicle is not available at the time span you selected. Here is a list of similar vehicles available.</h6>
          <List
              style={{textAlign: 'left'}}
              itemLayout="horizontal"
              dataSource={this.state.similarVehicles}
              renderItem={item => (
                <List.Item style={{borderBottom: "1px solid #abaaad"}}>
                  <List.Item.Meta
                    title={`${item.make} ${item.model}`}
                    avatar={<Avatar src={_.get(item, ['images', 0])} />}
                    description={`Year: ${item.year}`}
                  />
                  <Button onClick={this.goToVehicleDetailPage(item)} style={{marginRight: '5px'}} type="primary">Reserve</Button>
                </List.Item>
              )}
            />
        </Modal>
      </div>
    ) : <div>Loading...</div>;
  }
}

const mapStateToProps = state => {
  const { reservations } = state;
  return {
    reservations
  };
};

const mapDispatchToProps = {
  selectReservation
};

export default connect(mapStateToProps, mapDispatchToProps)(withApollo(withRouter(VehicleDetailPage)));