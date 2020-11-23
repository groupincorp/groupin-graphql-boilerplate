import '@babel/polyfill';
import * as dotenv from "dotenv";
import createApolloServer from './graphql/createApolloServer';
dotenv.config();

console.log("Starting GraphQL Server");
const server = createApolloServer();
server.listen(process.env.PORT);