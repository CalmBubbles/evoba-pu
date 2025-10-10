class Player extends GameBehavior
{
    static hp = 10;
    static maxHp = 10;
    static blockCount = 0;
    static strength = 2;
    static speed = 1;

    static instance = null;

    #delay = 0.2;
    #timer = 0;
    #xTime = 0;
    #yTime = 0;
    #pos = new Vector2(0, 2);

    Start ()
    {
        Player.instance = this;

        this.transform.position = World.grid.CellToWorld(this.#pos);
        this.#timer = this.#delay / Player.speed;
    }

    Update ()
    {
        if (!World.loadedChunk) return;

        if (Math.abs(this.transform.position.x - this.#pos.x) < 0.1 * Player.speed)
        {
            const groundNode = ChunkLoader.GetNodeByPos(Vector2.Add(this.#pos, Vector2.down));

            if (groundNode != null && groundNode.owner == null)
            {
                this.#pos.y -= 0.5;
                this.#timer += Time.deltaTime;
            }
        }

        this.transform.position = Vector2.Lerp(
            this.transform.position,
            World.grid.CellToWorld(this.#pos),
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

        const targetPos = Vector2.Add(this.#pos, input);
        const nextNode = ChunkLoader.GetNodeByPos(targetPos);

        if (nextNode == null || (input.y > 0 && Player.blockCount === 0)) return;

        if (nextNode.owner != null)
        {
            if (nextNode.owner.hardness - Player.strength > 0) return;

            Player.blockCount++;
            nextNode.RemoveTile();
        }

        if (input.y > 0 && Player.blockCount > 0)
        {
            Player.blockCount--;
            ChunkLoader.GetNodeByPos(this.#pos).SetTile("pu:dirt");
        }

        Window.SetTitle(Player.blockCount);

        this.#pos = targetPos;
        this.#timer = this.#delay / Player.speed;
    }
}