#!/bin/sh
repo=$1
b1=$2
b2=$3
workdir="__tmp_dir__"
if [ -f "$workdir" ]; then
    rm -r $workdir
fi
mkdir $workdir
cd $workdir
git clone -q $repo .
git checkout -q $b1
git checkout -q $b2
diff=$(git diff --name-status "$b1..$b2")
printf "$diff\n" 
cd ..
rm -r $workdir
