class Test extends GameBehavior
{
    #a = null;
    #loaded = false;
    #parts = []

    async Start ()
    {
        Crispixels.effect = true;
        this.#a = this.GetComponent("Renderer");

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
        if (!this.#loaded) return;

        const bounds = this.#a.bounds;

        this.#parts[0].transform.position = bounds.min;
        this.#parts[1].transform.position = bounds.max;
        this.#parts[2].transform.position = new Vector2(bounds.min.x, bounds.max.y);
        this.#parts[3].transform.position = new Vector2(bounds.max.x, bounds.min.y);
    }
}