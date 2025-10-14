class GUI extends GameBehavior
{
    #tiles = 0;

    #tilesText = null;
    
    Start ()
    {
        this.#tilesText = this.transform.Find("tiles/text").GetComponent("Text");
    }
    
    Update ()
    {
        if (this.#tiles !== Player.tiles)
        {
            this.#tiles = Player.tiles;
            this.#tilesText.text = `${Player.tiles}`;
        }
    }
}