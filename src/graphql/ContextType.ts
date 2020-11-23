import Knex from "knex";

export default interface ContextType {
  knex: {
    default: Knex
  }
}