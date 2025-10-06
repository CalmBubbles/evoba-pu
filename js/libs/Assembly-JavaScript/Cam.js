class Cam extends GameBehavior
{
    #player = null;

    Start ()
    {
        this.#player = GameObject.Find("player");
    }

    LateUpdate ()
    {
        this.transform.position = Vector2.Lerp(
            this.transform.position,
            new Vector2(
                this.#player.transform.position.x,
                Math.max(this.#player.transform.position.y + 0.5, 0)
            ),
            15 * Time.deltaTime
        );
    }
}