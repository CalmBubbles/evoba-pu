class ChunkNode
{
    x = 0;
    y = 0;

    chunk = null;
    owner = null;

    get pos ()
    {
        return new Vector2(this.x, this.y);
    }

    RemoveTile ()
    {
        this.chunk.RemoveTile(this);
    }

    SetTile (tileID)
    {
        this.chunk.SetTile(this, tileID);
    }
}