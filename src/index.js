const Koa = require('koa');
const http = require('http');
const cors = require('@koa/cors');
const { ApolloServer } = require('apollo-server-koa');
const { loadSchema } = require('@graphql-tools/load');
const { UrlLoader } = require('@graphql-tools/url-loader');
const { makeExecutableSchema, mergeSchemas } = require('@graphql-tools/schema');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const EXTERNAL_ENDPOINT = 'http://localhost:4000/api/v1/graphql';

async function server({ typeDefs, resolvers }) {
  const app = new Koa();
  const httpServer = http.createServer();

  const internalSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const schemas = [internalSchema];

  try {
    const externalSchema = await loadSchema(EXTERNAL_ENDPOINT, {
      loaders: [new UrlLoader()],
    });
    schemas.push(externalSchema);
  } catch {
    console.warn('⚠️️ External Schema has not been loaded');
  }

  const apolloServer = new ApolloServer({
    introspection: true,
    schema: mergeSchemas({
      schemas,
    }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/api/v1/graphql' });
  httpServer.on('request', app.callback());
  await new Promise(resolve => httpServer.listen({ port: process.env.PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`);

  return { apolloServer, app };
}

server({ typeDefs, resolvers }).then(({ app }) => {
  app.use(cors());
});
