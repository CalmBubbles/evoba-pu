class Cam extends GameBehavior
{
    static instance = null;

    #lerpSpeed = 5;
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
        const inPos = this.transform.position;
        const targetPos = new Vector2(
            Player.instance.transform.position.x,
            Math.max(Player.instance.transform.position.y + 0.5, 0)
        );

        let pos = Vector2.Lerp(
            inPos,
            targetPos,
            this.#lerpSpeed * Time.deltaTime / Player.instance.moveDelay
        );

        if (Player.instance.isFalling) pos.y = Math.Lerp(inPos.y, targetPos.y, 20 * Time.deltaTime);

        if (this.#shakeTime <= 0)
        {
            this.transform.position = pos;
            return;
        }

        this.#shakeTime -= Time.deltaTime;

        const intensityScale = this.#shakeTime / this.#shakeDuration * 0.25;

        this.transform.position = Vector2.Add(
            pos,
            Vector2.Scale(
                new Vector2(
                    Math.random() * 1 + 0.5,
                    Math.random() * 1 + 0.5
                ),
                Vector2.Scale(
                    this.#shakeIntensity,
                    intensityScale
                )
            )
        );
        this.transform.rotation = (Math.random() * 1 + 0.5) * (this.#shakeAngularIntensity * intensityScale);

        if (this.#shakeTime > 0) return;

        this.#shakeIntensity = Vector2.zero;
        this.#shakeAngularIntensity = 0;
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