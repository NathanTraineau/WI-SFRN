const client = require('./database_connection');
const u = require('./utiles');

module.exports = {

     addUser : function(user_id,user_class,user_group){
        
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

        userExist : function(user_id){
            var response = client.userExist(user_id)
            return response.then(function(result){
                return result;
            })
        }
    }
