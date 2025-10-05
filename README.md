# Crystal Engine

A simple and fast 2D web based game engine that **doesn't require** servers and runtime environments (like [Node.js](https://nodejs.org)) to run.<br>
Make games everywhere, in fact this was initially made on a phone ;)))

You can also freely customize anything, just make sure to not break stuff

> [!IMPORTANT]
> Although there's a tile editor, there's still no general one. So we're stuck on code based editing for now

**Latest version**: 2025.6.3a<br>
**Licensed under**: [MIT](https://github.com/Crystal2D/engine?tab=MIT-1-ov-file#readme)


## Requirements
- Any device (yes even phones)
- A code editor
- Knowledge in object oriented programming


## Recommendations
- A browser for testing
- [Crystal Tile Editor](https://github.com/Crystal2D/tile-editor) for tile editing, can also be used to manage textures and sprites
- Knowledge in game development
- Insight about using [Unity](https://unity.com), as this was the basis of the engine


**Check [here](https://github.com/crystal2d/repositories) for more stuff**


## To start using
1. Download engine<br>

2. Setup [manifest.json](https://github.com/Crystal2D/CrystalEngine/blob/main/manifest.json)
```js
{
    "name": "Project/game name goes here",
    "developer": "Dev name here",

    // Version here
    //
    // Only numbers are evaluated
    // But you can include non-numerical stuff
    // as long as the numbers are at front
    //
    // value u set => evaluated
    // 3.2.16.2 => 3.2.16.2
    // 1.1fJDJ => 1.1
    // 21.12.2.12.1ehgjskdflgfgdsfud018263-9 => 21.12.2.12.1
    // iuqwhe23.1 => NaN (Don't do this)
    "version": "1.0.0",

    "window": {
        "title": "Window title here",
        "width": 750,           // Resolution width (px)
        "height": 500,          // Resolution height (px)
        "windowWidth": null,    // Window width (px), if null then `width` is used
        "windowHeight": null,   // Window height (px), if null then `height` is used
        "marginWidth": null,    // Viewport margin width (px)
        "marginHeight": null,   // Viewport margin height (px)
        "resizable": true,      // Sets if the window should be resizable
        "fullscreen": false,    // Should the game start in fullscreen
        "fillWindow": true,     // Sets if the viewport should take the window's size
        "icon": "icon/icon.png" // Path to window icon
    }
}
```

3. Setup [/data/build.json](https://github.com/Crystal2D/CrystalEngine/blob/main/data/build.json)
```js
{
    "libs" : [                // Libraries here
        "Assembly-JavaScript"
    ],

    "scripts" : [], // Plugins & external scripts

    "resources" : [ // list of inluded resources @ `/data/resources/`
        "main"
    ],

    "scenes" : [
        "scene"
    ],

    "shaders" : [
        "invertColor"
    ],

    // Target FPS
    //     -1: Unlimited
    //     values > 0: Those values (e.g. 30, 45, 60, 120)
    "targetFrameRate" : -1,

    // V-Sync
    //    0: No v-sync, use target FPS
    //    1: Every v-blank, use device refresh rate
    //    2: Every 2nd v-blank, use half of device refresh rate
    "vSyncCount" : 1,

    "runInBackground": false, // should the game run even without focus

    "debugMode" : false, // should you use DevTools shortcuts (i.e. Ctrl+Shift+J)

    "time" : {
        "maximumDeltaTime" : 0.3333333, // Max value of `Time.deltaTime`

        // Scale that time passes
        // Higher = faster time
        "timeScale" : 1,

        "fixedDeltaTime" : 0.02 // The delta time used by physics
    },

    "noFixedUpdate": false // Should FixedUpdate not be called
    
    "partioningMaxDepth" : 8, // Max depth of scene quadtree optimization

    // Input config
    "input": {
        // Gamepad controller settings
        //
        // This is self explanatory lol
        "gamepad": {
            "leftStickDeadzone": {
                "min": 0.125,
                "max": 0.925
            },
            "rightStickDeadzone": {
                "min": 0.125,
                "max": 0.925
            }
        }
    },

    // Add layers
    "layers" : [
        {
            "name": "a new layer",

            // Must not be 0
            // as the default layer uses it
            "id": 1,

            // 0: same as default layer
            // +values: higher layer than default
            // -values: lower layer than default
            "value": -1
        }
    ]
}
```

4. For scripting, you'll mostly be on [/js/libs/Assembly-Javascript/](https://github.com/Crystal2D/CrystalEngine/tree/main/js/libs/Assembly-JavaScript) (totally not stolen from another engine 👀)<br>
Edit the library's [manifest.json](https://github.com/Crystal2D/CrystalEngine/tree/main/js/libs/Assembly-JavaScript/manifest.json)
```js
{
    "name" : "Assembly-JavaScript",
    "description" : "The assembly module where all of the build scripts are located",
    "scripts" : [
        "Example" // Script filepath
    ],
    "preserve": [   // Only used by the compressor
        "idk.txt"   // put here the things you want to preserve as files
    ],
    "classes" : [
        {
            "name": "Example", // Class name

            // Object Type
            // 0: Scene component/behavior
            // 1: Asset/resource
            "type": 0,

            // (Not required) How an object should be created
            "construction": "return new Example();",

            // (Not required) Arguments and properties settable on scene files
            "args": [
                {
                    "name": "text",  // property name

                    // Type
                    // For vanilla data types: boolean, number, string, object, array
                    // For others: their class name (e.g. Vector2)
                    "type": "string"
                }
            ]
        }
    ]
}
```

5. Edit scenes @ [/data/scenes/](https://github.com/Crystal2D/CrystalEngine/tree/main/data/scenes)

6. Edit resources @ [/data/resources/](https://github.com/Crystal2D/CrystalEngine/tree/main/data/resources)

7. Explore the engine