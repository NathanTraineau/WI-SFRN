

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
            res.json(getTomorrowSchedule("IG5","1"));
          break;
        default:
            const response = response_to_Alexa("no data")
            res.json(response)
      }
    }
});


// POUR LES TESTS PCQ SINON PLANTE VU QUE C'EST PAS ALEXA QUI RENVOIE LA REQUETE
// --------------------------- LOCAL ----------------------------------
app.get("/tomorrow", function(req, res) {
  const query = {
    text: 'INSERT INTO Users(user_id,class,group) VALUES($1, $2, $3)',
    values: ['2', 'fef','fsfqgr'],
  }
  // callback
  client.query(query, (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      console.log(res.rows[0])
    }
  })
  // promise
  client
    .query(query)
    .then(res => console.log(res.rows[0]))
    .catch(e => console.error(e.stack))
    if (req.query.class != null){
      const user_class = req.query.class;
      
      res.json(getTomorrowSchedule(user_class,"1"));
    }
    else{
      const response = response_to_Alexa("no data")
      res.json(response);
  }
});
// -------------------------------------------------------------

let port = 5000;
app.listen(port, function() {
    console.log("Server started listening at localhost:" + port);
});



// GET THE SCHEDULE FOR TOMORROW
getTomorrowSchedule = function(user_class,group){
    return u.getDaySchedule(user_class,group,1);
} 


plain_text_array = function(parsed){
  //This function take a json text as parameter and the info the user should get on the courses
  const res = parsed.courses.map( function(course) {
      let info = "You have " + course.name + " from " + course.start_time + " to " + course.end_time + " at the location " + course.location;
      return info;
  })
  return res
}

response_to_Alexa = function(plain_text){
const speechOutput = "<speak>" + plain_text + "</speak>"
  return {
    "version": "1.0",
    "response": {
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput
      },
      "shouldEndSession": true
    }
  }
}