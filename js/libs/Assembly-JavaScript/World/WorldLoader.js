class WorldLoader extends GameBehavior
{
    #state = 0;

    Start ()
    {
        (async () => {
            await PackLoader.Set();
            await World.Load();
            await SceneManager.Load(1);

            this.#state = 1;
        })();
    }

    Update ()
    {
        if (this.#state === 1)
        {
            SceneManager.SetActiveScene(1);

            this.#state = 3;
        }
    }
}