

// ---------------------------------------------------------
// ----------------------- CONST ---------------------------
// ---------------------------------------------------------
var bodyParser = require('body-parser')
const express = require("express");
let app = new express();
const verifier = require('alexa-verifier-middleware');
const alexaRouter = express.Router();
var u = require('./utiles');
var user_controller = require('./user_controller');

// parse application/json
//app.use(bodyParser.json())


// ---------------------------------------------------------
// ----------------------- FUNCTIONS -----------------------
// ---------------------------------------------------------

app.use('/alexa', alexaRouter);

// attach the verifier middleware first because it needs the entire
// request body, and express doesn't expose this on the request object
alexaRouter.use(verifier);
//alexaRouter.use(bodyParser.json())

//We receive a request from Alexa, the structure is simple and we should parse this request
//The given information are : the id of the user
//What he wants (the schedule for tomorrow, where does the next course take place, update his class)
//From these information, we should be able to get the class of the user (that we stored previously)
//And request the good url to get the course from the year
//We should then parse the response to get what the user wants and send a proper json file in response to alexa.

alexaRouter.post("/", function(req, res) {
    //ACTION PAR DEFAULT AU LANCEMENT
    if (req.body.request.type === 'LaunchRequest') {
      res.json(response_to_Alexa("Bonjour, que voulez-vous savoir ?"));
    } else if (req.body.request.type === 'IntentRequest') { //ACTION DEMANDEE PAR L'UTILISATEUR
        switch (req.body.request.intent.name) {
            case 'GetTomorrowScheduleFrench':
                var user_class = req.body.request.intent.slots.userClass.value
                var user_group = req.body.request.intent.slots.userGroup.value
                if(user_class === "undefined" || user_group === "undefined"){
                  //If the user didn't give any information on his class
                  //We have to search what class he is in
                  const user_auth = isUserAuth(req,res)
                  user_auth.then(function(result){
                    if(!result){
                      res.json(response_to_Alexa("Veuillez-vous enregistrer s'il vous plaît, ou donner une classe et un groupe dans votre requête",false))
                    }else{
                      res.json(getTomorrowSchedule(result.class,result.group)); 
                    }
                  }) 
                }else{
                  var classVal = user_class.replace(/\s/g, '').toUpperCase()
                  res.json(getTomorrowSchedule(classVal,user_group));
                }
                 // TODO find group
            break;
            case 'GetNextSessionFrench':
                var user_class = req.body.request.intent.slots.userClass.value
                var user_group = req.body.request.intent.slots.userGroup.value
                var course = req.body.request.intent.slots.userCourse.value
                var courseVal = course.charAt(0).toUpperCase() + course.slice(1) // First letter in Upper Case
                console.log(user_class)
                if( typeof user_class == "undefined" || typeof user_group == "undefined"){
                  //If the user didn't give any information on his class
                  //We have to search what class he is in
                  const user_auth = isUserAuth(req,res)
                  user_auth.then(function(result){
                    if(!result){
                      res.json(response_to_Alexa("Veuillez-vous enregistrer s'il vous plaît, ou donner une classe et un groupe dans votre requête",false))
                    }else{
                      //Problem here about an unhandledPromiseRejectWarning 
                        res.json(getNextCourseSession(result.class,result.group, courseVal))
                    }
                  }) 
                }else{
                  var classVal = user_class.replace(/\s/g, '').toUpperCase()
                  if(u.isUserInfoRight(classVal,user_group)){
                    res.json(getNextCourseSession(classVal,user_group, courseVal))
                  }else{
                    res.json(response_to_Alexa("Veuillez donner une classe et un groupe valide dans votre requête",false))
                  }
                }
                
                
                 // TODO find group and course
            break;
            case 'registerUserInfoFrench':
                const resp = registerUser(req,res)
                resp.then( function(result) {
                  switch(result){
                    case "updated" : res.json(response_to_Alexa("Vos informations ont été modifiées"))
                    break;
                    case "registered" : res.json(response_to_Alexa("Vous avez été enregistré")) 
                    break;
                    case "unregistered" : res.json(response_to_Alexa("Vous avez rentré des informations non valables"))
                    break;
                  }
                  
                })
            break;
            default:
                const response = response_to_Alexa("no data")
                res.json(response)
            }
    }
});

