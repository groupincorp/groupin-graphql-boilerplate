const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: process.env.MYSQL_DEFAULT,
    pool: { min: 2, max: 10 },
    migrations: {
      extension: 'ts',
    },
  }
};
