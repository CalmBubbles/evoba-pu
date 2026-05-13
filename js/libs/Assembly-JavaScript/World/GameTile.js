class GameTile
{
    id = null;
    data = null;

    constructor (id)
    {
        this.id = id;
    }

    GetCommonData ()
    {
        return TileBank.GetTileInfo(this.id);
    }
}