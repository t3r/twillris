'use strict;';
const got = require('got');
const iCal = require('icalendar');
const cheerio = require('cheerio');


const AllrisCalendarEntry = require('./AllrisCalendarEntry.js');
const AllrisAgendaEntry = require('./AllrisAgendaEntry.js');

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
    encoding: 'latin1',
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
}

Allris.prototype.getAgenda = function( options ) {
  if( typeof (options) === 'string' )
    options = { url: options }

  const query = new URLSearchParams([
    ['SILFDNR', options.siLfdNr  ],
  ]);

  return got('to010.asp', {
    baseUrl: this.baseUrl,
    encoding: 'latin1',
    query
  })
  .then( response => {
    const $ = cheerio.load(response.body);
    const reply = []
    const t = $("table.tl1 tr").each( (idx,element)=> {
      if( idx < 2 ) return;
      const td = $(element).children("td");
      if( td.length != 7 ) return;
      if( ! $(td[0]).text().trim().length ) return;
      reply.push( new AllrisAgendaEntry( $(td[0]).text(), $(td[3]).text() ));
    });
    return reply;
  })
}

module.exports = Allris;
