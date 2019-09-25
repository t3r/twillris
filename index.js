'use strict;';
/*
This is twillris - a ALLRIS to Twitter bridge
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

const Allris = require('./allris').Allris;
const Twit = require('twit')
const moment = require('moment-timezone');
moment.locale('de');

if( process.env.node_env !== 'production' )
  require('dotenv').config()


const T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})

function PublishTwitter( entry ) {
  const TWEET_PREFIX = process.env.TWEET_PREFIX || 'Sitzung #Wentorf: ';
  const status = `${TWEET_PREFIX}${moment(entry.startDate).tz('Europe/Berlin').format('D.M.YYYY HH:mm')} | ${entry.summary}, ${entry.location} (Tagesordnung: ${entry.link})`;
  console.log( entry, "==>", status );

  //return Promise.resolve({ status });
  return T.post('statuses/update', { status });
}

exports.handler = async (event) => {
  const now = new Date();
  const fromDate = process.env.FROM_DATE || ('00'+now.getUTCDate()).slice(-2) + '.' + ('00'+(now.getUTCMonth()+1)).slice(-2) + '.' + now.getUTCFullYear();
  let toDate;
  if( process.env.DATE_RANGE_DAYS ) {
    const d2 = moment().add( Number(process.env.DATE_RANGE_DAYS), 'days' ).toDate();
    toDate = ('00'+d2.getUTCDate()).slice(-2) + '.' + ('00'+(d2.getUTCMonth()+1)).slice(-2) + '.' + d2.getUTCFullYear();
  }
  console.log("publishing date", fromDate, toDate );
  let allris = new Allris( process.env.ALLRIS_URL );
  try {
    let result = await allris.getCalendar( fromDate, toDate )
    if( result && Array.isArray(result) ) {
      const proms = [];
      result.forEach( async (entry) => {
        proms.push( PublishTwitter( entry ) );
      })
      try {
        let publishResult = await Promise.all( proms );
      }
      catch( err ) {
        console.error("Error publishing twitter",err);
      }
    }
    return result
  }
  catch( err ) {
    console.error("Error", err );
  }
};

if( process.env.node_env !== 'production' )
  exports.handler();
