#!/bin/sh

cd json-server
json-server  data.json  -p 3001 &
cd ..
npm run start2

