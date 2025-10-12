class Chunk
{
    data = [];
    nodes = [];
    pos = Vector2.zero;

    gameObject = null;
    tilemap = null;

    get bounds ()
    {
        return new Bounds(
            new Vector2(
                17 * this.pos.x,
                (10 * this.pos.y) + 4.5
            ),
            new Vector2(17, 10)
        );
    }

    NodeOn (pos)
    {
        pos = new Vector2(
            Math.ceil(pos.x),
            Math.ceil(pos.y)
        );

        return this.nodes.find(item => item.pos.Equals(pos)) ?? new ChunkNode();
    }

    RemoveTile (node)
    {
        this.tilemap.RemoveTileByPosition(node.pos);

        node.owner = null;
        this.data[this.nodes.indexOf(node)] = "pu:air";
        
        World.SetChunk(this);
    }

    SetTile (node, tileID)
    {
        if (tileID === "pu:air")
        {
            this.RemoveTile(node);

            return;
        }

        node.owner = tileID;
        this.data[this.nodes.indexOf(node)] = tileID;

        this.tilemap.AddTile(new Tile(
            tileID,
            node.pos
        ));

        World.SetChunk(this);
    }
}