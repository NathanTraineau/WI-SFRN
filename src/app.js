

// ---------------------------------------------------------
// ----------------------- CONST ---------------------------
// ---------------------------------------------------------

const express = require("express");
let app = new express();
const verifier = require('alexa-verifier-middleware');
const alexaRouter = express.Router();

var u = require('./utiles');
var client = require('./database_connection');


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
            case 'GetTomorrowSchedule':
                var value = req.body.request.intent.slots.class.value
                var classVal = value.replace(/\s/g, '').toUpperCase()
                res.json(getTomorrowSchedule(classVal,"1")); // TODO find group
            break;
            case 'GetNextSession':
                var value = req.body.request.intent.slots.class.value
                var classVal = value.replace(/\s/g, '').toUpperCase()
                var course = req.body.request.intent.slots.course.value
                res.json(getNextCourseSession(classVal,"1", course)); // TODO find group and course
            break;
            case 'registerUserInfo':
                res.json(registerUser(req,res))
            default:
                const response = response_to_Alexa("no data")
                res.json(response)
            }
    }
});


// POUR LES TESTS PCQ SINON PLANTE VU QUE C'EST PAS ALEXA QUI RENVOIE LA REQUETE
// --------------------------- LOCAL ----------------------------------
app.get("/tomorrow", function(req, res) {
    if (req.query.class != null){
      const user_class = req.query.class;
      res.json(getTomorrowSchedule(user_class,"1"));
    }
    else{
      const response = response_to_Alexa("no data")
      res.json(response);
  }
});


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



app.get('/create', client.addUser);
app.get('/get', client.getUsers);
app.put('/update/:id', client.addUser);

app.get('/yoyo', function(req,res){
  const resp = u.isUserInfoRight("IG5","2")
  if(resp){
    res.json("true")
  }else{
    res.json("false");
  }
  
});

app.get('/yo', function(req,res){
  const resp = client.userExists(2)
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



// GET THE SCHEDULE FOR TOMORROW
getTomorrowSchedule = function(user_class, group){
    return u.getDaySchedule(user_class,group,1);
}

// GET THE SCHEDULE FOR TOMORROW
getNextCourseSession = function(user_class, group, course){
    return u.getNextCourseSession(user_class, group, course)
}


plain_text_array = function(parsed, action){
console.log(parsed)
    //This function take a json text as parameter and the info the user should get on the courses
    var res = ""
    switch (action) {
        case 'tomorrow':
            res = parsed.courses.map( function(course) {
                let info = "Demain, vous avez cours de " + course.name + " de " + course.start_time + " à " + course.end_time + " en salle " + course.location;
                return info;
            })
        case 'next':
            const monthslist = [ "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre" ];

            res = parsed.courses.map( function(course) {
                let info = "Votre prochain cours de " + course.name + " aura lieu le " + course.date + " " + monthslist[course.month -1] + " de " + course.start_time + " à " + course.end_time +  " en salle " + course.location;
                return info;
            })
  }
  return res
}

response_to_Alexa = function(plain_text,shouldEndSession){
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