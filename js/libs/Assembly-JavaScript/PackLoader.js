class PackLoader
{
    static #loaded = false;
    static #behaviors = [];
    static #textures = [];

    static async Set ()
    {
        if (this.#loaded) return;

        const behaviorsRequest = await FetchFile("data\\behaviorPacks\\manifest.json");
        const behaviors = await behaviorsRequest.json();

        for (let i = 0; i < behaviors.length; i++)
        {
            if (behaviors[i].enabled) await this.Behavior(`data\\behaviorPacks\\${behaviors[i].path}`);
        }

        const texturesRequest = await FetchFile("data\\behaviorPacks\\manifest.json");
        const textures = await texturesRequest.json();

        for (let i = 0; i < textures.length; i++)
        {
            if (textures[i].enabled) await this.Texture(`data\\texturePacks\\${textures[i].path}`);
        }

        this.#loaded = true;
    }

    static async Behavior (src)
    {
        const manifestRequest = await FetchFile(`${src}\\manifest.json`);
        const manifestData = await manifestRequest.json();

        if (this.#behaviors.find(item => item.uuid === manifestData.uuid) != null) return;

        try
        {
            const tilesRequest = await FetchFile(`${src}\\tiles\\manifest.json`);
            const tiles = await tilesRequest.json();

            let loadCount = 0;

            manifestData.tiles = [];

            for (let i = 0; i < tiles.length; i++) (async () => {
                const tileRequest = await FetchFile(`${src}\\tiles\\${tiles[i]}.json`);
                const tileData = await tileRequest.json();

                manifestData.tiles.push(tileData.id);
                TileBank.Add(tileData, manifestData.uuid);

                loadCount++;
            })();

            await CrystalEngine.Wait(() => loadCount === tiles.length);
        }
        catch { }

        this.#behaviors.push(manifestData);
    }

    static async Texture (src)
    {
        const manifestRequest = await FetchFile(`${src}\\manifest.json`);
        const manifestData = await manifestRequest.json();

        if (this.#textures.find(item => item.uuid === manifestData.uuid) != null) return;

        try
        {
            const tilesRequest = await FetchFile(`${src}\\tiles\\manifest.json`);
            const tiles = await tilesRequest.json();

            let loadCount = 0;

            manifestData.tiles = [];

            for (let i = 0; i < tiles.length; i++) (async () => {
                const texture = new Texture(tiles[i].src, `${src}\\tiles\\`);
                await texture.Load();
                texture.pixelPerUnit = Math.max(texture.width, texture.height);

                manifestData.tiles.push(tiles[i].id);
                TileBank.AddTexture(tiles[i].id, texture, manifestData.uuid);

                loadCount++;
            })();

            await CrystalEngine.Wait(() => loadCount === tiles.length);
        }
        catch { }

        this.#textures.push(manifestData);
    }
}

PackLoader.Set();