'use strict;';

class AllrisCalendarEntry {
  constructor( startDate, summary, description, location ) {
    this.startDate = startDate;
    this.summary = summary;
    this.location = location;
    this.link = null;
    this.setDescription( description );
  }

  setDescription( value ) {
    this.description = value;
    this.link = null;
    if( value ) {
      const idx = value.indexOf("https://");
      if( idx => 0 )
        this.link = value.substring(idx);
    }
  }

  static fromVevent( vevent ) {
    return new AllrisCalendarEntry(
      vevent.properties.DTSTART[0].value,
      vevent.properties.SUMMARY[0].value,
      vevent.properties.DESCRIPTION[0].value,
      vevent.properties.LOCATION[0].value );
  }

}

module.exports = AllrisCalendarEntry;
