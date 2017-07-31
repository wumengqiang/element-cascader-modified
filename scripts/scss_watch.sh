#! /bin/bash
base_dir=$(dirname $0)
sass --scss --watch --sourcemap $base_dir/../src/scss:$base_dir/../src/styles
echo "watching"

