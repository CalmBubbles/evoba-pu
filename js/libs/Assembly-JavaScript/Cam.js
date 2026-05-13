class Cam extends GameBehavior
{
    static instance = null;

    #shakeDuration = 0;
    #shakeTime = 0;
    #shakeAngularIntensity = 0;
    #shakeIntensity = Vector2.zero;

    Start ()
    {
        Cam.instance = this;
    }

    Update ()
    {
        if (Input.GetKeyDown(KeyCode.F4)) GameWindow.fullscreen = !GameWindow.fullscreen;
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

        if (this.#shakeTime <= 0) return;

        this.#shakeTime -= Time.deltaTime;

        this.transform.position = new Vector2(
            this.transform.position.x + (Math.random() * 2 - 1) * (this.#shakeIntensity.x * (this.#shakeTime / this.#shakeDuration * 0.25)),
            this.transform.position.y + (Math.random() * 2 - 1) * (this.#shakeIntensity.y * (this.#shakeTime / this.#shakeDuration * 0.25))
        );
        this.transform.rotation = (Math.random() * 2 - 1) * (this.#shakeAngularIntensity * (this.#shakeTime / this.#shakeDuration * 0.25));

        if (this.#shakeTime > 0) return;

        this.transform.rotation = 0;
    }

    Shake (duration, intensity, angularIntensity)
    {
        this.#shakeDuration += duration;
        this.#shakeTime += duration;
        this.#shakeIntensity = Vector2.Add(this.#shakeIntensity, intensity);
        this.#shakeAngularIntensity += angularIntensity;
    }
}