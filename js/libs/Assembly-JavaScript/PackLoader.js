class PackLoader
{
    static #loaded = false;
    static #behaviors = [];
    static #textures = [];

    static async Set ()
    {
        if (this.#loaded) return;

        const behaviorsRequest = await FetchFile("data\\behavior_packs\\manifest.json");
        const behaviors = await behaviorsRequest.json();

        for (let i = 0; i < behaviors.length; i++)
        {
            if (behaviors[i].enabled) await this.Behavior(`data\\behavior_packs\\${behaviors[i].path}`);
        }

        const texturesRequest = await FetchFile("data\\behavior_packs\\manifest.json");
        const textures = await texturesRequest.json();

        for (let i = 0; i < textures.length; i++)
        {
            if (textures[i].enabled) await this.Resource(`data\\resource_packs\\${textures[i].path}`);
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

            for (let i = 0; i < tiles.length; i++) (async () => {
                const tileRequest = await FetchFile(`${src}\\tiles\\${tiles[i]}.json`);
                const tileData = await tileRequest.json();

                TileBank.Add(tileData, manifestData.uuid);

                loadCount++;
            })();

            await CrystalEngine.Wait(() => loadCount === tiles.length);
        }
        catch { }

        try
        {
            const entitiesRequest = await FetchFile(`${src}\\entities\\manifest.json`);
            const entities = await entitiesRequest.json();

            let loadCount = 0;

            for (let i = 0; i < entities.length; i++) (async () => {
                const entityRequest = await FetchFile(`${src}\\entities\\${entities[i]}.json`);
                const entity = await entityRequest.json();

                EntityBank.Add(entity, manifestData.uuid);

                loadCount++;
            })();

            await CrystalEngine.Wait(() => loadCount === entities.length);
        }
        catch { }

        try
        {
            const terrainRequest = await FetchFile(`${src}\\scripts\\terrain\\manifest.json`);
            const terrain = await terrainRequest.json();

            let loadCount = 0;

            for (let i = 0; i < terrain.length; i++) (async () => {
                const terrainPassRequest = await FetchFile(`${src}\\scripts\\terrain\\${terrain[i]}.js`);
                const terrainPass = await terrainPassRequest.text();

                TerrainBuilder.AddPass(terrainPass, manifestData.uuid);

                loadCount++;
            })();

            await CrystalEngine.Wait(() => loadCount === terrain.length);
        }
        catch { }

        this.#behaviors.push(manifestData);
    }

    static async Resource (src)
    {
        const manifestRequest = await FetchFile(`${src}\\manifest.json`);
        const manifestData = await manifestRequest.json();

        if (this.#textures.find(item => item.uuid === manifestData.uuid) != null) return;

        try
        {
            const tilesRequest = await FetchFile(`${src}\\tiles\\manifest.json`);
            const tiles = await tilesRequest.json();

            let loadCount = 0;

            for (let i = 0; i < tiles.length; i++) (async () => {
                const texture = new Texture(tiles[i].src, `${src}\\tiles\\`);
                await texture.Load();
                texture.pixelPerUnit = Math.max(texture.width, texture.height);

                TileBank.AddTexture(tiles[i].id, texture, manifestData.uuid);

                loadCount++;
            })();

            await CrystalEngine.Wait(() => loadCount === tiles.length);
        }
        catch { }

        try
        {
            const entitiesRequest = await FetchFile(`${src}\\entities\\manifest.json`);
            const entities = await entitiesRequest.json();

            let loadCount = 0;

            for (let i = 0; i < entities.length; i++) (async () => {
                const entityRequest = await fetch(`${src}\\entities\\${entities[i]}.json`);
                const entityData = await entityRequest.json();

                const texture = new Texture(entityData.src, `${src}\\entities\\textures\\`);
                await texture.Load();
                texture.pixelPerUnit = entityData.pixelPerUnit ?? 10;

                let sprites = [];

                for (let i = 0; i < entityData.sprites.length; i++)
                {
                    const sprLibCategory = new SpriteLibraryCategory();
                    sprLibCategory.name = entityData.sprites[i].dir;
                    
                    for (let j = 0; j < entityData.sprites[i].entries.length; j++)
                    {
                        const spriteData = entityData.sprites[i].entries[j];
                        const sprite = new Sprite(spriteData.name, texture);

                        if (spriteData.pivot != null) sprite.pivot = new Vector2(
                            spriteData.pivot.x,
                            spriteData.pivot.y
                        );
                        if (spriteData.rect != null) sprite.rect = new Rect(
                            spriteData.rect.x,
                            spriteData.rect.y,
                            spriteData.rect.width,
                            spriteData.rect.height
                        );
                        if (spriteData.border != null) sprite.border = new Rect(
                            spriteData.rect.x,
                            spriteData.rect.y,
                            spriteData.rect.z,
                            spriteData.rect.w
                        );

                        sprLibCategory.entries.push(sprite);
                    }

                    sprites.push(sprLibCategory);
                }

                EntityBank.AddSprites(entityData.id, sprites, manifestData.uuid);

                loadCount++;
            })();

            await CrystalEngine.Wait(() => loadCount === tiles.length);
        }
        catch { }

        this.#textures.push(manifestData);
    }
}