module default {

 type User {
    required property email -> str {
        constraint exclusive;
    }
    required property created_at -> datetime {
        default := datetime_current();
    }
    property updated_at -> datetime;
    multi link passwords := .<user[is Password];
    link password := assert_single(.passwords filter not exists .retired_at);
    multi link notes := .<user[is Note];
    multi link login_attempts := .<user[is LoginAttempt];
  }

  type Password {
    required property hash -> str;
    required link user -> User {
      constraint exclusive;  # one-to-one
      on target delete delete source;
    };
    property retired_at -> datetime;
  }

  type LoginAttempt {
    required property ip_address -> str;
    required property login_successful -> bool;
    required property attempted_at -> datetime;
     required link user -> User {
      on target delete delete source;
    };
  }

  type Note {
    required property title -> str;
    required property body -> str;
    required property created_at -> datetime {
        default := datetime_current();
    };
    property updated_at -> datetime;
    required link user -> User {
      on target delete delete source;
    }
  }
  
}
