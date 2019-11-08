const client = require('./database_connection');
const u = require('./utiles');
var wait = require('wait.for-es6');

module.exports = {

     c_addUser : function(user_id,user_class,user_group){
        
        var classe = value.replace(/\s/g, '').toUpperCase()
        var value_group = req.body.request.intent.slots.group.value
        var group = value.replace(/\s/g, '').toUpperCase()
        if(u.isUserInfoRight(user_class,user_group)){
            client.addUser(user_class,user_group,user_id)
             return true
        }
        else{
            return false
        }
        },

        c_getUserById : function(user_id){
            return new Promise((resolve,reject) => {
                client.getUserById(user_id, (successResponse) => {
                    resolve(successResponse);
                }, (errorResponse) => {
                    reject(errorResponse)
                });
            });
        }
        
    }
