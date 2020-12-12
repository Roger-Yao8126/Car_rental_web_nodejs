import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Row, Col, Modal } from 'antd';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';

import Auth from '../Auth';
import { openNotificationWithIcon } from '../utils';

const loginQuery = gql`
  query loginQuery($email: String!, $pw: String!){
    login(
      email: $email
      pw: $pw
    )
    {
      token,
      role,
      membership_expiration_date
    }
  }
`;

const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 4,
    span: 20,
  },
};

class Login extends Component {
  state = { modalVisible: false };

  componentDidMount() {
    console.log("this.props.location>>>", this.props.location);
    const { history } = this.props;
    if (Auth.isUserAuthenticated()) {
      history.push('/');
    }
  }

  showModal = () => {
    this.setState({
      modalVisible: true,
    });
  };

  closeModal = () => {
    const { history, location } = this.props;
    const fromUrl = _.get(location, ['state', 'fromUrl']);
    this.setState({
      modalVisible: false,
    }, () => {
      history.push(fromUrl || '/');
    });
  }

  handleSubmit = (values) => {
    const { history, location } = this.props;
    
    const { email, password } = values;
    this.props.client.query({
      query: loginQuery,
      variables: {
        email: email,
        pw: password,
      }
    })
    .then(res => {
      const { login } = res.data;
      console.log("login is>>", login);
      console.log("location is >>>", location);
      const { token, role, membership_expiration_date } = login;
      Auth.authenticateUser(token, role, membership_expiration_date);
      const fromUrl = _.get(location, ['state', 'fromUrl']);
      if (membership_expiration_date) {
        if (Auth.isMembershipExpired()) {
          history.push('/membership/renew');
        } else if (Auth.isMembershipSoonExpired()) { 
          this.showModal();
        } else {
          history.push(fromUrl || '/');
        }
      } else {
        history.push(fromUrl || '/');
      }
    })
    .catch(err => {
      console.log("err is >>>", err);
      openNotificationWithIcon('error', 'Login Failed!', err.message);
    })
  }

  render() {
    return (
      <div style={{height: '100vh', display: 'flex', alignItems: 'center',justifyContent: 'center'}} className="login-page">
          <Row style={{width: '50%', textAlign: 'center'}}>
            <Col xl={{span: 14, offset:12}} l={{span: 20, offset:4}} md={{span: 20, offset:4}}>
            <Modal
              title="Membership Renewal Reminder"
              visible={this.state.modalVisible}
              onOk={this.closeModal}
            >
              <p>Your membership is about to expire in 1 month.</p>
              <p>Please click here to renew at your convenience.</p>
            </Modal>
              <Form
                {...layout}
                name="basic"
                initialValues={{
                  remember: true,
                }}
                style={{
                  backgroundColor: 'white',
                  opacity: '0.7',
                  paddingTop: '25px',
                  paddingRight: '20px',
                  boxShadow: '0 3px 6px gray, 0 3px 6px gray'
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

                <Form.Item {...tailLayout}>
                  <Button type="primary" htmlType="submit">
                    Login
                  </Button>
                  <br />
                  <label>Don't have an accont?<Button type="link" href="/register">Go To Register</Button></label>
                </Form.Item>
              </Form>
            </Col>
          </Row>
      </div>
    );
  }
}

export default withRouter(withApollo(Login));