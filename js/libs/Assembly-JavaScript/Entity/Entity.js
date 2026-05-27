class Entity extends GameBehavior
{
    #falling = false;
    #moveTime = 0;
    #hurtDuration = 0.2;
    #hurtTime = 0;
    #lastDmg = 0;
    #lastMoveDelay = 0;

    _fallHeight = 0;
    _movement = Vector2.zero;

    _sprRenderer = null;
    _fallStart = null;
    
    lerpSpeed = 5;

    hp = 1;
    maxHp = 1;
    strength = 1;
    speed = 1;
    mass = 1;

    pos = Vector2.zero;
    lastPos = Vector2.zero;
    targetPos = Vector2.zero;

    get moveDelay ()
    {
        return 0;
    }

    get currentMoveDelay ()
    {
        return this.#lastMoveDelay;
    }

    get isFalling ()
    {
        return this.#falling;
    }

    get isDead ()
    {
        return this.hp <= 0;
    }

    Start ()
    {
        this._sprRenderer = this.GetComponent(SpriteRenderer);
        this.transform.position = World.grid.CellToWorld(this.pos);
    }
    
    FixedUpdate ()
    {
        let hasMovement = !this._movement.Equals(Vector2.zero);

        if (hasMovement)
        {
            let brokeProcessing = false;

            while (!this.pos.Equals(this.targetPos))
            {
                const processed = this._ProcessMovement();
                
                if (!processed)
                {
                    brokeProcessing = true;
                    break;
                }
            }

            if (this._movement.Equals(Vector2.down) && this.targetPos.y - this.lastPos.y === 1) this.pos.y = this.lastPos.y;

            if (!brokeProcessing)
            {
                this._movement = Vector2.zero;
                hasMovement = false;
            }
        }

        // Fall
        if (Math.abs(this.transform.position.x - World.grid.CellToWorld(this.pos).x) <= 0.2 && !hasMovement) this._Fall();

        if (!this.lastPos.Equals(this.pos))
        {
            this._OnChangePos();
            this.lastPos = this.pos.Duplicate();
        }
    }

    Update ()
    {
        if (this.#moveTime > 0) this.#moveTime -= Time.deltaTime;

        const targetPos = World.grid.CellToWorld(this.pos);

        let pos = Vector2.Lerp(
            this.transform.position,
            targetPos,
            this.lerpSpeed * Time.deltaTime / this.#lastMoveDelay
        );

        if (this.#falling) pos.y = targetPos.y;

        this.transform.position = pos;

        if (this.#hurtTime > 0)
        {
            this.#hurtTime -= Time.deltaTime;
            if (this.#hurtTime <= 0) this.#hurtTime = 0;

            this._sprRenderer.color = Color.Lerp(
                new Color(1, 0, 0, 1),
                Color.white,
                (this.#hurtDuration - this.#hurtTime) / this.#hurtDuration
            );

            this._OnUpdateHurt(this.#hurtDuration, this.#hurtTime, this.#lastDmg);

            if (this.#hurtTime <= 0) this.#lastDmg = 0;
        }
    }

    _ProcessMovement ()
    {
        const dir = Vector2.Subtract(this.targetPos, this.pos).normalized;
        const variables = new Map();

        variables.set("targetPos", Vector2.Add(this.pos, dir));
        variables.set("nextNode", ChunkLoader.GetNodeByPos(variables.get("targetPos")));

        const processedSetMove = this._ProcessSetMove(dir, variables);
        if (processedSetMove != null) return processedSetMove === 1;

        if (variables.get("nextNode") == null) return false;

        variables.set("nextTile", variables.get("nextNode").GetOwnerOfType(GameTile));

        const processedBeforeMove = this._ProcessBeforeMove(dir, variables);
        if (processedBeforeMove != null) return processedBeforeMove === 1;

        // Move
        this.pos = Vector2.Add(this.pos, dir);

        const processedAfterMove = this._ProcessAfterMove(dir, variables);
        if (processedAfterMove != null) return processedAfterMove === 1;

        this.ResetMoveTime();
        return true;
    }

    _ProcessSetMove (dir, variables) { return true; }

    _ProcessBeforeMove (dir, variables) { return true; }

    _ProcessAfterMove (dir, variables) { return true; }

    _Fall ()
    {
        let groundNode = null;
        
        if (this._fallStart != null) groundNode = ChunkLoader.GetNodeByPos(Vector2.Add(
            new Vector2(
                this.pos.x,
                this._fallStart - Math.floor(this._fallHeight)
            ),
            Vector2.down
        ));
        else groundNode = ChunkLoader.GetNodeByPos(Vector2.Add(this.pos, Vector2.down));

        if (groundNode == null)
        {
            this.#falling = true;
            return;
        }

        this.#falling = groundNode.GetOwnerOfType(GameTile) == null;
        const movement = Time.fixedDeltaTime * this.mass;

        
        // Fall
        if (this.#falling)
        {
            if (this._fallStart == null) this._fallStart = this.pos.y;

            const iterations = Math.ceil(movement);
            const scaledMovement = movement / iterations;

            for (let i = 0; i < iterations; i++)
            {
                this.pos.y -= scaledMovement;
                this._fallHeight += scaledMovement;

                groundNode = ChunkLoader.GetNodeByPos(Vector2.Add(
                    new Vector2(
                        this.pos.x,
                        this._fallStart - Math.floor(this._fallHeight)
                    ),
                    Vector2.down
                ));
                if (groundNode == null) return;

                this.#falling = groundNode.GetOwnerOfType(GameTile) == null;
                if (!this.#falling) break;
            }
        }
        
        if (!this.#falling && this._fallStart != null) // Land
        {
            const realPos = this._fallStart - Math.floor(this._fallHeight);
            
            if (this.pos.y > realPos)
            {
                this.pos.y -= movement;
                return;
            }

            this.pos.y = realPos;
            this.transform.position = new Vector2(this.transform.position.x, World.grid.CellToWorld(this.pos).y);

            if (this._fallHeight >= 4) this.Hurt(
                new Vector2(Math.RandomRanged(-0.25, 0.25), -1),
                Math.max((this._fallHeight - 3) * 2, 0)
            );

            this.ResetMoveTime();
            this._fallStart = null;
            this._fallHeight = 0;
        }
    }

    _OnChangePos () { }

    _OnHurt (dir, dmg) { }

    _OnUpdateHurt (duration, time, dmg) { }

    _OnDie () { }

    TP (pos)
    {
        this.#lastMoveDelay = this.moveDelay;

        this.pos = pos.Duplicate();
        this.targetPos = pos.Duplicate();

        this.transform.position = World.grid.CellToWorld(this.pos);
    }

    Hurt (dir, dmg)
    {
        if (this.isDead || (this.#hurtTime > 0 && dmg <= this.#lastDmg)) return;
        
        this.#hurtTime = this.#hurtDuration;

        dir = dir.normalized;

        const lastDmg = this.#lastDmg;
        this.#lastDmg = dmg;
        dmg = dmg - lastDmg;

        this.hp -= dmg;
        this._OnHurt(dir, this.#lastDmg);

        if (this.hp <= 0)
        {
            if (this !== Player.instance) GameObject.Destroy(this);
            this._OnDie();
        }
    }

    InducePain (dmg = Math.RandomRanged(this.maxHp))
    {
        this.Hurt(
            new Vector2(
                Math.RandomRanged(-1, 1),
                Math.RandomRanged(-1, 1)
            ),
            dmg
        )
    }

    Move (dir)
    {
        if (this.#falling || this.#moveTime > 0 || !this._movement.Equals(Vector2.zero) || dir.Equals(Vector2.zero)) return;

        this.transform.position = World.grid.CellToWorld(this.pos);

        this.#lastMoveDelay = this.moveDelay;
        this._movement = dir.Duplicate();
        this.lastPos = this.pos.Duplicate();
        this.targetPos = Vector2.Add(
            this.pos,
            Vector2.Scale(
                this._movement,
                Math.max(Math.round(Time.fixedDeltaTime / this.#lastMoveDelay), 1)
            )
        );
    }

    ResetMoveTime ()
    {
        this.#moveTime = this.#lastMoveDelay;
    }
}