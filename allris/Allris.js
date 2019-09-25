'use strict;';
/*
This file is part of twillris - a ALLRIS to Twitter bridge
Copyright (C) 2019 Torsten Dreyer - torsten (at) t3r (dot) de

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
const got = require('got');
const iCal = require('icalendar');
const cheerio = require('cheerio');
const moment = require('moment-timezone');

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
    encoding: 'utf8',
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

  const action = options.url ?
    got( options.url, {
      encoding: 'latin1'
    }) :
    got('to010.asp', {
      baseUrl: this.baseUrl,
      encoding: 'latin1',
      query
    });
  return action
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

Allris.prototype.ShrinkAgenda = function( agenda, maxLength ) {
  const KillWords = /Einwohnerfragestunde|Niederschrift|Berichte|Anfragen|Anträge zur Tagesordnung|Eröffnung der Sitzung|Beschluss über den Ausschluss|Bekanntgabe der.*Beschlüsse|Bericht über die Ausführung/i

  function AgendaLength( agenda ) {
    let l = 0;
    agenda.forEach( e => {
      l += e.description.length
    });
    return l;
  }

  agenda = agenda.filter( entry => { 
    return !KillWords.test( entry.description ); 
  });

  function ShrinkEntries( agenda, maxLength ) {
    if( AgendaLength( agenda ) < maxLength ) return agenda;

    let longest = 0;
    agenda.forEach( e => {
      longest = Math.max( e.description.length, longest );
    });
    agenda.forEach( e => {
      if( e.description.length >= longest )
        e.description = e.description.substring( 0, e.description.length-2 )+ '\u2026';
    });
    return ShrinkEntries( agenda, maxLength );
  }

  return ShrinkEntries( agenda, maxLength );
}

Allris.prototype.makeShortTweet = function( calendarEntry ) {
  const TWEET_PREFIX = process.env.TWEET_PREFIX || 'Sitzung #Wentorf: ';
  const status = `${TWEET_PREFIX}${moment(calendarEntry.startDate).tz('Europe/Berlin').format('D.M.YYYY HH:mm')} | ${calendarEntry.summary}, ${calendarEntry.location} (Tagesordnung: ${calendarEntry.link})`;
  return status;
}

Allris.prototype.makeDetailedTweet = async function( calendarEntry ) {

  const TWEET_PREFIX = process.env.TWEET_PREFIX || 'Sitzung #Wentorf: ';
  let status = `${TWEET_PREFIX}${moment(calendarEntry.startDate).tz('Europe/Berlin').format('D.M.YYYY HH:mm')} | ${calendarEntry.summary} (`;

  let agenda = await this.getAgenda( calendarEntry.link );

  agenda = this.ShrinkAgenda( agenda, 278 - status.length - agenda.length*1 );
  let topics = [""];
  agenda.forEach( topic => {
    topics.push( topic.description );
  });

  status += topics.join('\u2023') + ')';

  return status;
}

module.exports = Allris;
