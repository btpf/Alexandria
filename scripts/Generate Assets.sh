mkdir public
cd public
mkdir resources
cd resources

echo "curl \"https://www.googleapis.com/webfonts/v1/webfonts?key=$APIKEY\&sort=POPULARITY\" >> webfonts.json"
 
curl "https://www.googleapis.com/webfonts/v1/webfonts?key=$APIKEY&sort=POPULARITY" >> webfonts.json


mkdir Fonts
mkdir Fonts/Noto_Sans
cd ./Fonts/Noto_Sans

URL=$(grep -o '"100": "http://fonts.gstatic.com/s/notosans/.*"' ../../webfonts.json | cut -d '"' -f 4)
curl -o NotoSans-Thin.ttf "$URL"


URL=$(grep -o '"200": "http://fonts.gstatic.com/s/notosans/.*"' ../../webfonts.json | cut -d '"' -f 4)
curl -o NotoSans-ExtraLight.ttf "$URL"

URL=$(grep -o '"300": "http://fonts.gstatic.com/s/notosans/.*"' ../../webfonts.json | cut -d '"' -f 4)
curl -o NotoSans-Light.ttf "$URL"

URL=$(grep -o '"regular": "http://fonts.gstatic.com/s/notosans/.*"' ../../webfonts.json | cut -d '"' -f 4)
curl -o NotoSans-Regular.ttf "$URL"

URL=$(grep -o '"500": "http://fonts.gstatic.com/s/notosans/.*"' ../../webfonts.json | cut -d '"' -f 4)
curl -o NotoSans-Medium.ttf "$URL"

URL=$(grep -o '"600": "http://fonts.gstatic.com/s/notosans/.*"' ../../webfonts.json | cut -d '"' -f 4)
curl -o NotoSans-SemiBold.ttf "$URL"

URL=$(grep -o '"700": "http://fonts.gstatic.com/s/notosans/.*"' ../../webfonts.json | cut -d '"' -f 4)
curl -o NotoSans-Bold.ttf "$URL"

URL=$(grep -o '"800": "http://fonts.gstatic.com/s/notosans/.*"' ../../webfonts.json | cut -d '"' -f 4)
curl -o NotoSans-ExtraBold.ttf "$URL"

URL=$(grep -o '"900": "http://fonts.gstatic.com/s/notosans/.*"' ../../webfonts.json | cut -d '"' -f 4)
curl -o NotoSans-Black.ttf "$URL"


cd ../../../../
dir

cp -r ./public ../
rm -rdf ./public
