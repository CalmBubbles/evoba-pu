class EntityBank
{
    static #entities = [];

    static Add (id, data, packUUID)
    {
        const existingEntity = this.#entities.find(item => item.id === id);
    }
}