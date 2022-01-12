![tetr.io](https://kagari.moe/outer_assets/tetrio/logo-desktop.png)

*The REAL TETR.ASAR OMG I can't believe it it's real wtf TETR.ASAR!!!!!*

# tetrasar (TETR.ASAR)

Patching-capable (TO-DO), clean-room re-implementation of the TETR.IO Electron `.asar` file in TypeScript with added functionality.

# Building

Prerequisites:

- Node.js
- `npm`
- `typescript` (`npm i -g typescript`)

Building is comically easy.

```bash
$ git clone https://github.com/Steviegt6/tetrasar.git
$ cd tetrasar
$ npm i # install all expected deps
$ tsc # requires typescript installed globablly, compiles typescript to /dist
```

Building is now complete. You'll want to copy over `node_modules/`, `src/assets/`, `package.json`, and `package-lock.json` (optionally) to `dist/` as well. Then run `npm prune --production` in the `dist/` folder to get a production-ready distribution folder.

If you wish you package this into an `.asar` file, you'll want the `asar` `npm` module installed `-g`lobally as well. Once installed, `cd` back one directory and run `asar dist app.asar`, which generates an `.asar` file to use that you can replace the normal TETR.IO `app.asar` with.
