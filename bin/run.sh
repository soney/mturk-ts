#!/bin/bash
set -x

npm start 2
echo "finished retrieving"
rm completed.json
python3 evaluate_results.py
echo "finished evaluating"
npm start 1
echo "finished posting"
