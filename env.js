/**
 * A helper class that abstracts out having environment variables set vs
 * using `ENV_VARS.json`. Prioritizes them being set via env variables to the
 * json file.
 */

const envVars = {
  DROPBOX_ACCESS_TOKEN: process.env.DROPBOX_ACCESS_TOKEN,
  DROPBOX_KEY: process.env.DROPBOX_KEY,
  DROPBOX_SECRET: process.env.DROPBOX_SECRET,
  SLACK_ADMINS: process.env.SLACK_ADMINS ? JSON.parse(process.env.SLACK_ADMINS) : null,
  SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID,
  SLACK_TOKEN: process.env.SLACK_TOKEN,
};

try {
  const envVarsJSON = require('./ENV_VARS.json');
  envVars.DROPBOX_ACCESS_TOKEN = envVars.DROPBOX_ACCESS_TOKEN || envVarsJSON.DROPBOX_ACCESS_TOKEN;
  envVars.DROPBOX_KEY = envVars.DROPBOX_KEY || envVarsJSON.DROPBOX_KEY;
  envVars.DROPBOX_SECRET = envVars.DROPBOX_SECRET || envVarsJSON.DROPBOX_SECRET;
  envVars.SLACK_ADMINS = envVars.SLACK_ADMINS || envVarsJSON.SLACK_ADMINS;
  envVars.SLACK_CHANNEL_ID = envVars.SLACK_CHANNEL_ID || envVarsJSON.SLACK_CHANNEL_ID;
  envVars.SLACK_TOKEN = envVars.SLACK_TOKEN || envVarsJSON.SLACK_TOKEN;
} catch (e) {} // eslint-disable-line

/* Now we configure VCAP Services to extract out the cloudant url */
let VCAP_SERVICES = process.env.VCAP_SERVICES ? JSON.parse(process.env.VCAP_SERVICES) : null;
try {
  const vcapServicesJSON = require('./VCAP_SERVICES.json');
  VCAP_SERVICES = VCAP_SERVICES || vcapServicesJSON;
} catch (e) {} // eslint-disable-line

/* Configure cloudant vars before exporting */
envVars.CLOUDANT_URL = VCAP_SERVICES.cloudantNoSQLDB[0].credentials.url;
envVars.CLOUDANT_DB_NAME = 'text_rpg_db';
envVars.CLOUDANT_DESIGN_DOC = 'text_rpg_design';

module.exports = envVars;
