# Bash Hero

## Building SCORM package

Instructions for debian based linux and mac.

### Using Docker - **recommended**

You need to have [Docker](https://www.docker.com) installed and configured.

Then from project root run

```bash
docker build --output . . 
```

and after some time `bashhero_scormpackage.zip` should appear. Now, if you use Moodle as your LMS system you can go to [Deployment on Moodle](#Deployment-on-Moodle).

### Without Docker

You need to have [Python](https://www.python.org) and [NextJS](https://nextjs.org) installed and configured

Then from project root run

```bash
npm install
chmod +x build_scorm.sh
./build_scorm.sh
```

and after some time `bashhero_scormpackage.zip` should appear. Now, if you use Moodle as your LMS system you can go to [Deployment on Moodle](#Deployment-on-Moodle).

## Deployment on Moodle

### Activity settings

#### Appearance:

| setting                                | value           |
| -------------------------------------- | --------------- |
| Display package                        | New window      |
| Width                                  | 100%            |
| Height                                 | 100%            |
| Options                                | [all unchecked] | 
| Student skip content structure page    | Always          |
| Disable preview mode                   | Yes             |
| Display activity name                  | [unchecked]     |
| Display course structure on entry page | No              |
| Display course structure in player     | Disabled        |
| Display attempt status                 | No              |

#### Grade:

| setting        | value                                                |
| -------------- | ---------------------------------------------------- |
| Grading method | Highest grade                                        |
| Maximum grade  | 1 [(Changing maximum grade)](#Changing-maximum-grade)|

#### Attempts management:

| setting                  | value |
| ------------------------ | ----- |
| Number of attempts       | 1     |
| Force new attempt        | No    |
| Lock after final attempt | No    |

#### Compatibility settings:

| setting                        | value |
| ------------------------------ | ----- |
| Force completed                | No    |
| Auto-continue                  | No    |
| Auto-commit                    | No    |
| Mastery score overrides status | Yes   |

### Changing maximum grade

From scorm package Settings

`Grade -> Maximum grade -> [enter your points]`

From course page click:

`Grades -> Gradebook setup -> (three dots next to scorm package) -> Edit grade item -> show more -> Multiplicator -> [enter your points]`
