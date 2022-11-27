## HomeSoon App
Don't forget to leave a note on the fridge.

Create a shareable trip plan that will receive updates through the Garmin inReach API.

### Trip Planner
User can create and edit trips, containing inputs for departure, return and overdue times. If an overdue time is given, instructions are given for what actions an emergency contact should take. Google Maps API is used to add planned waypoints and routes to a map. If the user connects their account to a publicly visible Garmin inReach, any tracking points and messages that are sent during the trip are added to the map.

### Trip Viewer
A read-only view for individual trips that can be shared with others. Contains trip details, map, emergency instructions and contact details for emergency contacts. This is an unauthenticated view accessed by a UUID for each trip.

### User Viewer
User can share a static URL with their emergency contacts who will have access to view all current and previous trip data for that user. This view is loosely protected by a pass phrase set by the user.

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
- Trip planning features
- Invite other users to trips
- Migration to OpenTopo


### Development stack
- ReactJS frontent
- Django Rest API backend
- Hosted on Railway.app


### Deploy to Railway
Deploy to Railway from GitHub and create a PostgresQL database.

Set the following environment variables:
- DB_NAME=railway
- DB_USER=postgres
-DB_PW=<database_password>
- DB_HOST=<database_host>
- DB_PORT=<database_port>
- REACT_APP_GOOGLE_API_KEY=<google_API_key>
- REACT_APP_DEMO_USERNAME=<demo_email_address>
- REACT_APP_DEMOUSER_PW=<demo_password>
- DATABASE_URL=<postgres_db_url>
- NIXPACKS_NODE_VERSION=14
- DJ_KEY=<django_secret_key>
- IS_PRODUCTION=True
- NIXPACKS_PYTHON_VERSION=3.7


Set Nixpacks build command: yarn run build && python manage.py migrate
Deployment start command: gunicorn backend.wsgi --log-file -