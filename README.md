# Bash Hero

## Simple scorm package bulid (linux / mac / wsl)

### with docker

just run script
```bash
docker build --output . . 
```

### without docker

u need to have node installed
```bash
chmod +x build_scorm.sh
./build_scorm.sh
```

and copy `bashhero_scormpackage.zip` to your prefered lms system.

## Uruchomienie

1. Sklonuj repozytorium 
2. Następnie `npm i` - instaluje wszystkie zależności 
3. Uruchom aplikację `npm run dev` 

4. Widok pod: `http://localhost:3000`

## Staticly build

1. same as in **Uruchomienie** `npm i`
2. staticly build with `npm run build`
3. congratulations, uve just created static build in `out/` directory

## Creating scorm package

1. same as in **Staticly build**
2. zip scorm package `zip -r bashhero_scormpackage.zip imsmanifest.xml out`
3. congratulations, scorm package created with name `bashhero_scormpackage.zip`