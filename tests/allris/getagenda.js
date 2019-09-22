const chai = require('chai');
const expect = require('chai').expect;
const assertArrays = require('chai-arrays');
chai.use(assertArrays);

function checkEntry( entry, length ) {
  expect(entry).to.be.array();
  expect(entry.length).to.equal(length);

  expect(entry[0]).to.have.property('topic');
  expect(entry[0].topic).to.be.a('string');

  expect(entry[0]).to.have.property('description');
  expect(entry[0].description).to.be.a('string');
}

module.exports = function() {
  it('should fetch an agenda by siLfdNr', function(done) {
    const Allris = require('../../allris').Allris;

    const allris = new Allris('https://www.wentorf.sitzung-online.com/bi');
    allris.getAgenda( { siLfdNr: 4198 } )
    .then( entry => {
      checkEntry( entry, 16 );
      done();
    })
  });

  it('should fetch an agenda by url', function(done) {
    const Allris = require('../../allris').Allris;

    const allris = new Allris('https://www.wentorf.sitzung-online.com/bi');
    allris.getAgenda( { url: 'https://www.wentorf.sitzung-online.com/bi/to010.asp?SILFDNR=4198' } )
    .then( entry => {
      checkEntry( entry, 16 );
      entry.forEach( e => {
        console.log( e.description.substring( 0, 40)  + (e.description.length > 40 ? '\u2026' : ''));
      });
      done();
    })
  });
}


