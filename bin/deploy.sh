#!/bin/sh

if [ -z ${1+x} ]; then
  commit=Build
else
  commit=$1
fi

dir=$(dirname $0)/..
cd $dir || exit 1
echo Working from `pwd`...

echo '/dist' > public/.gitignore
echo '!/dist' >> public/.gitignore

git add public

git commit --allow-empty -m "$commit" || exit 1

# if [ "$1" = "-f" ]; then
  branch=$(git branch | grep ^\* | sed 's/\*\s*//g')
  git push origin $(git subtree split --prefix public $branch):gh-pages --force
# else
#   git subtree push --prefix public origin gh-pages
# fi

git reset HEAD^
rm public/.gitignore
