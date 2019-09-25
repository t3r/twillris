'use strict'
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
const chai = require('chai');
const expect = require('chai').expect;
const assertArrays = require('chai-arrays');
chai.use(assertArrays);


module.exports = function() {
  const Allris = require('../../allris').Allris;

  it('should create simple tweets for a day', async function() {
    const allris = new Allris('https://www.wentorf.sitzung-online.com/bi');
    let calendar = await allris.getCalendar( "30.09.2019" );
    expect( calendar ).to.be.array();
    calendar.forEach( entry => {
      const tweet = allris.makeShortTweet( entry );
      expect( tweet ).to.be.a('string');
      console.log(tweet);
    });

    return Promise.resolve();
  });

  it('should create detailed tweets for a day', async function() {
    const allris = new Allris('https://www.wentorf.sitzung-online.com/bi');
    let calendar = await allris.getCalendar( "01.10.2019" );
    expect( calendar ).to.be.array();
    calendar.forEach( async(entry) => {
      const tweet = await allris.makeDetailedTweet( entry );
console.log(tweet.length, tweet);
      expect( tweet ).to.be.a('string');
      expect( tweet.length ).to.be.lt( 280 );
    });

    return Promise.resolve();
  });
}
