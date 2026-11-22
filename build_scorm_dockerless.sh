export NEXT_PUBLIC_SCORM="true"

echo
echo ">>>NEXTJS INSTALLATION<<<"
npm install

echo
echo ">>>NEXTJS BUILD<<<"
npm run build

echo
echo ">>>FIXING PATHS<<<"
python3 postbuild_path_fix.py

echo
echo ">>>REMOVING OLD PACKAGE<<<"
rm bashhero_scormpackage.zip

echo
echo ">>>ZIPPING<<<"
zip -q -r bashhero_scormpackage.zip imsmanifest.xml out appstarter/*
