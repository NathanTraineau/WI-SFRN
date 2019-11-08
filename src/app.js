

// ---------------------------------------------------------
// ----------------------- CONST ---------------------------
// ---------------------------------------------------------

const express = require("express");
let app = new express();
const verifier = require('alexa-verifier-middleware');
const alexaRouter = express.Router();
var u = require('./utiles');
var user_controller = require('./user_controller');


// ---------------------------------------------------------
// ----------------------- FUNCTIONS -----------------------
// ---------------------------------------------------------

app.use('/alexa', alexaRouter);

// attach the verifier middleware first because it needs the entire
// request body, and express doesn't expose this on the request object
alexaRouter.use(verifier);


//We receive a request from Alexa, the structure is simple and we should parse this request
//The given information are : the id of the user
//What he wants (the schedule for tomorrow, where does the next course take place, update his class)
//From these information, we should be able to get the class of the user (that we stored previously)
//And request the good url to get the course from the year
//We should then parse the response to get what the user wants and send a proper json file in response to alexa.

alexaRouter.post("/", function(req, res) {


    
    //ACTION PAR DEFAULT AU LANCEMENT
    if (req.body.request.type === 'LaunchRequest') {
      res.json(getTomorrowSchedule("STE4"));
    } else if (req.body.request.type === 'IntentRequest') { //ACTION DEMANDEE PAR L'UTILISATEUR
        switch (req.body.request.intent.name) {
            case 'GetTomorrowScheduleFrench':
                var user_class = req.body.request.intent.slots.userClass.value
                var user_group = req.body.request.intent.slots.userGroup.value
                if(user_class == null){
                  //If the user didn't give any information on his class
                  //We have to search what class he is in
                  const user_auth = isUserAuth(req,res)
                  if(user_auth){
                    user_class = user_auth.class
                    user_group = user_auth.group
                  }else{
                    res.json(response_to_Alexa("Veuillez-vous enregistrer s'il vous plaît, ou donner une classe dans votre requête"))
                  }   
                }
                var classVal = user_class.replace(/\s/g, '').toUpperCase()
                res.json(getTomorrowSchedule(classVal,"1")); // TODO find group
            break;
            case 'GetNextSessionFrench':
                var value = req.body.request.intent.slots.userClass.value
                var classVal = value.replace(/\s/g, '').toUpperCase()
                var course = req.body.request.intent.slots.userCourse.value
                res.json(getNextCourseSession(classVal,"1", course)); // TODO find group and course
            break;
            case 'registerUserInfoFrench':
                if(res.json(registerUser(req,res))){
                  res.json(response_to_Alexa("Vous avez été enregistré"))
                }
                else{
                  res.json(response_to_Alexa("Vous avez rentré des informartions non valables"))
                }
            default:
                const response = response_to_Alexa("no data")
                res.json(response)
            }
    }
});


// POUR LES TESTS PCQ SINON PLANTE VU QUE C'EST PAS ALEXA QUI RENVOIE LA REQUETE
// --------------------------- LOCAL ----------------------------------
app.get("/tomorrow", isUserAuth )

async function isUserAuth(req,res) {
    try {
  const user_class = req.query.class;
  if(user_class == null){
    //If the user didn't give any information on his class
    //We have to search what class he is in
    const userId = req.query.userId
    const result = await user_controller.c_getUserById(userId)
      if(!result){
        return null
      }
      else{
        return result
      }
    }
  }
  catch(error) {
    console.error("ERROR:" + error);
}
}
app.get("/create",function(req,res){
  if(res.json(registerUser(req,res))){
    res.json(response_to_Alexa("Vous avez été enregistré"))
  }
  else{
    res.json(response_to_Alexa("Vous avez rentré des informartions non valables"))
  }
})


app.get("/next-session", function(req, res) {
    if (req.query.class != null){
      const user_class = req.query.class;
      res.json(getNextCourseSession(user_class, "1", "Audit"));
    }
    else{
      const response = response_to_Alexa("no data")
      res.json(response);
  }
});

// -------------------------------------------------------------


app.get('/yoyo', function(req,res){
  const resp = u.isUserInfoRight("IG3","T")
  if(resp){
    res.json("true")
  }else{
    res.json("false");
  }
});
  

let port = 5000;
app.listen(port, function() {
    console.log("Server started listening at localhost:" + port);
});


function registerUser(req,res){
  var value_user_id = req.body.request.intent.slots.user_id.value
  var user_id = value_user_id.replace(/\s/g, '').toUpperCase()
  var value_class = req.body.request.intent.slots.class.value
  var user_class = value_class.replace(/\s/g, '').toUpperCase()
  var value_group = req.body.request.intent.slots.group.value
  var user_group = value_group.replace(/\s/g, '').toUpperCase()
  return user_controller.addUser(user_id,user_class,user_group)
}

// GET THE SCHEDULE FOR TOMORROW
getTomorrowSchedule = function(user_class, group){
    return u.getDaySchedule(user_class,group,1);
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
            if (parsed.courses.length == 0) {
                res = ["Vous n'avez pas de cours demain"];
            } else {
                res = parsed.courses.map( function(course) {
                    let info = "Demain, vous avez cours de " + course.name + " de " + course.start_time + " à " + course.end_time + " en salle " + course.location;
                    return info;
                })
            }
        break;
        case 'next':
            const monthslist = [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ];
            if (parsed.courses.length == 0) {
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