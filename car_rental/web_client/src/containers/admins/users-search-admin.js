import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  List
} from 'antd';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

const searchUsersQuery = gql`
  query searchUsers(
    $email: String
    $username: String
    $dl_state: String
    $dl_number: String
    $mobile_phone: String
    $age: Int
    $registration_date: String
  ){
    searchUsers(
      email: $email
      username: $username
      dl_state: $dl_state
      dl_number: $dl_number
      mobile_phone: $mobile_phone
      age: $age
      registration_date: $registration_date
    )
    {
      id,
      username,
      email,
      dl_state,
      dl_number,
      mobile_phone,
      age,
      registration_date
    }
  }
`;

const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

class Users extends Component {
  state = {
    users: [],
  }
  
  handleSubmit = (values) => {
    let variables = {};
    if (values.email) variables.email = values.email;
    if (values.username) variables.username = values.username;
    if (values.dl_state) variables.dl_state = values.dl_state;
    if (values.dl_number) variables.dl_number = values.dl_number;
    if (values.mobile_phone) variables.mobile_phone = ""+values.mobile_phone;
    if (values.age) variables.age = values.age;
    if (values.registration_date) variables.registration_date = values.registration_date.toISOString();
    this.props.client.query({
      query: searchUsersQuery,
      variables: variables,
    })
    .then(res => {
      console.log("res is >>>", res);
      this.setState({
        users: res.data.searchUsers
      });
    })
  }

  goToUserDetail = user => () => {
    const { history } = this.props;
    console.log("user is >>>", user);
    history.push(`/admin/users/${user.id}`);
  }

  render() {
    return (
      <div className="container" style={{minHeight: '100vh'}}>
        <div className="row">
          <div className="col col-8">
            <Form
            labelCol={{ span: 10 }}
            wrapperCol={{ span: 14 }}
            layout="horizontal"
            size="middle"
            style={{marginTop: '20px'}}
            onFinish={this.handleSubmit}
          >
            <h4>Search User</h4>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Username" name="username">
              <Input />
            </Form.Item>
            <Form.Item label="Driver License State" name="dl_state">
              <Select>
                <Select.Option value="CA">CA</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Driver License Number" name="dl_number">
              <Input />
            </Form.Item>
            <Form.Item label="Mobile Phone" name="mobile_phone">
              <InputNumber style={{width: '100%'}} />
            </Form.Item>
            <Form.Item label="Age" name="age">
              <InputNumber style={{width: '100%'}} />
            </Form.Item>
            <Form.Item label="Registration Date" name="registration_date">
              <DatePicker style={{width: '100%'}} />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
          </div>
        </div>
        <div className="row">
          <div className="col col-12">
            <List
              style={{textAlign: 'left'}}
              itemLayout="horizontal"
              dataSource={this.state.users}
              renderItem={item => (
                <List.Item onClick={this.goToUserDetail(item)} style={{border: "1px solid #abaaad", marginTop:'1px'}}>
                  <List.Item.Meta
                    style={{marginLeft: '10px'}}
                    title={`Email: ${item.email}`}
                    description={`State: ${item.dl_state} Driver Licence: ${item.dl_number}`}
                  />
                  <Button style={{marginRight: '10px'}}>Edit User</Button>
                </List.Item>
              )}
            />
          </div>
        </div>
      </div>
    )  
  }
}

export default withRouter(withApollo(Users));