#!/bin/sh
# wait-for-it.sh
set -e

host="$1"
port="$2"
shift
shift
cmd="$@"

until nc -z $host $port; do
  echo "${host}:${port} is unavailable - sleeping"
  sleep 1
done

echo "${host}:${port} is up - executing command"

exec $cmd
