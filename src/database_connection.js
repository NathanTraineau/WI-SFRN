
const Pool = require('pg').Pool;
const connectiontring = 'postgres://postgres:91bbd0e19ecf58b2b2f43d6c2d14fb26@dokku-postgres-wi-sfrn-db:5432/wi_sfrn_db';

const pool2 = new Pool(connectiontring);

const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: "wi_sfrn_db"
})

module.exports = { 
    
  addUser: function(user_id,user_class,user_group, successCallback, errorCallback){
    pool.query('insert into "Users" values ($1, $2, $3)',[user_class, user_group,user_id],(err,results) => {
      if (err) errorCallback(err)
      successCallback(results.rows[0])
    })
  },

  updateUser: function(user_id,user_class,user_group, successCallback, errorCallback){
    pool.query('update "Users" set "class"=$1 , "group"=$2 where "user_id"=$3',[user_class, user_group,user_id],(err,results) => {
      if (err) errorCallback(err)
      successCallback(results)
    })
  },

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

      