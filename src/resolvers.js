const fakeData = {
  id: 4838745,
  value: 'Some Random String',
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
