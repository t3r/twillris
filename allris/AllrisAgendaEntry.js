'use strict;';

class AllrisAgendaEntry {
  constructor( topic, description ) {
    this.topic = topic;
    this.description = (description || '').replace(/(\r\n|\n|\r)/gm," ");
  }
}

module.exports = AllrisAgendaEntry;
