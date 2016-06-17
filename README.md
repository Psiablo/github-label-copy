# Github Label Copy
This is a Node command-line tool that looks at a source Github repos labels, and
creates them in a target Github repo. It should save time setting up new repos
labels if you have an existing repo with a label structure you reuse.

## Installation
You must have Node already installed on your system.

```
npm install -g github-label-copy
```

## Usage
```
Usage: ghlabelcp [options] <source:owner/repo> <target:owner/repo>

  Options:

    -h, --help                 output usage information
    -u, --username <username>  The user to authenticate as
    -p, --password <password>  The user's password
    -t, --token <token>        The user's authentication OAuth token
```

It is recommended to use a Github OAuth token over supplying your password. Make
sure you have given the token access to the "Repo" permissions.

The source and target repo arguments should be formatted as `owner/repo`.

Example `https://github.com/Psiablo/github-label-copy` -> `Psiablo/github-label-copy`.
