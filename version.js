#! /usr/bin/node

const assert = require('assert')
const fs = require('fs')
const semver = require('semver')

const release = process.argv[2]

const argErrorMessage = 'Only argument should be: major | minor | patch'
assert(release, argErrorMessage)
assert(release.match(/(major|minor|patch)/g), argErrorMessage)

const manifest = './src/manifest.json'
const pkg = './package.json'
const packageLock = './package-lock.json'
const serverPkg = '../deepcheck-server/package.json'
const serverPackageLock = '../deepcheck-server/package-lock.json'

let nextVersion = null

const paths = [manifest, pkg, packageLock, serverPkg, serverPackageLock]

paths.forEach((p) => {
  const file = fs.readFileSync(p)
  const json = JSON.parse(file)
  const currentVersion = json.version
  if (!nextVersion) {
    nextVersion = semver.inc(currentVersion, release)
  }

  json.version = nextVersion

  console.log(`${p} - Incrementing ${currentVersion} by ${release} resulting in ${nextVersion}`)

  fs.writeFileSync(p, JSON.stringify(json, null, 2))
  fs.appendFileSync(p, '\n')
})

const api = './src/utils/api.js'
fs.writeFileSync(api, `module.exports = 'https://deepcheck.dfblue.com/api/v${semver.major(nextVersion)}'\n`)
