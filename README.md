### Alexa application 
We receive a request from Alexa, the structure is simple and we should parse this request

The given information are : the id of the user and other informations about its request
(the schedule for tomorrow, where does the next course take place, update his user information...)

From these information, we should be able to get the class of the user (that we stored previously)

And request the good url to get the course from the year

We should then parse the response to get what the user wants and send a proper json file in response to alexa.
