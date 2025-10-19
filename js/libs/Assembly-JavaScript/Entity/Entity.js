class Entity extends GameBehavior
{
    hp = 1;
    maxHp = 1;
    strength = 1;
    speed = 1;
    pos = Vector2.zero;

    Start ()
    {
        this.transform.position = World.grid.CellToWorld(this.pos);
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