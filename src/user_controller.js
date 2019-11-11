const client = require('./database_connection');
const u = require('./utiles');
var wait = require('wait.for-es6');

module.exports = {

    c_addUser : function(user_id,user_class,user_group){
        return new Promise((resolve,reject) => {
            client.addUser(user_id,user_class,user_group, (successResponse) => {
                resolve(successResponse);
            }, (errorResponse) => {
                reject(errorResponse)
            });
        });
    },

    c_updateUser : function(user_id,user_class,user_group){
        return new Promise((resolve,reject) => {
            client.updateUser(user_id,user_class,user_group, (successResponse) => {
                resolve(successResponse);
            }, (errorResponse) => {
                reject(errorResponse)
            });
        });
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
