#!/bin/bash

base_dir=$(dirname $0)/../
eslint ./**/*.js --fix
eslint ./**/*.vue --fix
