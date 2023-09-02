# Note to self: DDL Link generated with https://sites.google.com/site/gdocs2direct/

# Download assets bundle instead of generating them
wget -O - "https://drive.google.com/uc?export=download&id=1PjRz4N4v5fqEd3wzX9Fh01s7nK5U19X0" > temp.zip
unzip temp.zip

rm temp.zip
cp -r ./public ../
rm -rdf ./public
