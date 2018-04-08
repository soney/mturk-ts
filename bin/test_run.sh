#!/bin/bash

npm start 2

echo "finished retrieving"

python3 mturk_util.py 1 e

echo "finished evaluating"

npm start 1

echo "finished posting"