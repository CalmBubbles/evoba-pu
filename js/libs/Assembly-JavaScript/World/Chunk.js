class Chunk
{
    tiles = [];
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
        this.tilemap.RemoveTile(node.pos);

        node.RemoveOwnerOfType(GameTile);
        this.tiles[this.nodes.indexOf(node)] = new GameTile("pu:air");
        
        World.SetChunk(this);
    }

    SetTile (node, tile)
    {
        if (tile.id === "pu:air")
        {
            this.RemoveTile(node);

            return;
        }

        node.AddOwner(tile);
        this.tiles[this.nodes.indexOf(node)] = tile;

        this.tilemap.AddTile(new Tile(
            "tiles",
            tile.id,
            node.pos
        ));

        World.SetChunk(this);
    }
}