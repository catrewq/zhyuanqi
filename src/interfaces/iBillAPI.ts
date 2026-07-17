
export interface billApi {

    list(): string;

    detail(): string;

    save(): string;
    commit(): string;
    audit(): string;
    cancel(): string;

    /**
     * /download/template
     */
    downloadTmp(): string;

}

export default class billUrl implements billApi {

    constructor(uri: string) {
        this._uri = uri;
    }

    private _uri: string;

    uri(): string {
        return `${this._uri}`;
    }

    list(): string {
        return `${this._uri}/list`;
    }

    detail(): string {
        return `${this._uri}/detail`;
    }

    save(): string {
        return `${this._uri}/save`;
    }

    commit(): string {
        return `${this._uri}/commit`;
    }

    audit(): string {
        return `${this._uri}/audit`;
    }

    cancel(): string {
        return `${this._uri}/cancel`;
    }

    downloadTmp(): string {
        return `${this._uri}/download/template`;
    }

}