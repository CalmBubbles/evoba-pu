class ChunkNode
{
    x = 0;
    y = 0;
    owners = [];

    chunk = null;

    get pos ()
    {
        return new Vector2(this.x, this.y);
    }

    RemoveTile ()
    {
        this.chunk.RemoveTile(this);
    }

    SetTile (tileID)
    {
        this.chunk.SetTile(this, tileID);
    }

    AddOwner (obj)
    {
        if (!this.owners.includes(obj)) this.owners.push(obj);
    }

    RemoveOwner (obj)
    {
        const index = this.owners.indexOf(obj);
        if (index >= 0) this.owners.splice(index, 1);
    }

    RemoveOwnerOfType (type)
    {
        const obj = this.GetOwnerOfType(type);
        if (obj != null) this.RemoveOwner(obj);
    }

    GetOwnerOfType (type)
    {
        return this.owners.find(item => (item instanceof type));
    }

    GetOwnersOfType (type)
    {
        return this.owners.filter(item => (item instanceof type));
    }
}