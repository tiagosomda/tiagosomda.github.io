#copy CNAME
copy .\docs\CNAME CNAME -ErrorAction SilentlyContinue

# delete directory
rm -r -Force .\docs\*
rmdir -Force .\docs
mkdir docs

# build / generate static website
cd .\src
hugo -t hugo-split
cd ..
copy CNAME .\docs\CNAME 
rm -Force CNAME

# commit changes in docs
git add .\docs\*