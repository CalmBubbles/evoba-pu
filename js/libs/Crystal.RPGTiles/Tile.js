class Tile
{
    spriteID = 0;
    position = Vector2.zero;

    sprite = null;

    constructor (spriteID, position)
    {
        this.spriteID = spriteID ?? 0;
        this.position = position ?? Vector2.zero;
    }

    Duplicate ()
    {
        return new Tile(this.spriteID, this.position);
    }
}