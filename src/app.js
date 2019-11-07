// ---------------------------------------------------------
// ----------------------- CONST ---------------------------
// ---------------------------------------------------------

var assert = require('assert');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
const express = require("express");
let app = new express();
const verifier = require('alexa-verifier-middleware');
const alexaRouter = express.Router();


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
    return getDaySchedule(user_class,group,1);
} 


// GET THE SCHEDULE FOR THE DAY X
function getDaySchedule(user_class,group, numberOfDayFromToday){
  //This function take the class user, its group and the number of day from today
  //With this information it get the right schedule, parse the result and build a response for alexa.
  var d = new Date();
  var tomorrow = new Date();
  tomorrow.setDate(d.getDate() + numberOfDayFromToday);
  tomorrow.setMonth(d.getMonth() + numberOfDayFromToday);
  const sched = schedule(`https://wave-it.fr/application/cache/json/${user_class}.json`);
  const tomorrowSchedule = scheduleOftheDay(sched,tomorrow.getDate(),tomorrow.getMonth(),tomorrow.getFullYear())
  //We get the courses of the group of our user
  const tomorrowScheduleParsedGroup = parseGroup(tomorrowSchedule,group)
  //We sort the course so we have them in the time order
  const tomorrowScheduleSorted = sortedSchedule(tomorrowScheduleParsedGroup)
  //We build the sentences to give to alexa per course
  const tomorrowScheduleToArray = plain_text_array(tomorrowScheduleSorted)
  //We join it in one string
  const tomorrowScheduleToPlainText = tomorrowScheduleToArray.join(" ")
  const response = response_to_Alexa(tomorrowScheduleToPlainText)
  return response;
}

// GET SCHEDULE FOR THE GIVEN GROUP (LIKE "OPTION 1")
parseGroup = function(schedule,group){
  return schedule.filter(function(course) {
    if(course.hasOwnProperty("grp")){
      //The only case we don't return is when there is a group number
      //and it is not the one given.
      //We keep every other courses.
      return course.grp === group.toString() || course.grp === ""
    }else{
      return true
    }
    
  })
}

// ORDER THE DIFFERENT SLOTS BY HOURS
sortedSchedule = function(scheduleToSort,scheduleSorted = JSON.parse('{"courses":[]}'))
{
  //This function get a JSON 
  //return the object corresponding to the given JSON text
  //assert(typeof(scheduleToSort) == String.type)
  if(( scheduleToSort.length === 0 )){
    //We check whether we finished to sort or not
    return scheduleSorted
  }

  var min = 100
  var mincourse;
  scheduleToSort.filter( function(course) {
    
    var splited = course.start_time.split(":")
    var hour = splited[0]
    if(parseInt(hour) < min){
      mincourse = course
      min = hour
    }
})

var d = scheduleToSort.filter(course => {
  return course.start_time != mincourse.start_time || course.location != mincourse.location})
  
scheduleSorted['courses'].push(mincourse)
return sortedSchedule(d,scheduleSorted);
}


// GET THE ALL JSON SCHEDULE FOR WAVE IT API
schedule = function(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous requests
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

    scheduleOftheDay = function(sched,day_i,month_i,year_i) {
    //This function get all of the course from one specific day 
    //return the object corresponding to the given JSON text
    var s = JSON.parse(sched) 
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
      //This function take a json text as parameter and the info the user should get on the courses
      console.log("jfkmdfjmsqdfjmqsdl" + parsed.type)
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