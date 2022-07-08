CREATE MIGRATION m1apiqshj3ber2gao2x2qaxazcnmi7afsrqdvfmkn7dot3fckurf6q
    ONTO initial
{
  CREATE TYPE default::LoginAttempt {
      CREATE REQUIRED PROPERTY attempted_at -> std::datetime;
      CREATE REQUIRED PROPERTY ip_address -> std::str;
      CREATE REQUIRED PROPERTY login_successful -> std::bool;
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
  ALTER TYPE default::LoginAttempt {
      CREATE REQUIRED LINK user -> default::User {
          ON TARGET DELETE  DELETE SOURCE;
      };
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK login_attempts := (.<user[IS default::LoginAttempt]);
  };
  CREATE TYPE default::Note {
      CREATE REQUIRED LINK user -> default::User {
          ON TARGET DELETE  DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY body -> std::str;
      CREATE REQUIRED PROPERTY created_at -> std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY title -> std::str;
      CREATE PROPERTY updated_at -> std::datetime;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK notes := (.<user[IS default::Note]);
  };
  CREATE TYPE default::Password {
      CREATE REQUIRED LINK user -> default::User {
          ON TARGET DELETE  DELETE SOURCE;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY retired_at -> std::datetime;
      CREATE REQUIRED PROPERTY hash -> std::str;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK passwords := (.<user[IS default::Password]);
      CREATE LINK password := (std::assert_single(.passwords FILTER
          NOT (EXISTS (.retired_at))
      ));
  };
};
