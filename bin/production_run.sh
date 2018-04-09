#!/bin/bash
set -x

counter=1
while [ $counter -le 15 ]
do
  ((counter++)) >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt

  current_date_time="`date +%Y_%m_%d_%H_%M_%S`"
  echo $current_date_time >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt

  npm start 2 >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt
  echo "finished retrieving" >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt

  python3 mturk_util.py 2 e >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt
  echo "finished evaluating" >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt

  python3 mturk_util.py 2 a >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt
  echo "finished approving" >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt

  python3 mturk_util.py 2 r >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt
  echo "finished rejecting" >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt

  npm start 1 >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt
  echo "finished posting" >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt

  echo "====================================================================================" >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt
  echo "====================================================================================" >> /Users/Xu/Desktop/gh_workspace/mturk/mturk-ts/log.txt

  sleep 600s
done
