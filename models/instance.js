const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: 'rootpassword',
  database: 'whatsappChat',
});

const User = sequelize.define('instance', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },  
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },  
    number: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }, 
    authenticated: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }, 
  },
  {
    timestamps: false // Disable timestamps
});

module.exports = User ;
