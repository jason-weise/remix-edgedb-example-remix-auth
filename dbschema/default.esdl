module default {

 type User {
    required property email -> str {
        constraint exclusive;
    }

    required property created_at -> datetime {
        default := datetime_current();
    }
    property updated_at -> datetime;

    link password := .<user[is Password];
    multi link notes := .<user[is Note];

  }

  type Password {
    required property hash -> str;
    required link user -> User {
      constraint exclusive;  # one-to-one
      on target delete delete source;
    }

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
