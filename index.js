require('dotenv').config()
require('module-alias/register')
const app = require('@src/app');
const InternelEvents = require('@lib/events');
const { log } = require('@lib/logger');

const port = parseInt(process.env.PORT, 10) || 80

InternelEvents.on('ready', () => {
    app.listen(port)
        .then((socket) => log.info(`Listening on port: ${port}`))
        .catch((error) => log.error(`Failed to start webserver on: ${port}\nError: ${error}`));
});