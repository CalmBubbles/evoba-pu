class ChunkLoader
{
    static #chunks = new Map();

    static Load (chunk)
    {
        let objID = 0;

        while (GameObject.FindByID(objID) != null) objID++;

        const tilemap = new Tilemap();
        tilemap.grid = World.grid;

        let x = -8 + chunk.pos.x * 17;
        let y = 9 + chunk.pos.y * 10;
        
        for (let i = 0; i < chunk.data.length; i++)
        {
            if (chunk.data[i] !== "pu:air") tilemap.AddTile(new Tile(
                chunk.data[i],
                new Vector2(x, y)
            ));

            const newNode = new ChunkNode();
            newNode.x = x;
            newNode.y = y;
            newNode.chunk = chunk;
            
            if (chunk.data[i] !== "pu:air") newNode.owner = TileBank.GetTileInfo(chunk.data[i]);

            chunk.nodes.push(newNode);

            if ((1 + i) % 17 === 0)
            {
                x = -8 + chunk.pos.x * 17;
                y--;

                continue;
            }

            x++;
        }

        const transform = new Transform();

        const gameObj = new GameObject(
            `chunk_${chunk.pos.x}_${chunk.pos.y}`,
            [tilemap],
            true,
            transform,
            objID
        );
        
        chunk.tilemap = tilemap;
        chunk.gameObject = gameObj;
        this.#chunks.set(`${chunk.pos.x}_${chunk.pos.y}`, chunk);

        const scene = SceneManager.GetActiveScene();
        gameObj.scene = scene;

        Object.InstantiationQueue.Add(() => {
            const min = tilemap.bounds.min;
            const max = tilemap.bounds.max;
            const rect = Rect.MinMaxRect(min.x, min.y, max.x, max.y);
        
            scene.tree.Insert(gameObj, rect);

            scene.gameObjects.push(gameObj);

            World.grid.transform.AttachChild(transform);
        });
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