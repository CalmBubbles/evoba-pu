class World extends GameBehavior
{
    static #autosaveTimeInterval = 300;
    static #autosaveTime = 0;
    static #chunks = new Map();
    static #updatedChunks = [];
    static #players = new Map();
    static #updatedPlayers = [];

    static #db = null;
    static #manifestData = null;

    static grid = null;

    static get saved ()
    {
        return this.#updatedChunks.length === 0 && this.#updatedPlayers.length === 0;
    }
    
    static get seed ()
    {
        return this.#manifestData.seed;
    }

    static async Load ()
    {
        window.indexedDB.deleteDatabase("world_0");

        const dbRequest = window.indexedDB.open("world_0");
        dbRequest.onupgradeneeded = () => {
            dbRequest.result.createObjectStore("manifest").put({
                name: "Test World",
                seed: 0
            }, 0);
            dbRequest.result.createObjectStore("map");
            dbRequest.result.createObjectStore("players");
        };

        await new Promise(resolve => dbRequest.onsuccess = () => {
            this.#db = dbRequest.result;

            resolve();
        });

        const dbTransaction = this.#db.transaction([
            "manifest",
            "map",
            "players"
        ], "readwrite");

        const manifestRequest = dbTransaction.objectStore("manifest").get(0);
        await new Promise(resolve => manifestRequest.onsuccess = resolve);
        this.#manifestData = manifestRequest.result;

        noise.seed(this.seed);

        const mapRequest = dbTransaction.objectStore("map").getAll();
        await new Promise(resolve => mapRequest.onsuccess = resolve);
        this.#chunks = new Map(mapRequest.result.map(item => [`${item.pos.x}_${item.pos.y}`, item]));

        const playersRequest = dbTransaction.objectStore("players").getAll();
        await new Promise(resolve => playersRequest.onsuccess = resolve);
        this.#players = new Map(playersRequest.result.map(item => [item.id, item]));
    }
    
    static GetChunk (x, y)
    {
        return this.#chunks.get(`${x}_${y}`);
    }

    static SetChunk (chunk)
    {
        const key = `${chunk.pos.x}_${chunk.pos.y}`;

        this.#chunks.set(key, {
            pos: {
                x: chunk.pos.x,
                y: chunk.pos.y
            },
            tiles: [...chunk.tiles]
        });
        
        if (!this.#updatedChunks.includes(key)) this.#updatedChunks.push(key);
    }

    static GetPlayer (id)
    {
        return this.#players.get(id);
    }

    static SetPlayer (player)
    {
        this.#players.set(UserData.id, {
            id: UserData.id,
            pos: {
                x: player.pos.x,
                y: player.pos.y
            },
            tiles: player.tiles,
            hp: player.hp,
            maxHp: player.maxHp,
            energy: player.energy,
            maxEnergy: player.maxEnergy
        });
        
        if (!this.#updatedPlayers.includes(UserData.id)) this.#updatedPlayers.push(UserData.id);
    }

    static async Save ()
    {
        if (this.saved) return;

        const dbTransaction = this.#db.transaction([
            "map",
            "players"
        ], "readwrite");
        const mapStore = dbTransaction.objectStore("map");
        const playersStore = dbTransaction.objectStore("players");

        let counter = 0;
        
        for (let i = 0; i < this.#updatedChunks.length; i++) (async () => {
            const chunk = this.#chunks.get(this.#updatedChunks[i]);

            const putRequest = mapStore.put(chunk, this.#updatedChunks[i]);
            await new Promise(resolve => putRequest.onsuccess = resolve);

            counter++
        })();

        for (let i = 0; i < this.#updatedPlayers.length; i++) (async () => {
            const player = this.#players.get(this.#updatedPlayers[i]);

            const putRequest = playersStore.put(player, this.#updatedPlayers[i]);
            await new Promise(resolve => putRequest.onsuccess = resolve);

            counter++
        })();

        await CrystalEngine.Wait(() => counter === this.#updatedChunks.length + this.#updatedPlayers.length);

        this.#updatedChunks = [];
        this.#updatedPlayers = [];
        this.#autosaveTime = 0;
    }

    static UpdateAutosave ()
    {
        if (this.#updatedChunks.length === 0 && this.#updatedPlayers === 0) return;

        this.#autosaveTime += Time.unscaledDeltaTime;

        if (this.#autosaveTime > this.#autosaveTimeInterval) this.Save();
    }

    #centerChunk = null;

    Start ()
    {
        Crispixels.effect = true;
        // FPSMeter.enabled = true;
        FPSMeter.detailed = true;
        
        World.grid = this.GetComponent(Grid);
        TileBank.LoadTextures();

        ChunkLoader.Set();
    }

    #GetChunkData (pos)
    {
        const chunkData = World.GetChunk(pos.x, pos.y);

        if (chunkData == null) return TerrainBuilder.Generate(pos);

        const chunk = new Chunk();
        chunk.pos.Set(chunkData.pos.x, chunkData.pos.y);
        chunk.tiles = [...chunkData.tiles];

        return chunk;
    }

    #UnloadChunk (pos)
    {
        const chunk = ChunkLoader.GetByPos(pos);
        if (chunk != null) ChunkLoader.Unload(chunk);
    }

    #UpdateChunks ()
    {
        const camPos = Vector2.Add(Cam.instance.transform.position, new Vector2(0, 4));
        const chunkPos = ChunkLoader.WorldToChunkPos(camPos);
        
        if (this.#centerChunk == null || !this.#centerChunk.bounds.Contains(camPos))
        {
            if (this.#centerChunk != null)
            {
                const prevChunkPos = this.#centerChunk.pos;
                const chunkBounds = new Bounds(chunkPos, new Vector2(2, 2));

                const unload = dir => {
                    const pos = Vector2.Add(prevChunkPos, dir);
                    if (!chunkBounds.Contains(pos)) this.#UnloadChunk(pos);
                };

                // #region Unloads lmao

                // #--
                // ---
                // ---
                unload(new Vector2(-1, 1));

                // -#-
                // ---
                // ---
                unload(Vector2.up);

                // --#
                // ---
                // ---
                unload(new Vector2(1, 1));

                // ---
                // #--
                // ---
                unload(Vector2.left);

                // ---
                // -#-
                // ---
                unload(Vector2.zero);

                // ---
                // --#
                // ---
                unload(Vector2.right);

                // ---
                // ---
                // #--
                unload(new Vector2(-1, -1));

                // ---
                // ---
                // -#-
                unload(Vector2.down);

                // ---
                // ---
                // --#
                unload(new Vector2(1, -1));

                //#endregion
            }

            const existing = ChunkLoader.GetByPos(chunkPos);

            if (existing) this.#centerChunk = existing;
            else
            {
                this.#centerChunk = this.#GetChunkData(chunkPos);
                ChunkLoader.Load(this.#centerChunk);
            }

            ChunkLoader.Load(this.#GetChunkData(Vector2.Add(chunkPos, Vector2.up)));
            ChunkLoader.Load(this.#GetChunkData(Vector2.Add(chunkPos, Vector2.left)));
            ChunkLoader.Load(this.#GetChunkData(Vector2.Add(chunkPos, Vector2.right)));
            ChunkLoader.Load(this.#GetChunkData(Vector2.Add(chunkPos, Vector2.down)));

            ChunkLoader.Load(this.#GetChunkData(Vector2.Add(chunkPos, new Vector2(-1, 1))));
            ChunkLoader.Load(this.#GetChunkData(Vector2.Add(chunkPos, new Vector2(1, 1))));
            ChunkLoader.Load(this.#GetChunkData(Vector2.Add(chunkPos, new Vector2(-1, -1))));
            ChunkLoader.Load(this.#GetChunkData(Vector2.Add(chunkPos, new Vector2(1, -1))));
        }
    }

    LateUpdate ()
    {
        this.#UpdateChunks();

        World.UpdateAutosave();

        FPSMeter.Update();
    }

    async OnApplicationQuit ()
    {
        if (World.saved) return;

        Application.CancelQuit();

        await World.Save();

        Application.Quit();
    }

    OnApplicationFocus (state)
    {
        if (!state && !World.saved) World.Save();
    }
}