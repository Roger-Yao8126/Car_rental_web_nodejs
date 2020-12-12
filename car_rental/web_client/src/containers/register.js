import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Row, Col, Select, InputNumber, DatePicker } from 'antd';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

import Auth from '../Auth';
import { states } from '../constants';

const registerMutation = gql`
  mutation registerMutation(
    $email: String!
    $password: String!
    $username: String!
    $address: String!
    $dl_state: String!
    $dl_number: String!
    $mobile_phone: String!
    $age: Int!
    $registration_date: String!
    $role: String!
    $is_active: Boolean!
    $credit_card_number: String!
    $card_holder_name: String!
    $billing_address: String!
    $exp_date: String!
    $start_date: String!
    $last_renew_date: String!
    $is_membership_active: Boolean!
  ){
    newUser(
      email: $email
      password: $password
      username: $username
      address: $address
      dl_state: $dl_state
      dl_number: $dl_number
      mobile_phone: $mobile_phone
      age: $age
      registration_date: $registration_date
      credit_card_info: {
        credit_card_number: $credit_card_number
        card_holder_name: $card_holder_name
        billing_address: $billing_address
        exp_date: $exp_date
      }
      membership: {
        start_date: $start_date
        last_renew_date: $last_renew_date
        is_active: $is_membership_active
      }
      role: $role
      is_active: $is_active
    )
    {
      token,
      role
    }
  }
`;

const layout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 14,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 14,
  },
};

class Register extends Component {

  componentDidMount() {
    const { history } = this.props;
    if (Auth.isUserAuthenticated()) {
      history.push('/');
    }
  }

  handleSubmit = (values) => {
    const { history } = this.props;
    const now = new Date().toISOString();
    this.props.client.mutate({
      mutation: registerMutation,
      variables: {
        email: values.email,
        password: values.password,
        username: values.username,
        address: values.address,
        dl_state: values.dl_state,
        dl_number: values.dl_number,
        mobile_phone: values.mobile_phone,
        age: values.age,
        registration_date: values.registration_date.toISOString(),
        role: values.role,
        credit_card_number: values.credit_card_number,
        card_holder_name: values.card_holder_name,
        billing_address: values.billing_address,
        exp_date: values.exp_date,
        is_active: true,
        is_membership_active: true,
        start_date: now,
        last_renew_date: now,
      }
    })
    .then(res => {
      const { newUser } = res.data;
      const { token, role } = newUser;
      Auth.authenticateUser(token, role);
      history.push('/');
      console.log("res is >>>", res);
    })
  }

  render() {
    return (
      <div style={{minHeight: '100vh', display: 'flex',justifyContent: 'center'}} className="login-page">
          <Row style={{width: '100%', textAlign: 'center', paddingTop: '4%'}}>
            <Col xl={{span:9, offset:14}} l={{span: 20, offset:4}} md={{span: 20, offset:4}}>
              <Form
                {...layout}
                name="basic"
                style={{
                  backgroundColor: 'white',
                  opacity: '0.7',
                  paddingTop: '25px',
                  paddingRight: '20px',
                  boxShadow: '0 3px 6px gray, 0 3px 6px gray'
                }}
                initialValues={{
                  remember: true,
                }}
                onFinish={this.handleSubmit}
              >
              
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your email!',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your password!',
                    },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your username!',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your address',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Driver Licence State"
                  name="dl_state"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your driver license state!',
                    },
                  ]}
                >
                  <Select>
                    {_.map(states, state =>(
                      <Select.Option value={state} key={state}>{state}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Driver Licence Number"
                  name="dl_number"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Driver License number!',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Mobile Phone"
                  name="mobile_phone"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your mobile phone',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Age (16+)"
                  name="age"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your age! You need to be 16+ to register',
                    },
                  ]}
                >
                  <InputNumber style={{width: '100%'}} min={16}/>
                </Form.Item>
                <Form.Item
                  label="Registration Date"
                  name="registration_date"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your registration date',
                    },
                  ]}
                >
                  <DatePicker style={{width: '100%'}} />
                </Form.Item>
                <Form.Item
                  label="Role"
                  name="role"
                  rules={[
                    {
                      required: true,
                      message: 'select your role',
                    },
                  ]}
                >
                  <Select>
                    <Select.Option value="Admin">Admin</Select.Option>
                    <Select.Option value="Admin">Staff</Select.Option>
                    <Select.Option value="Customer">Customer</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Credit Card Number"
                  name="credit_card_number"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Credit Card Number!',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Card Holder Name"
                  name="card_holder_name"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Credit Card Holder Name!',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Billing Address"
                  name="billing_address"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Credit Card Billing Address!',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Expiration Date"
                  name="exp_date"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Credit Card Expiration Date!',
                    },
                  ]}
                >
                  <DatePicker style={{width: '100%'}} />
                </Form.Item>
                <Form.Item
                  label="Card CVV"
                  name="cvv"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Credit Card CVV!',
                    },
                  ]}
                >
                  <InputNumber  style={{width: '100%'}}/>
                </Form.Item>
                <Form.Item {...tailLayout}>
                  <Button type="primary" htmlType="submit">
                    Register
                  </Button>
                  <br />
                  <label>By signing up, you agree to pay $100 membership fee.</label>
                  <br />
                  <label>Already have an account?<Button type="link" href="/login">Go To Login</Button></label>
                </Form.Item>
              </Form>
            </Col>
          </Row>
      </div>
    );
  }
}

export default withRouter(withApollo(Register));