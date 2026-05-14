class Entity extends GameBehavior
{
    #falling = false;
    #moveTime = 0;

    _movement = Vector2.zero;
    _fallStart = null;
    
    lerpSpeed = 5;

    hp = 1;
    maxHp = 1;
    strength = 1;
    speed = 1;
    mass = 1;

    pos = Vector2.zero;

    get moveDelay ()
    {
        return 0;
    }

    get isFalling ()
    {
        return this.#falling;
    }

    Start ()
    {
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
                this.ResetMoveTime();
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
            this.lerpSpeed * Time.deltaTime / this.moveDelay
        );

        if (this.#falling) pos.y = targetPos.y;

        this.transform.position = pos;
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

        return true;
    }

    _ProcessSetMove (dir, variables) { return true; }

    _ProcessBeforeMove (dir, variables) { return true; }

    _ProcessAfterMove (dir, variables) { return true; }

    _Fall ()
    {
        let groundNode = ChunkLoader.GetNodeByPos(Vector2.Add(this.pos, Vector2.down));
        if (groundNode == null)
        {
            this.#falling = true;
            return;
        }
        this.#falling = groundNode.GetOwnerOfType(GameTile) == null;

        if (this.#falling)
        {
            if (this._fallStart == null) this._fallStart = this.pos.y;

            this.pos.y -= Time.fixedDeltaTime * this.mass;

            groundNode = ChunkLoader.GetNodeByPos(Vector2.Add(this.pos, Vector2.down));
            if (groundNode == null) return;
            this.#falling = groundNode.GetOwnerOfType(GameTile) == null;
        }

        if (!this.#falling && this._fallStart != null) // on land
        {
            this.pos.y = Math.ceil(this.pos.y);
            this.transform.position = new Vector2(this.transform.position.x, World.grid.CellToWorld(this.pos).y);
            const fallHeight = this._fallStart - this.pos.y;
            this._fallStart = null;

            if (fallHeight > 3) this.Hurt(Vector2.down, Math.max((fallHeight - 3) * 2, 0));
        }
    }

    _OnChangePos () { }

    _OnHurt (dir, dmg) { }

    TP (pos)
    {
        this.pos = pos.Duplicate();
        this.targetPos = pos.Duplicate(); 

        this.transform.position = World.grid.CellToWorld(this.pos);
    }

    Hurt (dir, dmg)
    {
        dir = dir.normalized;

        this.hp -= dmg;
        this._OnHurt(dir, dmg);
    }

    Move (dir)
    {
        if (this.#falling || this.#moveTime > 0 || !this._movement.Equals(Vector2.zero) || dir.Equals(Vector2.zero)) return;

        this.transform.position = World.grid.CellToWorld(this.pos);

        this._movement = dir.Duplicate();
        this.lastPos = this.pos.Duplicate();
        this.targetPos = Vector2.Add(
            this.pos,
            Vector2.Scale(
                this._movement,
                Math.max(Math.round(Time.fixedDeltaTime / this.moveDelay), 1)
            )
        );
    }

    ResetMoveTime ()
    {
        this.#moveTime = this.moveDelay;
    }
}