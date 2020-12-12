import React, { Component } from 'react';
import { Modal, Form, Input, Button } from 'antd';

class LoginModal extends Component {
  render() {
    return (
      <Modal
        title="Login Modal"
        visible={this.props.modalVisible}
      >
        <Form
          name="basic"
          onFinish={this.props.handleSubmit}
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

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default LoginModal;