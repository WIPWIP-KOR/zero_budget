// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_smooth_strong_guy.sql';
import m0001 from './0001_harsh_dagger.sql';
import m0002 from './0002_far_lord_tyger.sql';
import m0003 from './0003_skinny_sharon_ventura.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003
    }
  }
  