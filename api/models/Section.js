/**
 * Section.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    description: {
      type: Sequelize.TEXT,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false
    }

  },


  associations: function() {

  },

  options: {
    underscored: true,
    timestamps: false
  }
};

