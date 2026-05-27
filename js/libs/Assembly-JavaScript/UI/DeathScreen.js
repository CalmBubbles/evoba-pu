class DeathScreen extends GameBehavior
{
    static instance = null;

    #showDuration = 0.25;
    #showTime = 0; // real...
    #enabled = false;

    #backdrop = null;
    #header = null;
    #subtext = null;

    Start ()
    {
        DeathScreen.instance = this;

        this.#backdrop = this.transform.Find("backdrop").GetComponent(SpriteRenderer);
        this.#header = this.transform.Find("header").GetComponent(Text);
        this.#subtext = this.transform.Find("subtext").GetComponent(Text);

        this.#backdrop.color.a = 0;
        this.#header.color.a = 0;
        this.#subtext.color.a = 0;
    }

    Update ()
    {
        if (!this.#enabled) return;
        
        this.#showTime += Time.deltaTime;
        const percent = Math.Clamp(this.#showTime / this.#showDuration, 0, 1);

        this.#backdrop.color.a = percent * 0.75;
        this.#header.color.a = percent;
        this.#subtext.color.a = percent;
    }

    Show ()
    {
        if (this.#enabled) return;

        this.#enabled = true;
    }
}