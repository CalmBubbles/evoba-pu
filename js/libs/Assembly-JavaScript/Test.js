class Test extends GameBehavior
{
    #a = null;
    #loaded = false;
    #parts = []

    async Start ()
    {
        Crispixels.effect = true;
        this.#a = this.GetComponent(Renderer);

        (async () => {
            this.#parts = [
                await this.Instantiate(Resources.FindPrefab("pu")),
                await this.Instantiate(Resources.FindPrefab("pu")),
                await this.Instantiate(Resources.FindPrefab("pu")),
                await this.Instantiate(Resources.FindPrefab("pu"))
            ];
            
            this.#loaded = true;
        })();
    }

    Update ()
    {
        const input = new Vector2(
            +Input.GetKey(KeyCode.ArrowRight) - +Input.GetKey(KeyCode.ArrowLeft),
            +Input.GetKey(KeyCode.ArrowUp) - +Input.GetKey(KeyCode.ArrowDown)
        );

        this.transform.position = Vector2.Add(this.transform.position, Vector2.Scale(input, Time.deltaTime));

        if (!this.#loaded) return;

        const bounds = this.#a.bounds;

        Window.SetTitle(bounds);

        this.#parts[0].transform.position = bounds.min;
        this.#parts[1].transform.position = bounds.max;
        this.#parts[2].transform.position = new Vector2(bounds.min.x, bounds.max.y);
        this.#parts[3].transform.position = new Vector2(bounds.max.x, bounds.min.y);
    }
}