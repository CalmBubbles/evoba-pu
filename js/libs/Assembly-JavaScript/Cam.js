class Cam extends GameBehavior
{
    static instance = null;

    Start ()
    {
        Cam.instance = this;
    }
    
    LateUpdate ()
    {
        this.transform.position = Vector2.Lerp(
            this.transform.position,
            new Vector2(
                Player.instance.transform.position.x,
                Math.max(Player.instance.transform.position.y + 0.5, 0)
            ),
            15 * Time.deltaTime
        );
    }
}