// Scene components and behaviors are mostly made
// by inheriting the `GameBehavior` class

// These will be inside GameObjects

class Example extends GameBehavior
{
    text = "";

    Start ()
    {
        // Start code goes here
        // Called on GameObject start

        alert(this.text);
    }

    Update ()
    {
        // Update code goes here
    }

    FixedUpdate ()
    {
        // Physics updates go here
    }


    // Some other messages

    Awake () { } // Called on class instantiation/creation
    
    OnEnable () { } // Called when the class instance goes active
    
    LateUpdate () { } // Called before rendering
    
    OnApplicationQuit () { } // self explanatory
    
    OnDisable () { } // Called when the class instance goes inactive
    
    OnDestroy () { } // Called when the class instance gets destroyed
}