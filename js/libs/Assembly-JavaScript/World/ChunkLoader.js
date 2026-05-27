class ChunkLoader
{
    static #loaded = false;
    static #loading = 0;
    static #chunkPool = [];
    static #chunks = new Map();
    static #loadingChunks = new Set();

    static parallelTasks = 2;

    static get isLoaded ()
    {
        return this.#loaded;
    }

    static get runningTasks ()
    {
        return this.#loading;
    }

    static async Set ()
    {
        for (let i = 0; i < 9; i++) await this.#PreloadChunk();

        this.#loaded = true;
    }

    static async #PreloadChunk ()
    {
        const gameObj = await this.Instantiate(
            Resources.FindPrefab("chunk"),
            World.grid.transform,
            null, null, true
        );
        const data = {
            gameObject: gameObj,
            tilemap: gameObj.GetComponent(Tilemap),
            chunk: null
        };
        this.#chunkPool.push(data);
    }

    static async Load (chunk)
    {
        const chunkID = `${chunk.pos.x}_${chunk.pos.y}`;

        if (this.#chunks.has(chunkID) || this.#loadingChunks.has(chunkID)) return;

        this.#loadingChunks.add(chunkID);

        await CrystalEngine.Wait(() => this.#loaded && this.#loading < this.parallelTasks && this.#chunkPool.length > 0);

        this.#loading++;

        const data = this.#chunkPool.shift();
        data.chunk = chunk;
        chunk.gameObject = data.gameObject;
        chunk.tilemap = data.tilemap;

        let x = -8 + chunk.pos.x * 17;
        let y = 9 + chunk.pos.y * 10;
        
        for (let i = 0; i < chunk.tiles.length; i++)
        {
            if (chunk.tiles[i].id !== "pu:air") chunk.tilemap.AddTile(new Tile(
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

        this.#loading--;
        
        this.#loadingChunks.delete(chunkID);
        this.#chunks.set(chunkID, data);
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
        if (!this.#loaded) return;

        return this.#chunks.get(`${pos.x}_${pos.y}`)?.chunk;
    }

    static GetNodeByPos (pos)
    {
        return this.GetByPos(this.WorldToChunkPos(pos))?.NodeOn(pos);
    }

    static Unload (chunk)
    {
        if (!this.#loaded) return;

        chunk.nodes = [];
        chunk.gameObj = null;
        chunk.tilemap = null;

        const data = this.#chunks.get(`${chunk.pos.x}_${chunk.pos.y}`);
        data.chunk = null;
        data.tilemap.RemoveAllTiles();

        this.#chunks.delete(`${chunk.pos.x}_${chunk.pos.y}`);
        this.#chunkPool.push(data);
    }
}