const Sequelize = require('sequelize')
//const config = require('../configuration/config.js')
const sequelize = new Sequelize(
	'web_blog',
	'root',
	'',
	{
		dialect: 'mysql',
		host: 'localhost'
	}
);

module.exports = sequelize;