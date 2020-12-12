import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { BrowserRouter } from 'react-router-dom';

import 'antd/dist/antd.css';
import './index.css';
import App from './App';

import configureStore from './configureStore';

const store = configureStore();

const cache = new InMemoryCache({
  dataIdFromObject: object => object.id || null
});
const link = new HttpLink({
  uri: 'http://127.0.0.1:5000/graphql',
  fetchOptions: {
    method: 'POST'
  }
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: token ? `${token}` : "",
    }
  }
});

const client = new ApolloClient({
  cache: cache,
  link: authLink.concat(link),
});

ReactDOM.render(
  <BrowserRouter forceRefresh={true}>
    <ReduxProvider store={store}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </ReduxProvider>
  </BrowserRouter>,
  document.getElementById('root')
);

