
const Pool = require('pg').Pool;
const connectiontring = 'postgres://postgres:91bbd0e19ecf58b2b2f43d6c2d14fb26@dokku-postgres-wi-sfrn-db:5432/wi_sfrn_db';
var connectionString = "postgres://postgres:postgres@localhost:5432/wave it skill";


const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: "wi_sfrn_db"
})

module.exports = { 
    
  addUser: function(classe,group,user_id){
    console.log(req.query.user_id)
    pool.query('insert into "Users" values ($1, $2, $3)',[classe, group,user_id],(error,results) => {
      if (error) {
        throw error
      }
      res.status(200).send(`User added with ID: ${results.user_id}`)
    })
  },

  getUsers: function(req,res,next){
    pool.query(('SELECT * FROM "Users"'),(err, results) => {
      if (err) throw err
      //res.write('<li>'+result.rows[0]+'</li>');
      res.status(200).json(results.rows)
    })
  },


  userExists: function(user_id){
    const query = {
      text: 'SELECT * FROM "Users" where user_id = $1 ',
      values: [2],
    }
    pool.query(query,(err, results) => {
      if (err) throw err
      //res.write('<li>'+result.rows[0]+'</li>');
      console.log(results.rows)
      console.log(results.rowsCount != 0)
      return results.rowsCount != 0
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

      