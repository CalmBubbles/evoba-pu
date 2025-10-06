class TerrainBuilder
{
    static #passes = [];

    static #Pass (pos)
    {
        let output = null;

        for (let i = 0; i < this.#passes.length; i++)
        {
            const evalCall = new Function("pos", "input", this.#passes[i].callback);
            
            output = evalCall(pos, output);
        }

        return output ?? "pu:air";
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

    static Generate ()
    {
        const chunk = new Chunk();

        let x = -8;
        let y = 9;
        
        for (let i = 0; i < chunk.data.length; i++)
        {
            chunk.data[i] = this.#Pass(new Vector2(x, y));

            if ((1 + i) % 17 === 0)
            {
                x = -9;
                y--;
            }

            x++;
        }

        ChunkLoader.Load(chunk);
    }
}