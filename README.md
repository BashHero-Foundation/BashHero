# Bash Hero

## Simple scorm package bulid (linux / mac / wsl)

### with docker

just run script
```bash
docker build --output . . 
```

### without docker

u need to have node and python3 installed
```bash
npm install
chmod +x build_scorm.sh
./build_scorm.sh
```

and copy `bashhero_scormpackage.zip` to your prefered lms system.

## Testing locally

with node and python3 installed

### on linux

```bash
npm install
npm run linux
```

### on bimbows :(

```bash
npm install
npm run bimbows
```

and go to `localhost:3000`

**`npm run dev` dont work for this project**