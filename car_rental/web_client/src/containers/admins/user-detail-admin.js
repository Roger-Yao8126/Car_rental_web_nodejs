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

const userQuery = gql`
  query UserQuery($id: String!){
    user(
      id: $id
    )
    {
      id,
      username,
      email,
      dl_state,
      dl_number,
      mobile_phone,
      age,
      is_active,
      registration_date,
      membership {
        id,
        start_date
        last_renew_date
        is_active
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

const tailLayout = {
  wrapperCol: {
    offset: 1,
    span: 22,
  },
};


class UserDetail extends Component {
  state = {
    user: null,
  }

  componentDidMount() {
    const { match } = this.props;
    const userId = match.params.user_id;
    this.props.client.query({
      query: userQuery,
      variables: { id: userId },
    })
    .then(res => {
      console.log("res is >>>", res);
      const user = res.data.user;
      user.membership.start_date = moment(moment.utc(user.membership.start_date)).local();
      user.membership.last_renew_date = moment(moment.utc(user.membership.last_renew_date)).local();
      this.setState({
        user: user
      })
    })
  }

  updateMembership = (values) => {
    console.log("values is >>>", values);
    console.log("this.state.user is >>>", this.state.user.membership.id)
    this.props.client.mutate({
      mutation: updateUserMembershipMutation,
      variables:{
        id: this.state.user.membership.id,
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

  handleSubmit = (values) => { 
    console.log("values>>>>", values);
    this.props.client.mutate({
      mutation: updateUserMutation,
      variables: {
        id: this.state.user.id,
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

  render() {
    const { user } = this.state;
    return user ? (
      <div className="container-fluid">
        <h4>Admin User Page</h4>
        <div className="row" style={{marginTop: '10px'}}>
          <div className="col-12">
            <Card 
              title={`Username: ${this.state.user.username}`}
              bordered
              hoverable
              style={{textAlign: 'left', width: '400px', marginLeft: 'auto', marginRight: 'auto'}}
            >
              <p><b>USER ID:</b> {user.id}</p>
              <p><b>EMAIL:</b> {user.email}</p>
              <p><b>DL STATE:</b> {user.dl_state}</p>
              <p><b>DL_NUMBER:</b> {user.dl_number}</p>
              <p><b>MOBILE PHONE:</b> {user.mobile_phone}</p>
              <p><b>AGE:</b> {user.age}</p>
              <p><b>REG DATE:</b> {user.registration_date}</p>
              <p><b>ACTIVE:</b> {user.is_active ? 'True': 'False'}</p>
            </Card>
          </div>
          <div className="col-8 offset-2" style={{marginTop: '10px'}}>
            <h4>Update User</h4>
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              layout="horizontal"
              size="middle"
              onFinish={this.updateMembership}
              initialValues={this.state.user.membership}
              style={{border: "1px solid #abaaad"}}
            >
              <lable>User Membership</lable>
              <Form.Item label="Start Date" name="start_date">
                <DatePicker style={{width: '20%'}} />
              </Form.Item>
              <Form.Item label="Last Renew Date" name="last_renew_date">
                <DatePicker style={{width: '20%'}} />
              </Form.Item>
              <Form.Item label="Is Active" name="is_active">
                <Switch defaultChecked={this.state.user.membership.is_active} />
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              layout="horizontal"
              size="middle"
              onFinish={this.handleSubmit}
              initialValues={this.state.user}
              style={{border: "1px solid #abaaad", marginTop: "10px"}}
            >
              <lable>User Info</lable>
              <Form.Item label="Driver License State" name="dl_state">
                <Select style={{width: '20%'}}>
                  <Select.Option value="CA">CA</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Driver License Number" name="dl_number">
                <Input style={{width: '20%'}} />
              </Form.Item>
              <Form.Item label="Age" name="age">
                <InputNumber style={{width: '20%'}} />
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
          </div>
        </div>
      </div>

    ): <div>Loading...</div>;
  }
}

export default withRouter(withApollo(UserDetail));