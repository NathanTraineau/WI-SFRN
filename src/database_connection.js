
const Pool = require('pg').Pool;
const connectiontring = 'postgres://postgres:91bbd0e19ecf58b2b2f43d6c2d14fb26@dokku-postgres-wi-sfrn-db:5432/wi_sfrn_db';
var connectionString = " postgres://postgres:a8e425583269bfba0a9250b092e7b0ce@dokku-postgres-wi-sfrn-db2:5432/wi_sfrn_db2";

var pool = new Pool(connectiontring);

const poool = new Pool({
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





/*
const db = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'postgres',
      database : 'wave_it_skill'
    }
  });

const query = {
    text: 'INSERT INTO Users(user_id,class,group) VALUES($1, $2, $3)',
    values: ['2', 'fef','fsfqgr'],
  }

module.exports = { 
    
    addUser: function(req,res,next){
        const re = db('Users').insert({user_id: "freg"}, {class: "fsjfsj"}, {group: "fsljfl"})
        res.json(re)
    },

    getUsers: function(req,res,next){
        const re = db.select('*').from('Users')
        res.json(re)
    }
}*/

      