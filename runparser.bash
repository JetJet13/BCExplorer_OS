#!/bin/bash
while [ true ]; do
  if ps aux | grep "[.]/BC_parser.py" > /dev/null
  then
    echo "BC_parser is running"
  else
    echo "BC_parser is not running"
    echo "Starting it up...."
    /home/bcex/BCExplorer_OS/ve/bin/python ./pyScripts/BC_parser.py
  fi
  echo "sleeping"
  sleep 30
  echo "done sleeping"
done
