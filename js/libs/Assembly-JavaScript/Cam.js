class Cam extends GameBehavior
{
    static instance = null;

    #pos = Vector2.zero;
    #shakeOffset = Vector2.zero;
    #shakes = [];

    Start ()
    {
        Cam.instance = this;
        this.#pos = this.transform.position;
    }

    Update ()
    {
        if (Input.GetKeyDown(KeyCode.F4)) GameWindow.fullscreen = !GameWindow.fullscreen;
    }

    #ProcessShakes ()
    {
        this.transform.rotation = 0;
        this.#shakeOffset = Vector2.zero;

        if (this.#shakes.length === 0) return;

        let rotation = 0;
        let removing = [];

        for (let i = 0; i < this.#shakes.length; i++)
        {
            const data = this.#shakes[i];

            // Wiggle freq excluding peak
            const freq = 1 / Math.ceil(4 * data.duration);
            const scaledTime = ((data.time - data.duration * (1 + 0.5 * freq - freq)) * Math.PI) / (0.5 * data.duration * freq);
            let intensityScale = Math.sin(scaledTime) / scaledTime;

            if (Number.isNaN(intensityScale)) intensityScale = 0;

            this.#shakeOffset = Vector2.Add(
                this.#shakeOffset,
                Vector2.Scale(
                    data.intensity,
                    intensityScale
                )
            );
            rotation += data.angularIntensity * intensityScale;

            data.time -= Time.deltaTime;

            if (data.time > 0) continue;
            
            data.onDone();
            removing.push(data);
        }

        for (let i = 0; i < removing.length; i++) this.#shakes.splice(this.#shakes.indexOf(removing[i]), 1);

        this.transform.rotation = rotation;
    }
    
    LateUpdate ()
    {
        const targetPos = new Vector2(
            Player.instance.transform.position.x,
            Math.max(Player.instance.transform.position.y + 0.5, 0)
        );
        this.#pos = Vector2.Lerp(
            this.#pos,
            targetPos,
            5 * Time.deltaTime / Player.instance.currentMoveDelay
        );

        if (Player.instance.isFalling) this.#pos.y = Math.Lerp(this.#pos.y, targetPos.y, 20 * Time.deltaTime);

        this.#ProcessShakes();

        this.transform.rotation = 15;

        this.transform.position = Vector2.Add(this.#pos, this.#shakeOffset);
    }

    async Shake (duration, intensity, angularIntensity)
    {
        const data = {
            duration: duration,
            time: duration,
            intensity: Vector2.Scale(
                intensity,
                new Vector2(
                    Math.RandomRanged(0.5, 1),
                    Math.RandomRanged(0.5, 1)
                )
            ),
            angularIntensity: angularIntensity * Math.RandomRanged(0.5, 1),
            onDone: () => { }
        };
        this.#shakes.push(data);

        await new Promise(resolve => data.onDone = resolve);
    }
}