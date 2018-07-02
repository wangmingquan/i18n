module.exports = {
  port: '8882',
  knex: {
    client: 'mysql',
    connection: {
      host: 'localhost',
      user: 'root',
      port: 3306,
      password: 'root123456',
      database: 'i18n'
    }
  }
};