class Init extends GameBehavior
{
    #state = 0;

    Start ()
    {
        (async () => {
            await PackLoader.Set();
            await UserData.Load();
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