var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();

module.exports = {
    // ORDER THE DIFFERENT SLOTS BY HOURS
    sortedSchedule: function(scheduleToSort, scheduleSorted = JSON.parse('{"courses":[]}')) {
      //This function get a JSON
      //return the object corresponding to the given JSON text
      //assert(typeof(scheduleToSort) == String.type)
      if(( scheduleToSort.length === 0 )){
        //We check whether we finished to sort or not
        return scheduleSorted
      }

      var min = 100
      var minCourse;
      scheduleToSort.filter( function(course) {

        var splited = course.start_time.split(":")
        var hour = splited[0]
        if(parseInt(hour) < min){
          minCourse = course
          min = hour
        }
      })


      var d = scheduleToSort.filter(course => {
        return course.start_time != minCourse.start_time || course.location != minCourse.location
      })

      scheduleSorted['courses'].push(minCourse)
      return this.sortedSchedule(d,scheduleSorted);
    },

    // GET THE SCHEDULE FOR THE DAY X
    getDaySchedule: function(user_class,group, numberOfDayFromToday){
      //This function take the class user, its group and the number of day from today
      //With this information it get the right schedule, parse the result and build a response for alexa.
      var d = new Date();
      var tomorrow = new Date();
      tomorrow.setDate(d.getDate() + numberOfDayFromToday);
      tomorrow.setMonth(d.getMonth() + numberOfDayFromToday);
      const sched = this.schedule(`https://wave-it.fr/application/cache/json/${user_class}.json`);
      const tomorrowSchedule = this.scheduleOftheDay(sched,tomorrow.getDate(),tomorrow.getMonth(),tomorrow.getFullYear())
      //We get the courses of the group of our user
      const tomorrowScheduleParsedGroup = this.parseGroup(tomorrowSchedule,group)
      //We sort the course so we have them in the time order
      const tomorrowScheduleSorted = this.sortedSchedule(tomorrowScheduleParsedGroup)
      //We build the sentences to give to alexa per course
      const tomorrowScheduleToArray = plain_text_array(tomorrowScheduleSorted)
      //We join it in one string
      const tomorrowScheduleToPlainText = tomorrowScheduleToArray.join(" ")
      const response = response_to_Alexa(tomorrowScheduleToPlainText)
      return response;
    },


    // GET SCHEDULE FOR THE GIVEN GROUP (LIKE "OPTION 1")
    parseGroup: function(schedule,group){
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
    },

    // GET THE ALL JSON SCHEDULE FOR WAVE IT API
    schedule: function(theUrl)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous requests
        xmlHttp.send( null );
        return xmlHttp.responseText;
    },


    // SCHEDULE OF THE D DAY
    scheduleOftheDay: function(sched,day_i,month_i,year_i) {
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



}