const chai = require('chai');
const expect = require('chai').expect;
const assertArrays = require('chai-arrays');
chai.use(assertArrays);

function checkEntry( entry ) {
  expect(entry).to.be.array();
  expect(entry.length).to.equal(24);

  expect(entry[0]).to.have.property('topic');
  expect(entry[0].topic).to.be.a('string');

  expect(entry[0]).to.have.property('description');
  expect(entry[0].description).to.be.a('string');
}

module.exports = function() {
  it('should fetch an agenda by siLfdNr', function(done) {
    const Allris = require('../../allris').Allris;

    const allris = new Allris('https://www.wentorf.sitzung-online.com/bi');
    allris.getAgenda( { siLfdNr: 4210 } )
    .then( entry => {
      checkEntry( entry );
      done();
    })
  });

  it('should fetch an agenda by url', function(done) {
    const Allris = require('../../allris').Allris;

    const allris = new Allris('https://www.wentorf.sitzung-online.com/bi');
    allris.getAgenda( { url: 'https://www.wentorf.sitzung-online.com/bi/to010.asp?SILFDNR=4210' } )
    .then( entry => {
      checkEntry( entry );
      done();
    })
  });
}


