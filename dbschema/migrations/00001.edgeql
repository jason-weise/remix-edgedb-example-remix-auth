CREATE MIGRATION m1cvgopa2b45wko34sahth56bz73wqxv4wjtsyv4new5oi6mdiyapq
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
      CREATE REQUIRED LINK user -> default::User {
          ON TARGET DELETE  DELETE SOURCE;
      };
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK notes := (.<user[IS default::Note]);
  };
  CREATE TYPE default::Password {
      CREATE REQUIRED LINK user -> default::User {
          ON TARGET DELETE  DELETE SOURCE;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY hash -> std::str;
  };
  ALTER TYPE default::User {
      CREATE LINK password := (.<user[IS default::Password]);
  };
};
