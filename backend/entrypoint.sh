#!/bin/sh

# Parse DATABASE_URL (Neon / Render Postgres) and convert to Spring Boot properties
# Format: postgresql://user:password@host[:port]/database[?sslmode=require&...]
if [ -n "$DATABASE_URL" ]; then
  # Remove protocol prefix
  DB_TEMP=$(echo "$DATABASE_URL" | sed 's|^postgresql://||; s|^postgres://||')

  # Extract user:password and host:port/database?params
  DB_USERPASS=$(echo "$DB_TEMP" | cut -d'@' -f1)
  DB_HOSTDB=$(echo "$DB_TEMP" | cut -d'@' -f2-)

  DB_USER=$(echo "$DB_USERPASS" | cut -d':' -f1)
  DB_PASS=$(echo "$DB_USERPASS" | cut -d':' -f2-)

  # Neon's default string carries channel_binding=require, which the JDBC driver
  # does not understand under that name; drop it and keep the rest of the query.
  DB_HOSTDB=$(echo "$DB_HOSTDB" | sed 's/[?&]channel_binding=[^&]*//')
  DB_HOSTDB=$(echo "$DB_HOSTDB" | sed 's/\/\([^?]*\)&/\/\1?/')

  # Hosted Postgres (Neon) requires TLS; add it when the URL does not say otherwise.
  case "$DB_HOSTDB" in
    *sslmode=*) ;;
    *\?*) DB_HOSTDB="${DB_HOSTDB}&sslmode=require" ;;
    *) DB_HOSTDB="${DB_HOSTDB}?sslmode=require" ;;
  esac

  export JDBC_DATABASE_URL="jdbc:postgresql://${DB_HOSTDB}"
  export SPRING_DATASOURCE_USERNAME="$DB_USER"
  export SPRING_DATASOURCE_PASSWORD="$DB_PASS"
fi

exec java -Dfile.encoding=UTF-8 -jar app.jar
