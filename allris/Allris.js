'use strict;';
const got = require('got');
const iCal = require('icalendar');

const AllrisCalendarEntry = require('./AllrisCalendarEntry.js');

class Allris {
  constructor( baseUrl ) {
    this.baseUrl = baseUrl;
  }
}

Allris.prototype.getCalendar = function( startDate, endDate ) {
  const query = new URLSearchParams([
    ['kaldatvonbis', startDate + '-' + (endDate ? endDate : startDate) ],
    ['selfAction', 'Inhalte exportieren']
  ]);

  return got('si010_e.asp', {
    baseUrl: this.baseUrl,
    query
  })
  .then( response => {
    const reply = []
    let c = iCal.parse_calendar(response.body + '\r\n')
    if( c.components.VEVENT && c.components.VEVENT.forEach ) {
      c.components.VEVENT.forEach( vevent => {
        reply.push( AllrisCalendarEntry.fromVevent( vevent ) );
      });
    }
    return reply
  })
  .catch( error => {
    console.error(error);
  })
}

module.exports = Allris;
