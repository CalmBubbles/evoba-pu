class UserData
{
    static #db = null;
    static #info = null;

    static get username ()
    {
        return this.#info.username;
    }

    static set username (data)
    {
        this.#info.username = data;
    }

    static get id ()
    {
        return this.#info.id;
    }

    static async Load ()
    {
        // window.indexedDB.deleteDatabase("user");

        const dbRequest = window.indexedDB.open("user");

        dbRequest.onupgradeneeded = () => {
            dbRequest.result.createObjectStore("info").put({
                username: "CalmBubbles",
                id: crypto.randomUUID()
            }, 0);
            dbRequest.result.createObjectStore("settings");
        };

        await new Promise(resolve => dbRequest.onsuccess = () => {
            this.#db = dbRequest.result;

            resolve();
        });

        const dbTransaction = this.#db.transaction([
            "info",
            // "settings"
        ], "readwrite");

        const infoRequest = dbTransaction.objectStore("info").get(0);
        await new Promise(resolve => infoRequest.onsuccess = resolve);
        this.#info = infoRequest.result;
    }

    static async Save ()
    {
        const dbTransaction = this.#db.transaction("info", "readwrite");
        const infoStore = dbTransaction.objectStore("info");

        const putRequest = infoStore.put(this.#info, 0);
        await new Promise(resolve => putRequest.onsuccess = resolve);
    }
}