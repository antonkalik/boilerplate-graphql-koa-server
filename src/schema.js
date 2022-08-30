const { gql } = require('apollo-server-koa');

module.exports = gql`
  type Query {
    getFakeDataExample: DataExample
  }

  type DataExample {
    id: ID
    value: String
  }

  type Mutation {
    updateFakeData(value: String!): DataExample!
  }
`;
