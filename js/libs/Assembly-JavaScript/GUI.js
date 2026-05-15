class GUI extends GameBehavior
{
    #tiles = 0;
    #hp = 0;
    #maxHp = 0;
    #energy = 0;
    #maxEnergy = 0;

    #tilesText = null;
    #hpText = null;
    #hpBack = null;
    #hpBar = null;
    #energyText = null;
    #energyBack = null;
    #energyBar = null; // monch... mmmmmmmmmm...
    
    Start ()
    {
        this.#tilesText = this.transform.Find("tiles/text").GetComponent(Text);

        this.#hpText = this.transform.Find("hp/text").GetComponent(Text);
        this.#hpBack = this.transform.Find("hp/back");
        this.#hpBar = this.transform.Find("hp/bar");

        this.#energyText = this.transform.Find("energy/text").GetComponent(Text);
        this.#energyBack = this.transform.Find("energy/back");
        this.#energyBar = this.transform.Find("energy/bar");
    }
    
    LateUpdate ()
    {
        if (this.#tiles !== Player.instance.tiles)
        {
            this.#tiles = Player.instance.tiles;
            this.#tilesText.text = `${this.#tiles}`;
        }

        if (this.#hp !== Player.instance.hp)
        {
            this.#hp = Player.instance.hp;
            this.#hpText.text = `${Math.ceil(this.#hp)}/${Math.ceil(this.#maxHp)}`;
            this.#hpBar.scale = new Vector2(
                Math.Clamp(4 * this.#hp, 0, 160),
                this.#hpBar.scale.y
            );
        }

        if (this.#maxHp !== Player.instance.maxHp)
        {
            this.#maxHp = Player.instance.maxHp;
            this.#hpText.text = `${Math.ceil(this.#hp)}/${Math.ceil(this.#maxHp)}`;
            this.#hpBack.scale = new Vector2(
                Math.Clamp(4 * this.#maxHp, 0, 160),
                this.#hpBack.scale.y
            );
        }

        if (this.#energy !== Player.instance.energy)
        {
            this.#energy = Player.instance.energy;
            this.#energyText.text = `${Math.ceil(this.#energy)}/${Math.ceil(this.#maxEnergy)}`;
            this.#energyBar.scale = new Vector2(
                Math.Clamp(4 * this.#energy, 0, 160),
                this.#energyBar.scale.y
            );
        }

        if (this.#maxEnergy !== Player.instance.maxEnergy)
        {
            this.#maxEnergy = Player.instance.maxEnergy;
            this.#energyText.text = `${Math.ceil(this.#energy)}/${Math.ceil(this.#maxEnergy)}`;
            this.#energyBack.scale = new Vector2(
                Math.Clamp(4 * this.#maxEnergy, 0, 160),
                this.#energyBack.scale.y
            );
        }

        GameWindow.SetTitle(Player.instance.pos);
    }
}