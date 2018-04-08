#!/bin/bash

npm start 2

echo "finished retrieving"

python3 mturk_util.py 2 e

echo "finished evaluating"

python3 mturk_util.py 2 a

echo "finished approving"

python3 mturk_util.py 2 r

echo "finished rejecting"

npm start 1

echo "finished posting"
