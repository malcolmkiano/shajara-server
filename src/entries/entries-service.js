const Service = require('../base-service');
const xss = require('xss');

class EntriesService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  getUserEntries(db, user) {
    return super.getAllItems(db).where({ user_id: user.id});
  }

  serializeEntry(entry) {
    return {
      id: entry.id,
      content: xss(entry.content),
      mood: entry.mood,
      date_created: new Date(entry.date_created).toISOString()
    };
  }
}

module.exports = new EntriesService('shajara_entries');