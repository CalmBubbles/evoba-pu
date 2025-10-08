class World extends GameBehavior
{
    static loadedChunk = false;
    static seed = 0;

    static grid = null;

    #centerChunk = null;

    Start ()
    {
        Crispixels.effect = true;
        FPSMeter.enabled = true;
        FPSMeter.detailed = true;
        
        World.grid = this.GetComponent("Grid");

        noise.seed(0);
    }

    #LoadChunk (pos)
    {
        if (ChunkLoader.GetByPos(pos) == null) TerrainBuilder.Generate(pos);
    }

    #UnloadChunk (pos)
    {
        const chunk = ChunkLoader.GetByPos(pos);

        if (chunk != null) ChunkLoader.Unload(chunk);
    }

    LateUpdate ()
    {
        const camPos = Vector2.Add(Cam.instance.transform.position, new Vector2(0, 4));
        const chunkPos = ChunkLoader.WorldToChunkPos(camPos);
        
        if (this.#centerChunk == null || !this.#centerChunk.bounds.Contains(camPos))
        {
            World.loadedChunk = false;

            const existing = ChunkLoader.GetByPos(chunkPos);

            if (this.#centerChunk != null)
            {
                const prevChunkPos = this.#centerChunk.pos;

                if (prevChunkPos.y > chunkPos.y)
                {
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, Vector2.up));
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, new Vector2(1, 1)));
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, new Vector2(-1, 1)));
                }
                else if (prevChunkPos.y < chunkPos.y)
                {
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, Vector2.down));
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, new Vector2(-1, -1)));
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, new Vector2(1, -1)));
                }
                
                if (prevChunkPos.x < chunkPos.x)
                {
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, Vector2.left));
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, new Vector2(-1, 1)));
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, new Vector2(-1, -1)));
                }
                else if (prevChunkPos.x > chunkPos.x)
                {
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, Vector2.right));
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, new Vector2(1, 1)));
                    this.#UnloadChunk(Vector2.Add(prevChunkPos, new Vector2(1, -1)));
                }
            }

            World.loadedChunk = true;

            this.#centerChunk = existing ?? TerrainBuilder.Generate(chunkPos);

            this.#LoadChunk(Vector2.Add(chunkPos, Vector2.up));
            this.#LoadChunk(Vector2.Add(chunkPos, Vector2.left));
            this.#LoadChunk(Vector2.Add(chunkPos, Vector2.right));
            this.#LoadChunk(Vector2.Add(chunkPos, new Vector2(-1, 1)));
            this.#LoadChunk(Vector2.Add(chunkPos, new Vector2(1, 1)));

            if (chunkPos.y > 0)
            {
                this.#LoadChunk(Vector2.Add(chunkPos, Vector2.down));
                this.#LoadChunk(Vector2.Add(chunkPos, new Vector2(-1, -1)));
                this.#LoadChunk(Vector2.Add(chunkPos, new Vector2(1, -1)));
            }
        }

        FPSMeter.Update();
    }
}