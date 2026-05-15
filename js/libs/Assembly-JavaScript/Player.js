class Player extends Entity
{
    static instance = null;

    #delay = 0.2;
    #xTime = 0;
    #yTime = 0;

    #regen = 0.0625;
    #regenCost = 0.078125;

    hp = 10;
    maxHp = 10;
    strength = 2;
    speed = 1;
    mass = 30;

    energy = 15;
    maxEnergy = 15;
    tiles = 0;

    get moveDelay ()
    {
        const rawDelay = (this.#delay + Math.max(0.2 * (3 - this.energy), 0)) / this.speed;
        return Math.max(rawDelay, 1e-100);
    }
    
    Awake ()
    {
        Player.instance = this;
    }

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

        super.Start();
    }

    FixedUpdate ()
    {
        super.FixedUpdate();

        // Regenerate
        if (this.hp < this.maxHp && this.energy > 0)
        {
            this.hp = Math.min(this.hp + this.#regen * Time.fixedDeltaTime, this.maxHp);
            this.energy -= this.#regenCost * Time.fixedDeltaTime;
        }

        if (this.energy < 0) this.energy = 0;
    }

    Update ()
    {
        super.Update();


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

        this.Move(input);
    }

    _OnChangePos ()
    {
        World.SetPlayer(this);
    }

    _OnHurt (dir, dmg)
    {
        let angle = Math.atan2(dir.y, dir.x);
        let rotation = null;

        // Right
        if (Math.InRange(-0.25 * Math.PI, 0.25 * Math.PI, angle, true))
            rotation = Math.Translate(
                0.25 * Math.PI, -1,
                -0.25 * Math.PI, 1,
                angle
            );
        // Top
        else if (Math.InRange(0.25 * Math.PI, 0.75 * Math.PI, angle, true))
            rotation = Math.Translate(
                0.75 * Math.PI, -1,
                0.25 * Math.PI, 1,
                angle
            );
        // Topleft
        else if (Math.InRange(0.75 * Math.PI, 1 * Math.PI, angle, true))
            rotation = Math.Translate(
                1 * Math.PI, 0,
                0.75 * Math.PI, 1,
                angle
            );
        else if (rotation == null && angle < 0)
        {
            angle = Math.PI + Math.atan2(-dir.y, -dir.x);

            // Bottomleft
            if (Math.InRange(Math.PI, 1.25 * Math.PI, angle, true))
                rotation = Math.Translate(
                    1.25 * Math.PI, -1,
                    Math.PI, 0,
                    angle
                );
            // Bottom
            else if (Math.InRange(1.25 * Math.PI, 1.75 * Math.PI, angle, true))
                rotation = Math.Translate(
                    1.75 * Math.PI, -1,
                    1.25 * Math.PI, 1,
                    angle
                );
        }
        
        if (rotation == null) rotation = 0;

        Cam.instance.Shake(
            Math.Clamp(0.01 * dmg, 0.3, 5),
            Vector2.Scale(
                dir,
                Math.Clamp(
                    0.01 * dmg,
                    0.5,
                    20
                )
            ),
            Math.Clamp(rotation * dmg * 0.1, -15, 15)
        );
    }

    _ProcessSetMove (dir, variables)
    {
        if (dir.Equals(Vector2.up) && this.tiles === 0)
        {
            this.targetPos = this.pos.Duplicate();
            return 1;
        }

        const nextGroundNode = ChunkLoader.GetNodeByPos(Vector2.Add(variables.get("targetPos"), Vector2.down));
        if (nextGroundNode == null) return 0;
        variables.set("nextGroundNode", nextGroundNode);
    }

    _ProcessBeforeMove (dir, variables)
    {
        const nextTile = variables.get("nextTile");

        // Break
        if (nextTile != null)
        {
            const hardness = nextTile.GetCommonData().hardness;

            if (hardness < 0 || this.strength < hardness)
            {
                // Collide
                this.targetPos = this.pos.Duplicate();
                return 1;
            }

            this.tiles++;
            this.energy -= 0.025;
            variables.get("nextNode").RemoveTile();
        }
    }

    _ProcessAfterMove (dir, variables)
    {
        // Place
        if (this._movement.Equals(Vector2.up) && this.tiles > 0)
        {
            this.tiles--;
            this.energy -= 0.025;

            variables.get("nextGroundNode").SetTile(new GameTile("pu:dirt"));
        }
    }
}