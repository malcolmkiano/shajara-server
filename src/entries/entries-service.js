const Service = require('../base-service');

class EntriesService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  getUserEntries(db, user) {
    return super.getAllItems(db).where({ user_id: user.id});
  }
}

module.exports = new EntriesService('shajara_entries');