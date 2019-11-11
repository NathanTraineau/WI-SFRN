
const Pool = require('pg').Pool;
const connectionString = 'postgres://postgres:91bbd0e19ecf58b2b2f43d6c2d14fb26@dokku-postgres-wi-sfrn-db:5432/wi_sfrn_db';

const pool2 = new Pool(connectionString);

const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: "wi_sfrn_db"
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

      