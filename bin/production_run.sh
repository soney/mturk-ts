#!/bin/bash
set -x

if [ "$#" -ne 1 ]; then
  echo "Please provide posting data directory"
  exit 1
fi

dataFilePath=$1
logPath="$PWD/log.txt"
round=1
startTime="`date +%Y_%m_%d_%H_%M_%S`"
echo "Run MTurk task $startTime" >> $logPath
while [ $round -le 5 ]
do
  echo "start round $round" >> $logPath
  counter=1
  while [ $counter -le 10 ]
  do
    echo "start subround $counter" >> $logPath

    current_date_time="`date +%Y_%m_%d_%H_%M_%S`"
    echo $current_date_time >> $logPath

    npm start 2 >> $logPath
    echo "finished retrieving" >> $logPath

    python3 mturk_util.py 2 e >> $logPath
    echo "finished evaluating" >> $logPath

    python3 mturk_util.py 2 a >> $logPath
    echo "finished approving" >> $logPath

    python3 mturk_util.py 2 r >> $logPath
    echo "finished rejecting" >> $logPath

    npm start 1 $dataFilePath >> $logPath
    echo "finished posting" >> $logPath

    echo "finish subround $counter" >> $logPath
    echo "====================================================================================" >> $logPath
    echo "====================================================================================" >> $logPath

    ((counter++))
    sleep 600s
  done
  echo "finish round $round" >> $logPath
  ((round++))
  sleep 1800s
done
