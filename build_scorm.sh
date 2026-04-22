npm run build
python3 postbuild_path_fix.py
rm bashhero_scormpackage.zip
zip -r bashhero_scormpackage.zip imsmanifest.xml out