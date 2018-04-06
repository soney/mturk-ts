#!/bin/bash
set -x

counter=1
while [ $counter -le 1 ]
do
  current_date_time="`date +%Y_%m_%d_%H_%M_%S`"
  echo $current_date_time >> /Users/vanditagarwal/Downloads/mturk/mturk-ts/log.txt
  npm start 2 >> /Users/vanditagarwal/Downloads/mturk/mturk-ts/log.txt
  echo "finished retrieving" >> /Users/vanditagarwal/Downloads/mturk/mturk-ts/log.txt
  python3 evaluate_results.py >> /Users/vanditagarwal/Downloads/mturk/mturk-ts/log.txt
  echo "finished evaluating" >> /Users/vanditagarwal/Downloads/mturk/mturk-ts/log.txt
  npm start 1 >> /Users/vanditagarwal/Downloads/mturk/mturk-ts/log.txt
  echo "finished posting" >> /Users/vanditagarwal/Downloads/mturk/mturk-ts/log.txt
  ((counter++)) >> /Users/vanditagarwal/Downloads/mturk/mturk-ts/log.txt
  echo "------------------------------------------------------------------------"  >> /Users/vanditagarwal/Downloads/mturk/mturk-ts/log.txt
  echo "------------------------------------------------------------------------"  >> /Users/vanditagarwal/Downloads/mturk/mturk-ts/log.txt
  sleep 1800
done
