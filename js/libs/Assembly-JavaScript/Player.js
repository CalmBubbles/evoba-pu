class Player extends Entity
{
    static instance = null;

    #delay = 0.2;
    #timer = 0;
    #xTime = 0;
    #yTime = 0;
    #input = Vector2.zero;

    #fallStart = null;

    get moveDelay ()
    {
        return 0.01; (this.#delay + Math.max(0.2 * (3 - this.energy), 0)) / this.speed;
    }

    hp = 10;
    maxHp = 10;
    energy = 15;
    maxEnergy = 15;
    tiles = 0;
    strength = 2;
    pos = Vector2.zero;
    lastPos = Vector2.zero;
    targetPos = Vector2.zero;
    speed = 1;
    mass = 30;

    Start ()
    {
        const playerData = World.GetPlayer(UserData.id);

        if (playerData != null)
        {
            this.tiles = playerData.tiles;
            this.hp = playerData.hp;
            this.maxHp = playerData.maxHp;
            this.energy = playerData.energy;
            this.maxEnergy = playerData.maxEnergy;
            this.TP(playerData.pos);
        }
        else this.TP(new Vector2(0, 2));

        Player.instance = this;

        this.transform.position = World.grid.CellToWorld(this.pos);
        this.#timer = this.moveDelay;
    }

    #ProcessInput ()
    {
        const dir = Vector2.Subtract(this.targetPos, this.pos).normalized;
        const targetPos = Vector2.Add(this.pos, dir);
        const nextNode = ChunkLoader.GetNodeByPos(targetPos);
        const nextGroundNode = ChunkLoader.GetNodeByPos(Vector2.Add(targetPos, Vector2.down));

        if (nextNode == null || nextGroundNode == null) return false;

        const nextTile = nextNode.GetOwnerOfType(GameTile);


        // Break
        if (nextTile != null)
        {
            const hardness = nextTile.GetCommonData().hardness;

            if (hardness < 0 || this.strength < hardness)
            {
                // Collide
                this.targetPos = this.pos.Duplicate();
                return false;
            }

            this.tiles++;
            this.energy -= 0.025;
            nextNode.RemoveTile();
        }


        // Move
        this.pos = Vector2.Add(
            this.pos,
            dir
            // Vector2.Clamp(dir, Vector2.left, Vector2.one)
        );


        // Place
        if (this.#input.Equals(Vector2.up) && this.tiles > 0)
        {
            this.tiles--;
            this.energy -= 0.025;

            nextGroundNode.SetTile(new GameTile("pu:dirt"));
        }

        return true;
    }

    FixedUpdate ()
    {   
        let hasInput = !this.#input.Equals(Vector2.zero) && !(this.#input.Equals(Vector2.up) && this.tiles === 0);

        if (hasInput)
        {
            while (!this.pos.Equals(this.targetPos))
            {
                if (!hasInput)
                {
                    this.targetPos = this.pos.Duplicate();
                    break;
                }

                const processed = this.#ProcessInput();
                if (!processed) break;

                hasInput = !(this.#input.Equals(Vector2.up) && this.tiles === 0);
            }

            if (this.pos.Equals(this.targetPos))
            {
                this.#timer = this.moveDelay;
                this.#input = Vector2.zero;
                hasInput = false;
            }
        }

        // Fall
        // if (!hasInput)
        // {
        //     let groundNode = ChunkLoader.GetNodeByPos(Vector2.Add(this.pos, Vector2.down));
        //     let falling = groundNode == null ? false : groundNode.GetOwnerOfType(GameTile) == null;

        //     if (falling)
        //     {
        //         if (this.#fallStart == null) this.#fallStart = this.pos.y;

        //         this.pos.y -= Time.fixedDeltaTime * this.mass;
        //         this.#timer += Time.fixedDeltaTime;

        //         groundNode = ChunkLoader.GetNodeByPos(Vector2.Add(this.pos, Vector2.down));
        //         falling = groundNode == null ? false : groundNode.GetOwnerOfType(GameTile) == null;
        //     }

        //     if (!falling && this.#fallStart != null) // on land
        //     {
        //         this.pos.y = Math.ceil(this.pos.y);
        //         const fallHeight = this.#fallStart - this.pos.y;
        //         this.#fallStart = null;

        //         if (fallHeight > 3) this.Hurt(Vector2.down, Math.max((fallHeight - 3) * 2, 0));
        //     }
        // }

        if (!this.lastPos.Equals(this.pos))
        {
            World.SetPlayer(this);
            this.lastPos = this.pos.Duplicate();
        }
    }

    Update ()
    {
        // Get Input
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

        if (this.#timer > 0) this.#timer -= Time.deltaTime;
        else if (this.#input.Equals(Vector2.zero) && !input.Equals(Vector2.zero))
        {
            this.#input = input;
            this.lastPos = this.pos.Duplicate();
            this.targetPos = Vector2.Add(
                this.pos,
                Vector2.Scale(
                    this.#input,
                    Math.max(Math.round(Time.fixedDeltaTime / Math.max(this.moveDelay, 1e-100)), 1)
                )
            );
        }


        // Breathe
        if (this.hp < this.maxHp)
        {
            this.hp = Math.min(this.hp + 0.0625 * Time.deltaTime, this.maxHp);
            this.energy = Math.max(this.energy - 0.078125 * Time.deltaTime, 0);
        }


        super.Update();
    }

    TP (pos)
    {
        this.pos = pos.Duplicate(); 
        this.lastPos = pos.Duplicate(); 
        this.targetPos = pos.Duplicate(); 
    }

    Hurt (dir, dmg)
    {
        this.hp -= dmg;

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