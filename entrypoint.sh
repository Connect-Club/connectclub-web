#!/bin/sh

echo "Check that we have API_PATH vars"
test -n "$API_PATH"

find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#<API_PATH>#$API_PATH#g"

echo "Check that we have PICS_DOMAIN vars"
test -n "$PICS_DOMAIN"

find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#<PICS_DOMAIN>#$PICS_DOMAIN#g"

echo "Starting Nextjs"
exec "$@"
