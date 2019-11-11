
const { Pool,Client } = require('pg')
const isProduction = process.env.NODE_ENV === 'production'
require('dotenv').config();
const connectionString = 'postgres://yieqxnmnufyqqg:5e7e8ad3d79c26d0011140594608f0684a9b43f5211ef11e89a9af94f730115e@ec2-54-197-238-238.compute-1.amazonaws.com:5432/d174t33san13ah';

//const pool2 = new Pool(connectiontring);//We tried to connect to the dokku hosted database without success.

const client = new Client({
  connectionString: connectionString,
})
client.connect(function(err){
  if(err) throw err
  else console.log("fdsiuqljhgl")
})

module.exports = { 
    // ADD A USER TO THE DATABASE
    addUser: function(user_id, user_class, user_group, successCallback, errorCallback){
    pool.query('insert into "Users" values ($1, $2, $3)',[user_class, user_group,user_id],(err,results) => {
      if (err) errorCallback(err)
      successCallback(results.rows[0])
    })
    },

    // UPDATE A USER FROM THE DATABASE
    updateUser: function(user_id,user_class, user_group, successCallback, errorCallback){
        pool.query('update "Users" set "class"=$1 , "group"=$2 where "user_id"=$3',[user_class, user_group,user_id],(err,results) => {
          if (err) errorCallback(err)
          successCallback(results)
        })
    },

    // GET ALL USERS FROM THE DATABASE
    getUsers: function(successCallback, errorCallback){
        pool.query(('SELECT * FROM "Users"'),(err, results) => {
          if (err) errorCallback(err)
          successCallback(results.rows[0])
        })
    },

    // GET A USER WITH SPECIFIC ID FROM THE DATABASE
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

      