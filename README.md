## HomeSoon App
Don't forget to leave a note on the fridge.

Create a shareable trip plan that will receive updates through the Garmin inReach API.

### Trip Planner
User can create and edit trips, containing inputs for departure, return and overdue times. If an overdue time is given, instructions are given for what actions an emergency contact should take. Google Maps API is used to add planned waypoints and routes to a map. If the user connects their account to a publicly visible Garmin inReach, any tracking points and messages that are sent during the trip are added to the map.

### Trip Viewer
A read-only view for individual trips that can be shared with others. Contains trip details, map, emergency instructions and contact details for emergency contacts. This is an unauthenticated view accessed by a UUID for each trip.

### User Viewer
Share a static URL with emergency contacts where they will have access to view all current and historical trip data for that user. This view is loosely protected by a pass phrase set by the user.

### User Profile
Users can set:
- Name
- Contact details
- Location (to bias Google API services)
- Emergency contacts
- Standard overdue instructions
- Pass phrase protection for User Viewer
- Garmin inReach MapShare ID


## Feature Development
### Current release
- inReach integration for public accounts
- Basic Google Map interactions
- Shareable urls to public and private views

### Future releases
- inReach integration for password-protected accounts
- Distance and elevation calculations on planned routes
- Weather, tide and avalanche forecast integration
- Packing lists for emergency gear and group planning
- Invite other users to trips
- Migration to OpenTopo


### Development stack
- ReactJS frontent
- Django Rest API backend
- Hosted on Heroku (not yet deployed)
- Google Maps JavaScript API