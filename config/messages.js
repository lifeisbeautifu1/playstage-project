const moment = require('moment');

function formatMessage(id, text) {
  return {
    id,
    text,
    time: moment().format('MMMM Do, h:mm a'),
  };
}

module.exports = formatMessage;
