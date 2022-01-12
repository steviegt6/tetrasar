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
$ bash _install.sh # installs any necessary tools
$ bash _build.sh # actually builds and archives to an app.asar file
```

# Concepts
TETR.ASAR is still in its infancy. It is very under-developed and lots of planning must still be done. Concept discussion and feedback is vital.

## HTML Patching
The first step of HTML patching is to actually hook into the loading of files. This can be done by:
```ts
// or really any point in which we wish to load a modified html file...
window.addEventListener("load", () => {
    // we have access to the document object which we can query and modify as needed
    // document.querySelectorAll("blah"); // etc.

    // this will allow us to patch in html, modify existing html, etc.
    // tetr.io classes and ids are static between versions so worrifying about anything breaking is unneeded
});

