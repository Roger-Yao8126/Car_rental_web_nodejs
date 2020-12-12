import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import moment from 'moment';
import gql from 'graphql-tag';
import { Form, Input, Button, Card } from 'antd';

import Auth from '../Auth';
import { openNotificationWithIcon } from '../utils';

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 22,
  },
};

const userQuery = gql`
  query getUserInfo {
    userbytoken {
      membership {
        id
        start_date
      }
      credit_card_info {
        credit_card_number
        card_holder_name
        billing_address
        exp_date
      }
    }
  }
`;

const rateQuery = gql`
  query getRateInfo {
    parameter(description: "6 month membership fee") {
      description
      rate
    }
  }
`;

const extendMembershipMutation = gql`
  mutation updateMembership(
    $id: String!
    $is_active: Boolean!
    $last_renew_date: String!
  ) {
    updateMembership(
      id: $id
      is_active: $is_active
      last_renew_date: $last_renew_date
    ) {
      is_active
    }
  }
`;

class Payment extends Component {
  state = {
    membership: null,
    card: null,
    parameter: null,
  };

  logout = () => {
    const { history } = this.props;
    Auth.deauthenticateUser();
    history.push('/login');
  }

  handleSubmit = (values) => {
    // const currentDate = new Date();
    // currentDate.toISOString();
    const isMembershipExpired = Auth.isMembershipExpired();
    const currentDate = moment().format('YYYY-MM-DD h:mm:ss');
    this.props.client
      .mutate({
        mutation: extendMembershipMutation,
        variables: {
          id: this.state.membership.id,
          is_active: true,
          last_renew_date: currentDate,
        },
      })
      .then((res) => {
        console.log('res inhandle is >>>', res);
        if (isMembershipExpired) {
          openNotificationWithIcon('success', 'Membership renewed!', 'Please log in again to see update');
          this.logout();
        } else {
          alert('Your membership is extended for another 6 month.');
        }
      });
  };

  componentDidMount() {
    this.props.client
      .query({
        query: userQuery,
      })
      .then((res) => {
        console.log('res is >>>', res);

        this.setState({
          membership: res.data.userbytoken.membership,
          card: res.data.userbytoken.credit_card_info,
        });
      });

    this.props.client
      .query({
        query: rateQuery,
      })
      .then((res) => {
        console.log('res is >>>', res);
        this.setState({
          parameter: res.data.parameter,
        });
      });
  }

  render() {
    const { card } = this.state;
    const { membership } = this.state;
    const { parameter } = this.state;
    return card ? (
      <div className="container" style={{ minHeight: '100vh' }}>
        <h4>Membership renew</h4>
        <div className="row">
          {parameter && (
            <div className="col col-4 offset-4">
              <Card title="Membership" bordered={false} style={{ width: 300 }}>
                <div className="site-card-border-less-wrapper">
                  <p>
                    {'Last Renewal at ' +
                      membership.start_date.substring(0, 10)}
                  </p>
                  <p>{'Renewal price for 6 month : '}</p>
                  <p>$ {parameter.rate}</p>
                </div>
              </Card>
            </div>
          )}
        </div>
        <div className="row" style={{ marginTop: '20px' }}>
          <div className="col col-4 offset-4">
            <Card
              title="Payment Method"
              bordered={false}
              style={{ width: 300 }}
            >
              <p>{card.card_holder_name}</p>
              <p>{card.credit_card_number}</p>
              <p>{card.billing_address}</p>
              <p>{card.exp_date.substring(0, 10)}</p>
              <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                size="middle"
                onFinish={this.handleSubmit}
              >
                <Form.Item label="CVV" name="CVV">
                  <Input />
                </Form.Item>
                <Form.Item {...tailLayout}>
                  <Button type="primary" htmlType="submit">
                    Renew
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    ) : (
      <div>Loading...</div>
    );
  }
}
export default withRouter(withApollo(Payment));
