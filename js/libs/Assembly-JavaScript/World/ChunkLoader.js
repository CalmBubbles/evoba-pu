class ChunkLoader
{
    static #chunks = new Map();

    static async Load (chunk)
    {
        const gameObj = await this.Instantiate(
            Resources.FindPrefab("chunk"),
            World.grid.transform,
            null, null, true
        );
        gameObj.name = `chunk_${chunk.pos.x}_${chunk.pos.y}`
        chunk.gameObject = gameObj;

        const tilemap = gameObj.GetComponent(Tilemap);
        chunk.tilemap = tilemap;

        let x = -8 + chunk.pos.x * 17;
        let y = 9 + chunk.pos.y * 10;
        
        for (let i = 0; i < chunk.tiles.length; i++)
        {
            if (chunk.tiles[i].id !== "pu:air") tilemap.AddTile(new Tile(
                "tiles",
                chunk.tiles[i].id,
                new Vector2(x, y)
            ));

            const newNode = new ChunkNode();
            newNode.x = x;
            newNode.y = y;
            newNode.chunk = chunk;
            
            if (chunk.tiles[i].id !== "pu:air") newNode.AddOwner(chunk.tiles[i]);

            chunk.nodes.push(newNode);

            if ((1 + i) % 17 === 0)
            {
                x = -8 + chunk.pos.x * 17;
                y--;

                continue;
            }

            x++;
        }
        
        this.#chunks.set(`${chunk.pos.x}_${chunk.pos.y}`, chunk);
    }

    static WorldToChunkPos (pos)
    {
        return new Vector2(
            Math.floor(Math.round(pos.x + 8) / 17),
            Math.floor(Math.round(pos.y) / 10)
        );
    }

    static GetByPos (pos)
    {
        return this.#chunks.get(`${pos.x}_${pos.y}`);
    }

    static GetNodeByPos (pos)
    {
        return this.GetByPos(this.WorldToChunkPos(pos))?.NodeOn(pos);
    }

    static Unload (chunk)
    {
        chunk.nodes = [];

        GameObject.Destroy(chunk.gameObject);
        chunk.gameObj = null;

        this.#chunks.delete(`${chunk.pos.x}_${chunk.pos.y}`);
    }
}