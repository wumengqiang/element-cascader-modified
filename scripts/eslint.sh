#!/bin/bash

base_dir=$(dirname $0)/../
eslint ./src/**/*.js --fix
eslint ./src/**/*.vue --fix
eslint ./test/**/*.js --fix
