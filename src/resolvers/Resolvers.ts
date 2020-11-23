import ContextType from "../graphql/ContextType";

const AppResolver = [
  {
    Query: {
      testing: () => ({
        version: "1.0.0",
        name: "Testing"
      }),
      users: async (_, __, ctx: ContextType) => {
        return await ctx.knex.default.table('users').select();
      }
    }
  }
]

export default AppResolver;