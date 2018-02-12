# Mechanical Turk Typescript Library
This is a [TypeScript](https://www.typescriptlang.org/) wrapper for Amazon's [Mechanical Turk](https://www.mturk.com/). It is built on Amazon's [AWS MTurk Node API](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/MTurk.html).

If you don't know what a *HIT*, *Worker*, *Requester*, *Assignment*, or *Reward* are, read about the basics of Mechanical Turk [here](https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMechanicalTurkGettingStartedGuide/SvcIntro.html).

## Recommended Development Environment

**Recommended Editor**: [atom.io](https://atom.io/) with the [atom-typescript plugin](https://atom.io/packages/atom-typescript).

Also recommended Atom plugin: [language-dot](https://atom.io/packages/language-dot) for Dot templates.

## Setup
Install [node and npm](https://nodejs.org/en/) (current version). After cloning this repository, go into the cloned directory and install the package dependencies:

### 1: Install package dependencies
Install the package dependencies (including dev dependencies):
```
npm install --dev .
```

### 2: Specify Mechanical Turk Credentials
By default, this package looks for the file `mturk_creds.json`. First, copy `mturk_creds.sample.json`:
```
cp mturk_creds.sample.json mturk_creds.json
```

Then, replace the `access` and `secret` values with your access key and secret key (which you can get from [requester.mturk.com/developer](https://requester.mturk.com/developer)).

## Running
Running `npm start` will run the "start" script (as specified in `package.json`) to compile and run `src/main.ts`:
```
npm start
```

# API
This code makes use of Promises ([documented here](https://developers.google.com/web/fundamentals/primers/promises)) and `async`/`await` ([documented here](https://developers.google.com/web/fundamentals/primers/async-functions)). Read up on both if you aren't familiar.


## Getting Started
Import into your code:

```
import {MechanicalTurk, MechanicalTurkHIT, MechanicalTurkAssignment, MechanicalTurkWorker} from './mturk_wrapper';
```

`MechanicalTurk` is a wrapper around

## `MechanicalTurk`
```
const mturk = new MechanicalTurk();
```


## Viewing Sandbox Tasks
Unfortunately, Amazon decided to [disable the ability to view HITs created programmatically](https://blog.mturk.com/upcoming-changes-to-the-mturk-requester-website-and-questionform-data-format-f7c3238be58c), so HITs created will not show up on the [requester sandbox](https://requestersandbox.mturk.com/manage). There is a [discussion](https://forums.aws.amazon.com/thread.jspa?messageID=814849&tstart=0) about this decision.

However, you can view your HITs by visiting the worker page ([sandboxed](https://workersandbox.mturk.com/) | [production](https://worker.mturk.com/)).