app.post("/", function(req, res) {
  //ACTION PAR DEFAULT AU LANCEMENT
  console.log(req.body.request)
  if (req.body.request.type === 'LaunchRequest') {
    res.json(response_to_Alexa("Bonjour, que voulez-vous savoir ?"));
  } else if (req.body.request.type === 'IntentRequest') { //ACTION DEMANDEE PAR L'UTILISATEUR
      switch (req.body.request.intent.name) {
          case 'GetTomorrowScheduleFrench':
              var user_class = req.body.request.intent.slots.userClass.value
              var user_group = req.body.request.intent.slots.userGroup.value
              if(user_class === "undefined" || user_group === "undefined"){
                //If the user didn't give any information on his class
                //We have to search what class he is in
                const user_auth = isUserAuth(req,res)
                user_auth.then(function(result){
                  if(!result){
                    res.json(response_to_Alexa("Veuillez-vous enregistrer s'il vous plaît, ou donner une classe et un groupe dans votre requête",false))
                  }else{
                    res.json(getTomorrowSchedule(result.class,result.group)); 
                  }
                }) 
              }else{
                var classVal = user_class.replace(/\s/g, '').toUpperCase()
                res.json(getTomorrowSchedule(classVal,user_group));
              }
               // TODO find group
          break;
          case 'GetNextSessionFrench':
              var user_class = req.body.request.intent.slots.userClass.value
              var user_group = req.body.request.intent.slots.userGroup.value
              var course = req.body.request.intent.slots.userCourse.value
              var courseVal = course.charAt(0).toUpperCase() + course.slice(1) // First letter in Upper Case
              console.log(user_class)
              if( typeof user_class == "undefined" || typeof user_group == "undefined"){
                //If the user didn't give any information on his class
                //We have to search what class he is in
                const user_auth = isUserAuth(req,res)
                user_auth.then(function(result){
                  if(!result){
                    res.json(response_to_Alexa("Veuillez-vous enregistrer s'il vous plaît, ou donner une classe et un groupe dans votre requête",false))
                  }else{
                    //Problem here about an unhandledPromiseRejectWarning 
                      res.json(getNextCourseSession(result.class,result.group, courseVal))
                  }
                }) 
              }else{
                var classVal = user_class.replace(/\s/g, '').toUpperCase()
                if(u.isUserInfoRight(classVal,user_group)){
                  res.json(getNextCourseSession(classVal,user_group, courseVal))
                }else{
                  res.json(response_to_Alexa("Veuillez donner une classe et un groupe valide dans votre requête",false))
                }
              }
              
              
               // TODO find group and course
          break;
          case 'registerUserInfoFrench':
              const resp = registerUser(req,res)
              resp.then( function(result) {
                switch(result){
                  case "updated" : res.json(response_to_Alexa("Vos informations ont été modifiées"))
                  break;
                  case "registered" : res.json(response_to_Alexa("Vous avez été enregistré")) 
                  break;
                  case "unregistered" : res.json(response_to_Alexa("Vous avez rentré des informations non valables"))
                  break;
                }
                
              })
          break;
          default:
              const response = response_to_Alexa("no data")
              res.json(response)
          }
  }
});

// POUR LES TESTS PCQ SINON PLANTE VU QUE C'EST PAS ALEXA QUI RENVOIE LA REQUETE
// --------------------------- LOCAL ----------------------------------

async function isUserAuth(req,res) {
    //If the user didn't give any information on his class
    //We have to search what class he is in
    var value_user_id = req.body.session.user.userId
    var user_id = value_user_id.replace(/\s/g, '').toUpperCase()
    const user = await user_controller.c_getUserById(user_id)
      if(!user){
        return null
      }
      else{
        return user
      }
}

// -------------------------------------------------------------
  

let port = 5000;
app.listen(port, function() {
    console.log("Server started listening at localhost:" + port);
});

async function registerUser(req,res){
  var value_user_id = req.body.session.user.userId
  var user_id = value_user_id.replace(/\s/g, '').toUpperCase()
  var value_class = req.body.request.intent.slots.userClass.value
  var user_class = value_class.replace(/\s/g, '').toUpperCase()
  var value_group = req.body.request.intent.slots.userGroup.value
  var user_group = value_group.replace(/\s/g, '').toUpperCase()
  const resp = u.isUserInfoRight(user_class,user_group)
  const exist = await user_controller.c_getUserById(user_id)
  if(resp ){
    if(exist){
      await user_controller.c_updateUser(user_id,user_class,user_group)
      return "updated"
    }else{
    await user_controller.c_addUser(user_id,user_class,user_group)
    return "registered"
  }
}else {
    return "unregistered"
  }
}

// GET THE SCHEDULE FOR TOMORROW
getTomorrowSchedule = function(user_class, group){
    return u.getDaySchedule(user_class,group,5);
}

// GET THE SCHEDULE FOR TOMORROW
getNextCourseSession = function(user_class, group, course){
    return u.getNextCourseSession(user_class, group, course)
}


plain_text_array = function(parsed, action){
    //This function take a json text as parameter and the info the user should get on the courses
    var res = ""
    switch (action) {
        case 'tomorrow':
            if (parsed.courses.length == 0 || typeof parsed.courses[0] == 'undefined') {
                res = ["Vous n'avez pas de cours demain"];
            } else {
                res = parsed.courses.map( function(course) {
                    let info = "Vous avez cours de " + course.name + " de " + course.start_time + " à " + course.end_time + " en salle " + course.location + '<break time="1" />';
                    return info;
                })
            }
        break;
        case 'next':
            const monthslist = [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ];
            if (parsed.courses.length == 0 || typeof parsed.courses[0] == 'undefined') {
                res = ["Ce cours n'est pas encore programmé"];
            } else {
                res = parsed.courses.map( function(course) {
                    let info = "Votre prochain cours de " + course.name + " aura lieu le " + course.date + " " + monthslist[course.month -1] + " de " + course.start_time + " à " + course.end_time +  " en salle " + course.location;
                    return info;
                })
            }
        break;
  }
  return res
}

response_to_Alexa = function(plain_text,shouldEndSession = true){
const speechOutput = "<speak>" + plain_text + "</speak>"
  return {
    "version": "1.0",
    "response": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput
      },
      "shouldEndSession": shouldEndSession
    }
  }
}