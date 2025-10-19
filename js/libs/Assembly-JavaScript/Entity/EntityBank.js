class EntityBank
{
    static #entities = [];

    static Add (data, packUUID)
    {
        const existingEntity = this.#entities.find(item => item.id === data.id);
        const behavior = {
            pack: packUUID,
            movement: {
                type: data.movement.type
            }
        };

        if (existingEntity != null)
        {
            existingEntity.behavior.push(behavior);

            return;
        }
        
        this.#entities.push({
            id: data.id,
            behavior: [behavior],
            sprites: []
        });
    }

    static Remove (id, packUUID)
    {
        const entity = this.#entities.find(item => item.id === id);
        if (entity == null) return;
        
        const behavior = entity.behavior.find(item => item.pack === packUUID);
        if (behavior == null) return;

        entity.behavior.splice(entity.behavior.indexOf(behavior), 1);

        if (entity.behavior.length === 0) this.#entities.splice(this.#entities.indexOf(entity), 1);
    }

    static AddSprites (id, sprites, packUUID)
    {
        const entity = this.#entities.find(item => item.id === id);

        if (entity != null) entity.sprites.push({
            pack: packUUID,
            sprites: sprites
        });
    }

    static RemoveSprites (id, packUUID)
    {
        const entity = this.#entities.find(item => item.id === id);
        if (entity == null) return;
        
        const sprites = entity.sprites.find(item => item.pack === packUUID);
        if (sprites != null) entity.sprites.splice(entity.sprites.indexOf(sprites), 1);
    }

    static async Spawn (id, pos)
    {
        const entity = this.#entities.find(item => item.id === id);
        let entityData = {
            id: id,
            movement: {
                type: "pu:normal"
            },
            sprites: entity.sprites[entity.sprites.length - 1].sprites
        };

        for (let i = 0; i < entity.behavior.length; i++)
        {
            const behavior = entity.behavior[i];

            entityData.movement.type = behavior.movement?.type ?? entityData.movement.type;
        }

        let objID = 0;

        while (GameObject.FindByID(objID) != null) objID++;

        const sprRenderer = new SpriteRenderer(entityData.sprites[0].entries[0]);
        sprRenderer.sortingLayer = 2;
        const scriptableEntity = new ScriptableEntity();
        scriptableEntity.pos = pos.Duplicate();

        const gameObj = new GameObject(
            `entity_${crypto.randomUUID()}`,
            [
                sprRenderer,
                scriptableEntity
            ],
            true,
            null,
            objID
        );

        const scene = SceneManager.GetActiveScene();
        gameObj.scene = scene;

        Object.InstantiationQueue.Add(() => {
            const min = sprRenderer.bounds.min;
            const max = sprRenderer.bounds.max;
            const rect = Rect.MinMaxRect(min.x, min.y, max.x, max.y);
        
            scene.tree.Insert(gameObj, rect);

            scene.gameObjects.push(gameObj);
        });
    }
}