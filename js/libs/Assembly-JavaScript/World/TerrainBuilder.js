class TerrainBuilder
{
    static #passes = [];

    static #Pass (pos)
    {
        if (pos.y === -1) return new GameTile("pu:sys:invisible_bedrock");
        if (pos.y < -1) return new GameTile("pu:air");

        let output = null;

        for (let i = 0; i < this.#passes.length; i++)
        {
            const evalCall = new Function("pos", "input", this.#passes[i].callback);
            
            output = evalCall(pos, output);
        }

        return output ?? new GameTile("pu:air");
    }

    static AddPass (callback, packUUID)
    {
        this.#passes.push({
            pack: packUUID,
            callback: callback
        });
    }

    static RemovePasses (packUUID)
    {
        this.#passes = this.#passes.filter(item => item.pack !== packUUID);
    }

    static Generate (pos)
    {
        const chunk = new Chunk();
        chunk.pos = pos;

        let x = -8 + pos.x * 17;
        let y = 9 + pos.y * 10;
        
        for (let i = 0; i < 170; i++)
        {
            chunk.tiles[i] = this.#Pass(new Vector2(x, y));

            if ((1 + i) % 17 === 0)
            {
                x = -9 + chunk.pos.x * 17;
                y--;
            }

            x++;
        }

        return chunk;
    }
}