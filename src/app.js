
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
const express = require("express");
let app = new express();
const verifier = require('alexa-verifier-middleware');

const alexaRouter = express.Router();
app.use('/alexa', alexaRouter);

// attach the verifier middleware first because it needs the entire
// request body, and express doesn't expose this on the request object

alexaRouter.use(verifier);
//alexaRouter.use(bodyParser.json());

//We receive a request from alexa, the structure is simple and we should parse this request
//The given informations are : the id of the user
//What he wants (the schedule for tomorrow, where does the next course take place, update his class)
//From these informations we should be able to get the class of the user (that we stored previously)
//And request the good url to get the course from the year
//We should then parse the response to get what the user wants and send a proper json file in response to alexa.


alexaRouter.get("/tomorrow", function(req, res) {

    if (req.body.request.type === 'LaunchRequest') {
      res.json(getTomorrowSchedule("STE4"));
    } else if (req.body.request.type === 'IntentRequest') {
      switch (req.body.request.intent.name) {
        case 'GetTomorrowSchedule':
            res.json(getTomorrowSchedule("IG5"));
          break;
        default:
            const response = response_to_Alexa("no data")
            res.json(response)
  
      }
    }
});

app.get("/tomorrow", function(req, res) {
  if (req.query.class != null){
    const user_class = req.query.class;
    res.json(getTomorrowSchedule(user_class)) 
  }else{
    const response = response_to_Alexa("no data")
    return response;
}
});

let port = 5000;
app.listen(port, function() {
    console.log("Server started listening at localhost:" + port);
});


function getTomorrowSchedule(user_class){
  var d = new Date();
  var tomorrow = new Date();
  tomorrow.setDate(d.getDate() + 8);
  
      const sched = schedule(`https://wave-it.fr/application/cache/json/${user_class}.json`);
      const parsed = parser(sched,tomorrow.getDate(),tomorrow.getMonth(),tomorrow.getFullYear())
      const ress = plain_text_array(parsed)
      const plain_text = ress.join(" ")
      const response = response_to_Alexa(plain_text)
      return response;
  
}

schedule = function(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous requests
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

parser = function(sched,day_i,month_i,year_i) {
    //This function get all of the course from one specific day 
    var s = JSON.parse(sched) 
    //return s.items.filter(d => d.date == day)
    
    return s.items.filter(({
      date,
      month,
      year
    }) => {
      return date.toLowerCase() === day_i.toString() &&
        month.toLowerCase() === month_i.toString() &&
        year.toLowerCase() === year_i.toString()
  
    })
  
  }

  plain_text_array = function(parsed){
      //This function get the info the user should get on the courses
      const res = parsed.map( function(course) {
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
            "type": "PlainText",
            "text": `${plain_text}`     
          },
          "shouldEndSession": true
        }
      }

  }