#!/bin/sh

cd $(dirname "$0")
cd ..
BINPATH=node_modules/.bin/sass

SOURCE=client/style.scss
TARGET=public/style.css

if [ "$1" = "--watch" ]; then
  BINPATH="$BINPATH --watch"
fi

$BINPATH $SOURCE $TARGET
