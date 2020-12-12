import React, { Component } from 'react';
import { Modal, Form, Input, Button } from 'antd';

class MembershipRenewalModal extends Component {
  render() {
    return (
      <Modal
        title="Membership Renewal Modal"
        visible={this.props.modalVisible}
      >
        <Form
          name="basic"
          onFinish={this.props.handleSubmit}
        >
          <Form.Item
            label="secret code"
            name="code"
            rules={[
              {
                required: true,
                message: 'Please Renew!',
              },
            ]}
          >
            <Input />
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

export default MembershipRenewalModal;