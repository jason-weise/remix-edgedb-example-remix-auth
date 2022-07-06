CREATE MIGRATION m1rbp72aqv7hwbm4n7cn6q3qogo7rvmqgtttyn4b42kbgumez3cbaq
    ONTO initial
{
  CREATE TYPE default::Note {
      CREATE REQUIRED PROPERTY body -> std::str;
      CREATE REQUIRED PROPERTY created_at -> std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY title -> std::str;
      CREATE PROPERTY updated_at -> std::datetime;
  };
  CREATE TYPE default::User {
      CREATE REQUIRED PROPERTY created_at -> std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY email -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY updated_at -> std::datetime;
  };
  ALTER TYPE default::Note {
      CREATE LINK user -> default::User;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK notes := (.<user[IS default::Note]);
  };
  CREATE TYPE default::Password {
      CREATE REQUIRED PROPERTY hash -> std::str;
  };
  ALTER TYPE default::User {
      CREATE LINK password -> default::Password {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Password {
      CREATE LINK user := (.<password[IS default::User]);
  };
};
