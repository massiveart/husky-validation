#!/bin/bash

set -xe

npm install -g grunt-cli
npm install -g bower

npm install
bower install

grunt travis
