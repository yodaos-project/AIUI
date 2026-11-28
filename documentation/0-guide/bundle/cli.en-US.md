# AIX-CLI Tool

Use `aix` to package a project and check which files the package contains.

See the [CLI reference](../../7-tools/cli.en-US.md) for installation requirements and the full list of commands and options.

## Installation

To install the published CLI, use npm with Node.js 20 or later.

```bash
npm install -g @yodaos-pkg/aix-cli
```

## Core Commands

### 1. Pack
Package a development directory into an `.aix` file:

```bash
# Basic packaging
aix pack <source-directory>

# Specify the output filename
aix pack <source-directory> -o my-agent.aix

# Enable asset optimization (compress images and JSON)
aix pack <source-directory> --optimize

# Specify the optimization level (1-3)
aix pack <source-directory> -O --opt-level 3
```

### 2. List Contents
View the file list and sizes inside an AIX package without extracting it:

```bash
aix list <aix-file>
# Or use the alias
aix ls <aix-file>
```

## Ignore Files (.aixignore)

The packaging tool recognizes the `.aixignore` file in the source root directory. You can use syntax similar to `.gitignore` to exclude files that should not be packaged.
