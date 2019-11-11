
const { Pool,Client } = require('pg')
const isProduction = process.env.NODE_ENV === 'production'
require('dotenv').config();
const connectionString = 'postgres://yieqxnmnufyqqg:5e7e8ad3d79c26d0011140594608f0684a9b43f5211ef11e89a9af94f730115e@ec2-54-197-238-238.compute-1.amazonaws.com:5432/d174t33san13ah';

//const pool2 = new Pool(connectiontring);//We tried to connect to the dokku hosted database without success.

const client = new Client({
  connectionString: connectionString,
  ssl: true
})
client.connect(function(err){
})

module.exports = { 
  //ADD USER TO THE DATABASE
  addUser: function(user_id,user_class,user_group, successCallback, errorCallback){
    pool.query('insert into "Users" values ($1, $2, $3)',[user_class, user_group,user_id],(err,results) => {
      if (err) errorCallback(err)
      successCallback(results.rows[0])
    })
  },

  //UPDATE USER4S INFORMATIONS TO THE DATABASE
  updateUser: function(user_id,user_class,user_group, successCallback, errorCallback){
    pool.query('update "Users" set "user_class"=$1 , "user_group"=$2 where "user_id"=$3',[user_class, user_group,user_id],(err,results) => {
      if (err) errorCallback(err)
      successCallback(results)
    })
  },

  //GET A USER FROM THE DATABASE
  getUsers: function(successCallback, errorCallback){
    pool.query(('SELECT * FROM "Users"'),(err, results) => {
      if (err) errorCallback(err)
      successCallback(results.rows[0])
    })
  },

    getUserById: function(user_id, successCallback, errorCallback){
      const query = {
        text: 'SELECT * FROM "Users" where user_id = $1 ',
        values: [user_id],
      }
      pool.query(query,(err, results) => {
      if (err) errorCallback(err)
      successCallback(results.rows[0])
    })
  }
}

      