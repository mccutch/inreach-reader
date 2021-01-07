
//// IMPORTANT!!!! Forgetting the trailing slash on API endpoint urls can give an authentication error, only on Safari??

// JWT FUNCTIONS
export const GET_TOKEN = '/token/'
export const REFRESH_TOKEN = '/token/refresh/'


export const LOGIN = '/api/login/'

// DATABASE CREATE/GET
export const CURRENT_USER = '/api/current-user/'
export const MY_PROFILE = '/api/my-profile/'
export const MY_TRIPS = '/api/my-trips/'

// DATABASE OBJECTS - No trailing slash
export const USER = '/api/user'//pk
export const PROFILE = '/api/profile'//pk
export const TRIP = './api/trip'//pk


// VIEWER APP
export const VIEW_USER = 'api/view'//username


// ACCOUNT/REGISTRATION - NOCACHE
export const REGISTER = '/account/register/'
export const UPDATE_PASSWORD = '/account/update-password/'
export const DJANGO_ACCOUNT = '/account/'
export const CHECK_USERNAME = '/registration/check-username/'
export const CHECK_EMAIL = '/registration/check-email/'
export const CHECK_UNIQUE = '/registration/check-unique/'


// REACT-ROUTER
export const HOME = '/'
export const CONTACT = '/contact'
export const PLANNER = `/planner`
export const VIEWER = '/view'
export const VIEW_TRIP = '/trip'


const ICON_LOC = '/static/svg/'
export const CO2_ICON = `${ICON_LOC}co2-cloud.svg`
export const CAR_ICON = `${ICON_LOC}car.svg`
export const AIRLINER_ICON = `${ICON_LOC}departures.svg`
export const HELICOPTER_ICON = `${ICON_LOC}helicopter.svg`
export const TRAIN_ICON = `${ICON_LOC}metro.svg`
export const MOTORBIKE_ICON = `${ICON_LOC}motorcycle.svg`
export const CHARTER_PLANE_ICON = `${ICON_LOC}aeroplane.svg`
export const BUS_ICON = `${ICON_LOC}bus.svg`
export const PICKUP_ICON = `${ICON_LOC}pick-up-truck.svg`
export const TRAM_ICON = `${ICON_LOC}tram.svg`
export const GREEN_TEA_ICON = `${ICON_LOC}green-tea.svg`
export const BEAR_ICON = `${ICON_LOC}bear.svg`
export const PIGGY_ICON = `${ICON_LOC}piggy-bank.svg`











