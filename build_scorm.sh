export BUILDING_SCORM="true"

echo "\n>>>NEXTJS BUILD<<<"
npm run build

echo "\n>>>FIXING PATHS<<<"
python3 postbuild_path_fix.py

echo "\n>>>REMOVING OLD PACKAGE<<<"
rm bashhero_scormpackage.zip

echo "\n>>>ZIPPING<<<"
zip -r bashhero_scormpackage.zip imsmanifest.xml out