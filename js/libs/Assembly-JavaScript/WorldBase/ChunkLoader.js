class ChunkLoader
{
    static Load (chunk)
    {
        let objID = 0;

        while (GameObject.FindByID(objID) != null) objID++;

        const tilemap = new Tilemap();

        let x = -8 + chunk.pos.x * 17;
        let y = 9 + chunk.pos.y * 10;
        
        for (let i = 0; i < chunk.data.length; i++)
        {
            if (chunk.data[i] !== "pu:air") tilemap.AddTile(new Tile(
                chunk.data[i],
                new Vector2(x, y)
            ));

            if ((1 + i) % 17 === 0)
            {
                x = -9 + chunk.pos.x * 17;
                y--;
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

        const scene = SceneManager.GetActiveScene();
        gameObj.scene = scene;

        Object.InstantiationQueue.Add(() => {
            const min = tilemap.bounds.min;
            const max = tilemap.bounds.max;
            const rect = Rect.MinMaxRect(min.x, min.y, max.x, max.y);
        
            scene.tree.Insert(gameObj, rect);

            scene.gameObjects.push(gameObj);

            GameObject.Find("grid").transform.AttachChild(transform);
        });
    }
}