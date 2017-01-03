#!/usr/bin/env bash
set -e

. ~/.nvm/nvm.sh
nvm use 6
rm -rf node_modules
yarn install
yarn test -- --reporters junit
mkdir -p ../results
mv ./test-results/*.xml ../results