export BUILDING_SCORM="true"

./build_static.sh

echo "\n>>>REMOVING OLD PACKAGE<<<"
rm bashhero_scormpackage.zip

echo "\n>>>ZIPPING<<<"
zip -r bashhero_scormpackage.zip imsmanifest.xml out