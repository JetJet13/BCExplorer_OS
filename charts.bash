#!/bin/bash
while [ true ]; do
  if ps aux | grep "[.]/BC_charts.py" > /dev/null
  then
    echo "BC_charts is running"
  else
    echo "BC_charts is not running"
    echo "Starting it up...."
    /usr/bin/python ./pyScripts/BC_charts.py
  fi
  echo "sleeping"
  sleep 86400
  echo "done sleeping"
done