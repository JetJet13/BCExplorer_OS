#!/bin/bash
while [ true ]; do
  if ps aux | grep "[.]/BCparserv02.py" > /dev/null
  then
    echo "BCparserv02 is running"
  else
    echo "BCparserv02 is not running"
    echo "Starting it up...."
    /usr/bin/python ./pyScripts/BCparserv02.py
  fi
  echo "sleeping"
  sleep 30
  echo "done sleeping"
done
