import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import queryString from 'query-string'
import Promise from 'bluebird';
import _ from 'lodash';
import gql from 'graphql-tag';
import {
  Form,
  Input,
  Button,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col
} from 'antd';
import { openNotificationWithIcon } from '../../utils';
const { Option } = Select;

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 22,
  },
};

const fetchVehicleTypes = gql`
  query getVehicleTypes {
    vehicle_types {
      id,
      name
    }
  }
`;

const getAllLocationsQuery = gql`
query serachLocations {
  searchLocations {
    id,
    name,
    address,
    capacity,
    geo {
      type,
      coordinates
    }
  }
}
`;

const fetchVehicles = gql`
  query getVehicles(
    $rate: Float,
    $make: String,
    $model: String,
    $year: Int,
    $vehicle_type: String,
    $available_from: String,
    $to: String,
    $location: String,
  ) {
    vehicles(
      default_hourly_rate:{lte:$rate},
      make:$make,
      model: $model,
      year: $year,
      vehicle_type: $vehicle_type,
      available_from: $available_from,
      to: $to,
      location: $location,
      is_active: true
    ) {
      vehicle_id: id,
      default_hourly_rate,
      vehicle_type {
        id,
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

class SearchVehiclesAdminPage extends Component {
  state = {
    loading: true,
    rate: null,
    make: null,
    vehicles: [],
    vehicle_types: [],
    locations: [],
    defaultLocation: null,
  }
  
  componentDidMount() {
    const queries = queryString.parse(this.props.location.search);
    let defaultLocation;
    return Promise.all([
      this.props.client.query({
        query: fetchVehicleTypes,
        variables: {}
      }),
      this.props.client.query({
        query: getAllLocationsQuery,
        variables: {}
      }),
    ])
    .spread((res1, res2) => {
      if(queries.default_location) {
        defaultLocation = _.find(res2.data.searchLocations, l => l.id === queries.default_location);
      }
      this.setState({
        vehicle_types: res1.data.vehicle_types,
        locations: res2.data.searchLocations,
        defaultLocation: defaultLocation,
        loading: false
      })
    })
  }

  goToVehicleDetailPage = (vehicle) => () => {
    const { history } = this.props;
    history.push(`/vehicles/${vehicle.id}`);
  }

  goToVehicleAdminPage = (vehicle) => () => {
    const { history } = this.props;
    history.push(`/admin/vehicles/${vehicle.vehicle_id}`);
  }

  handleInputChange = (e) => {
    const target = e.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleSubmit = (values) => {
    this.props.client.query({
      query: fetchVehicles,
      variables: {
        vehicle_type: values.vehicle_type,
        make: values.make,
        model: values.model,
        year: values.year,
        available_from: values.available_from && values.available_from.toISOString(),
        to: values.to && values.to.toISOString(),
        location: values.location ? values.location :undefined,
        rate: values.rate,
      }
    })
    .then(res => {
      console.log("res is >>>", res);
      openNotificationWithIcon('success', 'Search Finished!', 'Here is your search result.');
      this.setState({
        vehicles: res.data.vehicles
      })
    })
  }

  render() {
    const { vehicles, loading } = this.state;
    return loading ? <div>loading...</div> : (
      <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <Row style={{width: '100%', textAlign: 'center', paddingTop: '4%'}}>
          <Col span={12} offset={6}>
            <Form
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 14 }}
              layout="horizontal"
              size="middle"
              onFinish={this.handleSubmit}
              initialValues={{ location: _.get(this.state.defaultLocation, 'name') }}
            >
              <Form.Item label="Vehicle Type" name="vehicle_type">
                <Select placeholder="Select vehicle type" style={{width: '80%'}}>
                  {_.map(this.state.vehicle_types, t =>(
                    <Option value={t.name} key={t.id}>{t.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Location" name="location">
                <Select showSearch  placeholder="Select Location" allowClear style={{width: '80%'}}>
                  <Option value={null}>Any</Option>
                  {_.map(this.state.locations, l =>(
                    <Option value={l.name} key={l.id}>{l.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Car Make" name="make">
                <Input style={{width: '80%'}} />
              </Form.Item>
              <Form.Item label="Model" name="model">
                <Input style={{width: '80%'}}/>
              </Form.Item>
              <Form.Item label="Year" name="year">
                <InputNumber style={{width: '80%'}} />
              </Form.Item>
              <Form.Item label="Car Rate" name="rate">
                <InputNumber style={{width: '80%'}} />
              </Form.Item>
              <Form.Item label="Available From" name="available_from">
                <DatePicker style={{width: '80%'}} />
              </Form.Item>
              <Form.Item label="Available To" name="to">
                <DatePicker style={{width: '80%'}} />
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  Search
                </Button>
              </Form.Item>
            </Form>
            
          </Col>
        </Row>
        <Row style={{width: '100%',paddingTop: '4%'}} >
          <Col lg={{ span: 22, offset: 1 }} xl={{ span: 22, offset: 1 }} xxl={{ span: 18, offset: 3 }}>
            {_.map(vehicles, vehicle =>(
              <div className="vehicle-item__main-content" key={vehicle.vehicle_id} style={{border: '1px solid gray'}}>
                <picture className="vehicle-item__image">
                  <img src={vehicle.images[0]} alt="" style={{width: '300px', height: '180px', marginTop:'20px'}}/>
                </picture>
                <section className="vehicle-item__summary" style={{width: '500px'}}>
                  <h2 className="vehicle-item__title">{vehicle.make} {vehicle.model}</h2>
                  <p className="vehicle-item__models">YEAR: {vehicle.year}</p>
                  <p className="vehicle-item__models">TYPE: {_.get(vehicle, ['vehicle_type','name'])}</p>
                  <p className="vehicle-item__models">LOCATION: {_.get(vehicle, ['location', 'name'])}</p>
                  <ul className="vehicle-item__attributes">
                    <li className="vehicle-item__attribute-item"><i className="icon icon-specs-transmission-gray"></i>{vehicle.condition}</li>
                    <li className="vehicle-item__attribute-item"><i className="icon icon-specs-passenger-gray"></i>{vehicle.capacity}</li>
                    <li className="vehicle-item__attribute-item"><i className="icon icon-specs-bags-gray"></i>{vehicle.current_mileage}</li>
                  </ul>
                </section>
                <Button onClick={this.goToVehicleAdminPage(vehicle)} style={{alignSelf:'center', marginRight: '10px'}}>Vehicle Admin Operation</Button>
              </div>
            ))}
          </Col>
        </Row>
      </div>
    );
  }
}

export default withApollo(SearchVehiclesAdminPage);