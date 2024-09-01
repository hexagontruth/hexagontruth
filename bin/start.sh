#!/bin/bash

export env=${env:-dev}

dir=$(dirname $0)/..

cd $dir
echo `pwd`

if [[ $NODE_ENV == "production" ]]; then
  node server
else
  node server &
  npm run dev
fi
