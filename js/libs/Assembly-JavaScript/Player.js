class Player extends Entity
{
    static instance = null;

    #delay = 0.2;
    #timer = 0;
    #xTime = 0;
    #yTime = 0;

    #fallStart = null;

    get #dependentDelay ()
    {
        return this.#delay + Math.max(0.2 * (3 - this.energy), 0);
    }

    hp = 10;
    maxHp = 10;
    energy = 15;
    maxEnergy = 15;
    tiles = 0;
    strength = 2;
    pos = new Vector2(0, 2);

    Start ()
    {
        const playerData = World.GetPlayer(UserData.id);

        if (playerData != null)
        {
            this.pos.Set(playerData.pos.x, playerData.pos.y);
            this.tiles = playerData.tiles;
            this.hp = playerData.hp;
            this.maxHp = playerData.maxHp;
            this.energy = playerData.energy;
            this.maxEnergy = playerData.maxEnergy;
        }

        Player.instance = this;

        this.transform.position = World.grid.CellToWorld(this.pos);
        this.#timer = this.#dependentDelay / this.speed;
    }

    FixedUpdate ()
    {
        if (Math.abs(this.transform.position.x - this.pos.x) < (0.04 / this.#dependentDelay) * this.speed)
        {
            const groundNode = ChunkLoader.GetNodeByPos(Vector2.Add(this.pos, Vector2.down));

            if (groundNode != null && groundNode.owner == null)
            {
                if (this.#fallStart == null) this.#fallStart = this.pos.y;

                this.pos.y -= Time.fixedDeltaTime * 30;
                this.#timer += Time.deltaTime;
            }
            else if (this.#fallStart != null)
            {
                this.pos.y = Math.ceil(this.pos.y);
                const fallHeight = Math.round(this.#fallStart - this.pos.y);
                this.#fallStart = null;

                if (fallHeight > 3)
                {
                    const dmg = Math.max((fallHeight - 3) * 2, 0);
                    this.hp -= dmg;
                    Window.SetTitle(this.hp);

                    Cam.instance.Shake(
                        Math.Clamp(0.01 * dmg, 0.125, 0.5),
                        Vector2.Min(
                            Vector2.Scale(new Vector2(0.5, 3), dmg),
                            new Vector2(3, 20)
                        ),
                        Math.min(4 * dmg, 10)
                    );
                }
            }

            World.SetPlayer(this);
        }
    }

    #UpdateMovement ()
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

        const targetPos = Vector2.Add(this.pos, input);
        const nextNode = ChunkLoader.GetNodeByPos(targetPos);

        if (nextNode == null || (input.y > 0 && this.tiles === 0)) return;

        if (nextNode.owner != null)
        {
            if (nextNode.owner.hardness - this.strength > 0) return;

            this.tiles++;
            this.energy -= 0.025;
            nextNode.RemoveTile();
        }

        if (input.y > 0 && this.tiles > 0)
        {
            this.tiles--;
            this.energy -= 0.025;
            ChunkLoader.GetNodeByPos(this.pos).SetTile("pu:dirt");
        }

        if (input.y < 0) targetPos.y = this.pos.y;

        this.pos = targetPos;
        this.#timer = this.#dependentDelay / this.speed;

        World.SetPlayer(this);
    }

    Update ()
    {
        this.#UpdateMovement();

        if (this.hp < this.maxHp)
        {
            this.hp = Math.min(this.hp + 0.0625 * Time.deltaTime, this.maxHp);
            this.energy = Math.max(this.energy - 0.078125 * Time.deltaTime, 0);
        }
    }

    LateUpdate ()
    {
        this.transform.position = Vector2.Lerp(
            this.transform.position,
            World.grid.CellToWorld(this.pos),
            20 * Time.deltaTime
        );
    }
}