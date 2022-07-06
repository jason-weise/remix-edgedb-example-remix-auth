module default {

  type Password {
    required property hash -> str;
    link user := .<password[is User];

  }

  type Note {
    required property title -> str;
    required property body -> str;

    required property created_at -> datetime {
        default := datetime_current();
    };
    property updated_at -> datetime;

    link user -> User;
  }

   type User {
    required property email -> str {
        constraint exclusive;
    }

    required property created_at -> datetime {
        default := datetime_current();
    }
    property updated_at -> datetime;

    link password -> Password {
        constraint exclusive;
    };
    multi link notes := .<user[is Note];

  }
}
