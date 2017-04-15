#!/bin/bash

# adds vendor assets from installed modules
echo "[ COPYING ] vendor resources"

vendorDir="./public/js/vendor/"

mkdir -p "$vendorDir"

cp -v "./node_modules/js-htmlencode/build/htmlencode.min.js" "$vendorDir"

echo -e "\n[ COPY ] complete"
