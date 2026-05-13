class Entity extends GameBehavior
{
    #lerpSpeed = 20;

    hp = 1;
    maxHp = 1;
    strength = 1;
    speed = 1;
    pos = Vector2.zero;
    mass = 1;

    get moveDelay ()
    {
        return 0;
    }

    Start ()
    {
        this.transform.position = World.grid.CellToWorld(this.pos);
    }

    Update ()
    {
        this.transform.position = World.grid.CellToWorld(this.pos);

        // this.transform.position = Vector2.Lerp(
        //     this.transform.position,
        //     World.grid.CellToWorld(this.pos),
        //     this.#lerpSpeed * this.moveDelay * Time.deltaTime
        // );
    }
}