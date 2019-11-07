
const { Client } = require('pg');
const connectionString = 'postgres://postgres:91bbd0e19ecf58b2b2f43d6c2d14fb26@dokku-postgres-wi-sfrn-db:5432/wi_sfrn_db';


const query = {
    text: 'INSERT INTO Users(user_id,class,group) VALUES($1, $2, $3)',
    values: ['2', 'fef','fsfqgr'],
  }

module.exports = { 
    
    addUser: function(req,res,next){
        const client = new Client({
            connectionString: connectionString
        });
        client.connect()
        .then(() => console.log("Connected successfuly"))
        .then(() => client.query(query, (err, res) => {
            if (err) {
              console.log(err.stack)
            } else {
              console.log(res.rows[0])
            }
          }))
        
        .finally(() => client.end())
    res.json({
        message : "user created"
    })
    },

    getUsers: function(req,res,next){
        const client = new Client({
            connectionString: connectionString
        });
        client.connect()
            .then(() => client.query("select * from Users"))
            .then(results => res.json({
                message : "resultsss" + results
            }))
            .catch(e => console.log(e))
            .finally(() => client.end())
        
    }
}

      