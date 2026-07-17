
export interface api {

    list(): string;

    detail(): string;

    create(): string;
    update(): string;
    remove(): string;

    enable(): string;
    disable(): string;

    /**
     * /download/template
     */
    downloadTmp(): string;

}

export default class url implements api {

    constructor(uri: string) {
        this._uri = uri;
    }

    private _uri: string;

    uri(): string {
        return `${this._uri}`;
    }

    list(): string {
        return `${this._uri}/list`;
    };

    detail(): string {
        return `${this._uri}/detail`;
    }

    create(): string {
        return `${this._uri}/create`;
    }

    update(): string {
        return `${this._uri}/update`;
    }

    remove(): string {
        return `${this._uri}/remove`;
    }

    enable(): string {
        return `${this._uri}/enable`;
    }

    disable(): string {
        return `${this._uri}/disable`;
    }

    downloadTmp(): string {
        return `${this._uri}/download/template`;
    }

}