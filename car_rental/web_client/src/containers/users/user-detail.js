import React, { Component } from 'react';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Card,
  Switch,
  DatePicker
} from 'antd';
import { openNotificationWithIcon } from '../../utils';

const tailLayout = {
  wrapperCol: {
    offset: 1,
    span: 22,
  },
};

const userQuery = gql`
  query tokenGetUser {
    userbytoken {
      user_id: id,
      username,
      email,
      dl_state,
      dl_number,
      mobile_phone,
      age,
      is_active,
      address,
      membership {
        membership_id: id,
        start_date
        last_renew_date
        is_active
      },
      credit_card_info {
        cc_id: id,
        credit_card_number,
        card_holder_name,
        billing_address,
        exp_date
      }
    }
  }
`;

const updateUserMutation = gql`
  mutation updateUser(
    $id: String!
    $dl_state: String
    $dl_number: String
    $age: Int
    $is_active: Boolean
  ){
    updateUser(
      id: $id
      dl_state: $dl_state
      dl_number: $dl_number
      age: $age
      is_active: $is_active
    )
    {
      id
    }
  }
`;

const updateUserMembershipMutation = gql`
  mutation updateMembership(
    $id: String!
    $start_date: String
    $last_renew_date: String
    $is_active: Boolean
  ){
    updateMembership(
      id: $id
      start_date: $start_date
      last_renew_date: $last_renew_date
      is_active: $is_active
    )
    {
      id,
      start_date,
      last_renew_date,
      is_active
    }
  }
`;

const updateUserCCMutation = gql`
  mutation updateCreditCardInfo(
    $id: String!
    $credit_card_number: String
    $card_holder_name: String
    $billing_address: String
    $exp_date: String
  ){
    updateCreditCardInfo(
      id: $id
      credit_card_number: $credit_card_number
      card_holder_name: $card_holder_name
      billing_address: $billing_address
      exp_date: $exp_date
    )
    {
      cc_id: id,
      credit_card_number,
      card_holder_name,
      billing_address,
      exp_date
    }
  }
`;

class UserDetail extends Component {
  state = {
    user: null,
  }

  componentDidMount() {
    this.props.client.query({
      query: userQuery,
      variables: {}
    })
    .then(res => {
      console.log("res is >>>", res);
      const user = res.data.userbytoken;
      user.membership.start_date = moment(moment.utc(user.membership.start_date)).local();
      user.membership.last_renew_date = moment(moment.utc(user.membership.last_renew_date)).local();
      user.credit_card_info.exp_date = moment(moment.utc(user.credit_card_info.exp_date)).local();
      this.setState({
        user: user
      })
    })
  }

  handleSubmit = (values) => { 
    console.log("values>>>>", values);
    this.props.client.mutate({
      mutation: updateUserMutation,
      variables: {
        id: this.state.user.user_id,
        dl_state: values.dl_state,
        dl_number: values.dl_number,
        age: values.age,
        is_active: values.is_active
      }
    })
    .then(res =>{
      console.log("res is >>>", res);
      openNotificationWithIcon('success', 'User Info Updated!', 'User Info Successfully Updated!');
    })
  }

  updateMembership = (values) => {
    console.log("values is >>>", values);
    console.log("this.state.user is >>>", this.state.user.membership.membership_id)
    this.props.client.mutate({
      mutation: updateUserMembershipMutation,
      variables:{
        id: this.state.user.membership.membership_id,
        start_date: values.start_date && values.start_date.toISOString(),
        last_renew_date: values.last_renew_date && values.last_renew_date.toISOString(),
        is_active: values.is_active
      }
    })
    .then(res => {
      console.log('res is >>>>', res);
      openNotificationWithIcon('success', 'Membership Updated!', 'Membership Successfully Updated!');
    })
  }

  updateCC = (values) => {
    this.props.client.mutate({
      mutation: updateUserCCMutation,
      variables:{
        id: this.state.user.credit_card_info.cc_id,
        credit_card_number: ""+values.credit_card_number,
        card_holder_name: values.card_holder_name,
        billing_address: values.billing_address,
        exp_date: values.exp_date && values.exp_date.toISOString(),
      }
    })
    .then(res => {
      console.log('res is >>>>', res);
      openNotificationWithIcon('success', 'Credit Card Updated!', 'Credit Card Successfully Updated!');
    })
  }

  render() {
    const { user } = this.state;
    return user ? (
      <div className="container-fluid">
         <h4>User Profile</h4>
        <div className="row" style={{marginTop: '10px'}}>
          <div className="col-12">
            <Card 
              title={`Username: ${this.state.user.username}`}
              hoverable
              bordered={false}
              style={{textAlign: 'left', width: '400px', marginLeft: 'auto', marginRight: 'auto'}}
            >
              <p><b>Email:</b> {user.email}</p>
              <p><b>DL State:</b> {user.dl_state}</p>
              <p><b>DL Number:</b> {user.dl_number}</p>
              <p><b>Moible Phone:</b> {user.mobile_phone}</p>
              <p><b>Age:</b> {user.age}</p>
              <p><b>Address:</b> {user.address}</p>
            </Card>
          </div>
        </div>
        <div className="row" style={{marginTop: '10px'}}>
          <div className="col-8 offset-2" style={{marginTop: '10px'}}>
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            layout="horizontal"
            size="middle"
            onFinish={this.handleSubmit}
            initialValues={this.state.user}
            style={{border: "1px solid #abaaad"}}
          >
            <h4>User Info</h4>
            <Form.Item label="Driver License State" name="dl_state">
              <Select style={{width: '40%'}}>
                <Select.Option value="CA">CA</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Driver License Number" name="dl_number">
              <Input style={{width: '40%'}} />
            </Form.Item>
            <Form.Item label="Age" name="age">
              <InputNumber style={{width: '40%'}} />
            </Form.Item>
            <Form.Item label="Is Active" name="is_active" >
              <Switch defaultChecked={this.state.user.is_active} />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
          <Button type="link" href="/membership/renew">Click Here to renew your membership</Button>
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            layout="horizontal"
            size="middle"
            onFinish={this.updateCC}
            initialValues={this.state.user.credit_card_info}
            style={{border: "1px solid #abaaad"}}
          >
            <h4>User Credit Card</h4>
            <Form.Item label="Credit Card Number" name="credit_card_number">
              <InputNumber style={{width: '40%'}} />
            </Form.Item>
            <Form.Item label="Card Holder Name" name="card_holder_name">
              <Input style={{width: '40%'}} />
            </Form.Item>
            <Form.Item label="Billing Address" name="billing_address">
              <Input style={{width: '40%'}} />
            </Form.Item>
            <Form.Item label="Expiration Date" name="exp_date">
              <DatePicker style={{width: '40%'}} />
            </Form.Item>
            <Form.Item label="Cvv" name="cvv">
              <Input style={{width: '40%'}} />
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

    ): <div>Loading...</div>;
  }
}

export default withRouter(withApollo(UserDetail));