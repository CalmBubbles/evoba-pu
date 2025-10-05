class CharCtrl extends GameBehavior
{
    #delay = 0.2;
    #timer = 0;
    #xTime = 0;
    #yTime = 0;
    #pos = Vector2.zero;

    #grid = null;

    Start ()
    {
        Crispixels.effect = true;
        FPSMeter.enabled = true;
        FPSMeter.detailed = true;

        this.#grid = GameObject.FindComponents("Grid")[0];

        this.transform.position = this.#grid.CellToWorld(this.#pos);
        this.#timer = this.#delay;
    }

    Update ()
    {
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
        this.transform.position = this.#grid.CellToWorld(this.#pos);

        this.#timer = this.#delay;
    }

    LateUpdate ()
    {
        FPSMeter.Update();
    }
}