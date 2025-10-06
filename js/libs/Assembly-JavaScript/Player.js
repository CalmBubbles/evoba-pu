class Player extends GameBehavior
{
    #delay = 0.2;
    #timer = 0;
    #xTime = 0;
    #yTime = 0;
    #pos = new Vector2(0, 2);

    #grid = null;

    Start ()
    {
        Crispixels.effect = true;
        FPSMeter.enabled = true;
        FPSMeter.detailed = true;

        this.#grid = GameObject.Find("grid").GetComponent("Grid");

        this.transform.position = this.#grid.CellToWorld(this.#pos);
        this.#timer = this.#delay;

        TerrainBuilder.Generate();
    }

    Update ()
    {
        this.transform.position = Vector2.Lerp(
            this.transform.position,
            this.#grid.CellToWorld(this.#pos),
            20 * Time.deltaTime
        );

        const input = new Vector2(
            +Input.GetKey(KeyCode.ArrowRight) - +Input.GetKey(KeyCode.ArrowLeft),
            +Input.GetKey(KeyCode.ArrowUp) - +Input.GetKey(KeyCode.ArrowDown)
        );

        if (input.x !== 0) this.#xTime++;
        else if (this.#xTime !== 0) this.#xTime = 0;

        if (input.y !== 0) this.#yTime++;
        else if (this.#yTime !== 0) this.#yTime = 0;

        if (Vector2.Abs(input).Equals(Vector2.one))
        {
            if (this.#xTime > this.#yTime) input.x = 0;
            else input.y = 0;
        }

        if (this.#timer > 0)
        {
            this.#timer -= Time.deltaTime;

            return;
        }

        if (Vector2.zero.Equals(input)) return;

        this.#pos = Vector2.Add(this.#pos, input);

        this.#timer = this.#delay;
    }

    LateUpdate ()
    {
        FPSMeter.Update();
    }
}