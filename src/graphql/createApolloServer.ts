import { ApolloServer } from 'apollo-server';
import AppResolver from '../resolvers/Resolvers';
import ContextType from './ContextType';
import createKnexContex from './createKnexContext';
import extractRequestToken from './extractRequestToken';
import loadMergeSchema from './loadMergedSchema';

export default function createApolloServer() {
  const knexConnectionList = createKnexContex();

  return new ApolloServer({
    cors: true,
    typeDefs: loadMergeSchema(),
    resolvers: AppResolver,
    playground: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',

    context: async ({ req }): Promise<ContextType> => {
      const token = extractRequestToken(req);
      console.log("Token: ", token);

      return {
        knex: knexConnectionList
      }
    }
  });
}