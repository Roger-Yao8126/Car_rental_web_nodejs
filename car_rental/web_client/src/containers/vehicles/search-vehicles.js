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
import { DashboardOutlined, TeamOutlined, SafetyOutlined } from '@ant-design/icons';
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

class Vehicles extends Component {
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
    history.push(`/vehicles/${vehicle.vehicle_id}`);
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
      this.setState({
        vehicles: res.data.vehicles
      }, () => {
        openNotificationWithIcon('success', 'Finished Searching!', 'Here is your search result.');
      })
    })
  }

  render() {
    const { vehicles, loading } = this.state;
    console.log("vehicles is >>>", vehicles);
    return loading ? <div>loading...</div> : (
      <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', }}>
        
        <Row style={{width: '100%', textAlign: 'center', paddingTop: '4%'}}>
        
          <Col span={12} offset={6}>
            <h4>Vehicle Search</h4>
            <Form
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 14 }}
              layout="horizontal"
              size="middle"
              onFinish={this.handleSubmit}
              initialValues={{ location: _.get(this.state.defaultLocation, 'name') }}
            >
              <Form.Item label="Vehicle Type" name="vehicle_type">
                <Select placeholder="Select vehicle type">
                  {_.map(this.state.vehicle_types, t =>(
                    <Option value={t.name} key={t.id}>{t.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Location" name="location">
                <Select showSearch  placeholder="Select Location" allowClear>
                  <Option value={null}>Any</Option>
                  {_.map(this.state.locations, l =>(
                    <Option value={l.name} key={l.id}>{l.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Car Make" name="make">
                <Input style={{width: '100%'}} />
              </Form.Item>
              <Form.Item label="Model" name="model">
                <Input style={{width: '100%'}} />
              </Form.Item>
              <Form.Item label="Year" name="year">
                <InputNumber style={{width: '100%'}} />
              </Form.Item>
              <Form.Item label="Car Rate" name="rate">
                <InputNumber style={{width: '100%'}} />
              </Form.Item>
              <Form.Item label="Available From" name="available_from">
                <DatePicker style={{width: '100%'}} showTime />
              </Form.Item>
              <Form.Item label="Available To" name="to">
                <DatePicker style={{width: '100%'}} showTime />
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
              <div className="vehicle-item__main-content" key={vehicle.vehicle_id} style={{border: '1px solid gray', marginTop:'2px'}}>
                <picture className="vehicle-item__image">
                  <img src={vehicle.images[0]} alt="" style={{width: '300px', height: '180px', marginTop:'20px'}}/>
                </picture>
                <section className="vehicle-item__summary" style={{width: '300px'}}>
                  <h2 className="vehicle-item__title">{vehicle.make} {vehicle.model}</h2>
                  <p className="vehicle-item__models"><b>YEAR:</b> {vehicle.year}</p>
                  <p className="vehicle-item__models"><b>TYPE:</b> {_.get(vehicle, ['vehicle_type','name'])}</p>
                  <p className="vehicle-item__models"><b>LOCATION:</b> {_.get(vehicle, ['location', 'name'])}</p>
                  <Button onClick={this.goToVehicleDetailPage(vehicle)} type="primary">Reserve Vehicle</Button>
                </section>
                <div className="vehicle-item__pricing" style={{alignSelf: 'center', width: '300px'}}>
                  <div className="vehicle-pricing">
                    <header className="vehicle-pricing__base-header">
                      <h3 className="vehicle-pricing__base-heading">Vehicle Rate</h3>
                    </header>
                    <div className="vehicle-pricing__currency-tiles">
                      <div className="price-tile">
                        <ul className="vehicle-item__attributes">
                          <li className="vehicle-item__attribute-item">
                            <i className="icon icon-specs-transmission-gray"></i>${vehicle.default_hourly_rate} /hour
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="vehicle-pricing" style={{alignSelf: 'center', width: '300px'}}>
                    <header className="vehicle-pricing__base-header">
                      <h3 className="vehicle-pricing__base-heading">Vehicle Spec</h3>
                    </header>
                    <div className="vehicle-pricing__currency-tiles">
                      <div className="price-tile">
                      <ul className="vehicle-item__attributes">
                        <li className="vehicle-item__attribute-item"><SafetyOutlined style={{fontSize: '20px'}}/>{' '}{vehicle.condition}</li>
                        <li className="vehicle-item__attribute-item"><TeamOutlined style={{fontSize: '20px'}}/>{' '}{vehicle.capacity}</li>
                        <li className="vehicle-item__attribute-item"><DashboardOutlined style={{fontSize: '20px'}}/>{' '}{vehicle.current_mileage}</li>
                      </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Col>
        </Row>
      </div>
    );
  }
}

export default withApollo(Vehicles);