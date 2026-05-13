class TileBank
{
    static #tiles = [];

    static Add (data, packUUID)
    {
        const existingTile = this.#tiles.find(item => item.id === data.id);
        const behavior = {
            pack: packUUID,
            hardness: data.hardness,
            blast_resistance: data.blast_resistance,
        };

        if (existingTile != null)
        {
            existingTile.behavior.push(behavior);

            return;
        }

        this.#tiles.push({
            id: data.id,
            behavior: [behavior],
            texture: []
        });
    }

    static Remove (id, packUUID)
    {
        const tile = this.#tiles.find(item => item.id === id);
        if (tile == null) return;
        
        const behavior = tile.behavior.find(item => item.pack === packUUID);
        if (behavior == null) return;

        tile.behavior.splice(tile.behavior.indexOf(behavior), 1);

        if (tile.behavior.length === 0) this.#tiles.splice(this.#tiles.indexOf(tile), 1);
    }

    static GetTileInfo (id)
    {
        const tile = this.#tiles.find(item => item.id === id);

        let output = {
            id: id,
            hardness: 1,
            blast_resistance: 1,
            texture: tile.texture[tile.texture.length - 1].texture
        };

        for (let i = 0; i < tile.behavior.length; i++)
        {
            const behavior = tile.behavior[i];

            output.hardness = behavior.hardness ?? output.hardness;
            output.blast_resistance = behavior.blast_resistance ?? output.blast_resistance;
        }

        return output;
    }

    static AddTexture (id, texture, packUUID)
    {
        const tile = this.#tiles.find(item => item.id === id);

        if (tile != null) tile.texture.push({
            pack: packUUID,
            texture: texture
        });
    }

    static RemoveTexture (id, packUUID)
    {
        const tile = this.#tiles.find(item => item.id === id);
        if (tile == null) return;
        
        const texture = tile.texture.find(item => item.pack === packUUID);
        if (texture != null) tile.texture.splice(tile.texture.indexOf(texture), 1);
    }

    static LoadTextures ()
    {
        const palette = new TilePalette();
        palette.name = "tiles";

        for (let i = 0; i < this.#tiles.length; i++)
        {
            const sprite = this.#tiles[i].texture[this.#tiles[i].texture.length - 1].texture.sprites[0];
            palette.sprites.set(this.#tiles[i].id, sprite);
        }

        TilePalette.LoadLocalTemp(palette);
    }
}