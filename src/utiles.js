var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = {

    // ORDER THE DIFFERENT SLOTS BY HOURS
    // @params : This function get a JSON
    // @return : the object corresponding to the given JSON text
    //assert(typeof(scheduleToSort) == String.type)
    sortedSlotsFromDay: function(scheduleToSort, scheduleSorted = JSON.parse('{"courses":[]}')) {
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
        return this.sortedSlotsFromDay(d,scheduleSorted);
    },

    // ORDER THE DIFFERENT SLOTS BY DATE
    // @params : This function get a JSON
    // @return : the object corresponding to the given JSON text
    //assert(typeof(scheduleToSort) == String.type)
    sortedSlotsFromYear: function(scheduleToSort, scheduleSorted = JSON.parse('{"courses":[]}')) {
        if(( scheduleToSort.length === 0 )){
            //We check whether we finished to sort or not
            return scheduleSorted
        }

        var now = new Date();
        var minDay = 31;
        var minMonth = 11;
        var minYear = now.getYear() + 1971
        var minTime = 100

        var nextCourse;

        scheduleToSort = scheduleToSort.filter( course => {
            return this.getSlotDate(course) > now
        })

        scheduleToSort.filter( function(course) {
            var day = course.date
            var month = course.month
            var year = course.year
            var splited = course.start_time.split(":")
            var hour = splited[0]
            var minute = splited[1]

            if(parseInt(year) <= minYear){
                if (parseInt(month) < minMonth) {
                    minDay = day;
                    minMonth = month;
                    minYear = year
                    minTime = hour

                    nextCourse = course
                } else if (parseInt(month) == minMonth) {
                    if (parseInt(day) < minDay) {
                        minDay = day;
                        minMonth = month;
                        minYear = year
                        minTime = hour

                        nextCourse = course
                    } else if (parseInt(day) == minDay) {
                        if (parseInt(hour) < minTime) {
                            minDay = day;
                            minMonth = month;
                            minYear = year
                            minTime = hour

                            nextCourse = course
                        }
                    }

                }
            }
        })

        var d = scheduleToSort.filter(course => {

            return course != nextCourse;
        })

        scheduleSorted['courses'].push(nextCourse)
        return this.sortedSlotsFromYear(d,scheduleSorted);
     },


    // GET THE SCHEDULE FOR THE DAY X
    // @params : This function take the user class, its group and the number of day from today
    // With this information it get the right schedule, parse the result and build a response for alexa.
    getDaySchedule: function(user_class, group, numberOfDayFromToday){
        var d = new Date();
        console.log(d)
        var tomorrow = new Date();
        tomorrow.setDate(d.getDate() + numberOfDayFromToday);
        tomorrow.setMonth(d.getMonth()+1);
        const sched = this.schedule(user_class);
        const tomorrowSchedule = this.scheduleOftheDay(sched,tomorrow.getDate(),tomorrow.getMonth(),tomorrow.getFullYear())
        console.log(tomorrowSchedule)
        //We get the courses of the group of our user
        const tomorrowScheduleParsedGroup = this.parseGroup(tomorrowSchedule,group)
        //We sort the course so we have them in the time order
        const tomorrowScheduleSorted = this.sortedSlotsFromDay(tomorrowScheduleParsedGroup)
        
        //We build the sentences to give to alexa per course
        const tomorrowScheduleToArray = plain_text_array(tomorrowScheduleSorted, "tomorrow")
        //We join it in one string
        const tomorrowScheduleToPlainText = tomorrowScheduleToArray.join(" ")
        const response = response_to_Alexa(tomorrowScheduleToPlainText)
        return response;
    },

    

    // GET THE NEXT SESSION OF THE COURSE X FOR THE CLASS Y AND GROUP Z
    // @params : This function take the user class, its group and the course name
    // With this information it get the right schedule, parse the result and build a response for alexa.
    getNextCourseSession: function(user_class, group, courseName) {
        const classSchedule = this.schedule(user_class);
        var jsonSchedule = JSON.parse(classSchedule)
        //All slots of the Course
        var allCourseSlots = jsonSchedule.items.filter(({name}) => {
              return name.toString().includes(courseName.toString()) || name.toString().includes(courseName.toString().toUpperCase())
        })
        var groupSchedule = this.parseGroup(allCourseSlots,group)
        var nextCourseSlot = this.getFirstSlot(groupSchedule)

        //We build the sentences to give to alexa per course
        const NextCourseScheduleToArray = plain_text_array(nextCourseSlot, "next")
        //We join it in one string
        const NextCourseScheduleToPlainText = NextCourseScheduleToArray.join(" ")
        const response = response_to_Alexa(NextCourseScheduleToPlainText)
        return response;
    },

    // GET THE FIRST SLOT FROM A SCHEDULE
    // @params : This function take a schedule
    getFirstSlot(schedule) {
        var res = this.sortedSlotsFromYear(schedule)
        res['courses'] = [this.sortedSlotsFromYear(schedule)['courses'][0]]
        return res
    },



    // GET SCHEDULE FILTER WITH THE GIVEN GROUP
    parseGroup: function(schedule, group){
        return schedule.filter(function(course) {
            if(course.hasOwnProperty("grp")){
              // The only case we don't return it, is when there is a group number
              // and it is not the one given.
              // We keep every other courses.
              return course.grp === group.toString() || course.grp === ""
            }else{
              return true
            }
        })
    },

    // GET THE ALL JSON SCHEDULE FROM WAVE IT API
    schedule: function(user_class) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", `https://wave-it.fr/application/cache/json/${user_class}.json`, false ); // false for synchronous requests
        xmlHttp.send( null );
        if(xmlHttp.status == 404){
            return null
        }
        return xmlHttp.responseText;
    },


    // GET SCHEDULE OF THE D DAY
    // @params : This function get all courses from one specific day
    // @return : the object corresponding to the given JSON text
    scheduleOftheDay: function(sched, day_i, month_i,year_i) {
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
    },


    // CHECK IF THE GIVEN USER CLASS AND USER GROUP EXIST
    // @params : user class and user group
    // @return : It return true if the given data are right, false if not.
    isUserInfoRight: function(user_class, user_group) {
        const classSchedule = this.schedule(user_class);
        if(classSchedule === null){
            return false
        }else{
            var s = JSON.parse(classSchedule)
            return s.items.filter(({
                  grp
                }) => {
                  return grp === user_group.toString() 
                }).length != 0
        }
        
    },


    // GET THE DATE OF A SLOT COURSE
    // @params : a slot
    // @return : the date of this slot
    getSlotDate: function(slot) {
          var day = slot.date;
            var month = slot.month;
            var year = slot.year;
            var splited = slot.start_time.split(":");
            var hour = splited[0];
            var minute = splited[1];

            if (month.length == 1) { var formatedMonth = "0" + month}
            else {var formatedMonth = month;}
            if (day.length == 1) { var formatedDay = "0" + day}
                     else {var formatedDay = day;}

            var stringDate = year + "-" + formatedMonth + "-" + formatedDay + "T" + hour + ":" + minute + ":00";
            var date = Date.parse(stringDate);
            return date;
    },

}