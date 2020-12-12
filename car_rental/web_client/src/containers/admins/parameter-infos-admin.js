import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import {
  Form,
  Button,
  InputNumber,
  List
} from 'antd';
import { openNotificationWithIcon } from '../../utils';

const fetchParameterInfos = gql`
  query fetchParameterInfos {
    parameterinfos {
      id,
      description,
      rate
    }
  }
`;

const updateParameterInfo = gql`
  mutation updateParameterInfo(
    $id: String!
    $rate: Float
  ){
    updateParameterInfo(
      id: $id
      rate: $rate
    )
    {
      id,
      description,
      rate
    }
  }
`;

const tailLayout = {
  wrapperCol: {
    offset: 2,
    span: 22,
  },
};

class ParameterInfosAdminPage extends Component { 
  state= {
    parameterinfos: []
  }
  
  componentDidMount() {
    this.props.client.query({
      query: fetchParameterInfos,
      variables: {},
    })
    .then(res => {
      console.log("res is >>>", res);
      this.setState({
        parameterinfos: res.data.parameterinfos
      })
    })
  }

  handleSubmit = parameterinfo => values => {
    this.props.client.mutate({
      mutation: updateParameterInfo,
      variables: {
        id: parameterinfo.id,
        rate: values.rate
      },
    })
    .then(res => {
      console.log("res is >>>", res);
      openNotificationWithIcon('success', 'Parameter Updated!', 'Rate Successfully Updated!');
    })
  }



  render() {
    return (
      <div className="container">
        <div className="row">
        <div className="col col-8 offset-2" style={{marginTop: '10px'}}>
        <h4>Rate Information</h4>
        <List
          itemLayout="horizontal"
          dataSource={this.state.parameterinfos}
          renderItem={parameterinfo => (
            <List.Item>
              <Form
                style={{width: '80%', border: '1px solid #abaaad'}}
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                size="middle"
                initialValues={parameterinfo}
                onFinish={this.handleSubmit(parameterinfo)}
              >
                <Form.Item label="Parameter Description">{parameterinfo.description}</Form.Item>
                <Form.Item label="Rate" name="rate">
                  <InputNumber />
                </Form.Item>
                <Form.Item {...tailLayout}>
                  <Button type="primary" htmlType="submit">
                    Update
                  </Button>
                </Form.Item>
              </Form>
            </List.Item>
          )}
        />
        </div>
        </div>
      </div>
    );
  }
}

export default withApollo(ParameterInfosAdminPage);