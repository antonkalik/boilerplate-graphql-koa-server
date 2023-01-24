const fakeData = {
  id: 202020202,
  value: 'Some Random String From Graphql Server',
};

module.exports = {
  Query: {
    getFakeDataExample: () => fakeData,
  },
  Mutation: {
    updateFakeData: (_, { value }) => {
      return {
        ...fakeData,
        value,
      };
    },
  },
};
