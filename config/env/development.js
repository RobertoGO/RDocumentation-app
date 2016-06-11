/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/
   connections: {
    sequelize_mysql: {
      database: 'rdocsv2',
      user: 'root',
      password: '',
      options: {
        dialect: 'mysql',
        host   : '127.0.0.1',
        port   : 3306,
        pool: {
          max: 10,
          min: 4,
          idle: 10000
        }
      }
    },

    db_migrate: {
      adapter: "sails-mysql",
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'rdoc',
      port: 3306
    }
  },

  models: {
    migrate: 'safe'
  }


};
