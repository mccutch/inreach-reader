export const USER_CACHE = "dynamic-user";

export const DEFAULT_MAP_CENTER = {
  lat: -36.89471583987405,
  lng: 147.13738916242673,
}; //Mt Feathertop

export const DEFAULT_LINE_COLOUR = "#b422a8";
export const STROKE_WEIGHT = 2;
export const DEFAULT_GMAP_ZOOM = 13;
export const DEFAULT_GMAP_BIAS_RADIUS = 30;
export const GOOGLE_MAP_ID = "baseMap";
export const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
export const GOOGLE_IMPORT_SCRIPT_ID = "googleLibrariesImport"

export const MAX_LEN_USERNAME = 30; //Defined in django docs?
export const MAX_LEN_PASSWORD = 30;
export const MAX_LEN_EMAIL = 60;
export const MAX_LEN_NAME = 60;

export const POSITION_DECIMALS = 10;

export const OVERDUE_INSTRUCTIONS =
  "Action required by your home base if you are overdue. Prefill this field by saving a default to your profile.";

export const GARMIN_STATUS_UNKNOWN = 0
export const GARMIN_NOT_CONNECTED_TO_PROFILE = 1
export const GARMIN_OK = 2
export const GARMIN_EXTERNAL_ERROR = 3
export const GARMIN_INTERNAL_ERROR = 4
export const GARMIN_NOT_OK = 5