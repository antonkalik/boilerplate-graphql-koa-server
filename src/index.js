const Koa = require('koa');
const http = require('http');
const { readFileSync } = require('fs');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { koaMiddleware } = require('@as-integrations/koa');
const { loadSchema } = require('@graphql-tools/load');
const { UrlLoader } = require('@graphql-tools/url-loader');
const { makeExecutableSchema, mergeSchemas } = require('@graphql-tools/schema');

const resolvers = require('./resolvers');
const typeDefs = readFileSync('./src/schema.graphql', { encoding: 'utf-8' });

const EXTERNAL_ENDPOINT = 'http://localhost:4000/api/v1/graphql';

(async () => {
  const app = new Koa();
  const httpServer = http.createServer(app.callback());

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
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();

  app.use(cors());
  app.use(bodyParser());
  app.use(
    koaMiddleware(apolloServer, {
      context: async ({ ctx }) => ({ token: ctx.headers.token }),
    })
  );

  const resolveHttpServer = resolve => httpServer.listen({ port: process.env.PORT }, resolve);
  await new Promise(resolveHttpServer);

  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}/api/v1/graphql`);
})()
