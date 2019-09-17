import BggGameService from "./BggGameService";
import { GameInfo } from "../models/GameInfo";

interface LoadingInfo {
    username: string;
    isWaitingForRetry: boolean;
}

type CollectionUpdateEventHandler = (games: GameInfo[]) => void;

export default class BggGameLoader {

    private _service: BggGameService;

    private _currentNames: string[] = [];

    private _loadingNames: string[] = [];

    private eventHandlers: CollectionUpdateEventHandler[] = [];

    constructor(bggService: BggGameService) {
        this._service = bggService;
        this.loadCollections = this.loadCollections.bind(this);
    }

    public async loadCollections(usernames: string[]): Promise<GameInfo[][]> {
        this._currentNames = usernames;
        const collections = await Promise.all(this._currentNames.map(async (name) => {
            this._loadingNames.push(name);
            const games = await this._service.getUserCollection(name);
            this._loadingNames = this._loadingNames.filter((n) => n !== name);
            if (Array.isArray(games)) {
                this.eventHandlers.forEach((handler) => handler(games));
            }
            return games as GameInfo[];
        }));
        return collections;

    }

    public onGamesUpdate(handler: CollectionUpdateEventHandler) {
        this.eventHandlers.push(handler);
    }

    public currentNames(): string[] {
        return this._currentNames;
    }

    public getLoadingInfo(): LoadingInfo[] {
        return this._loadingNames.map((name) => ({
            username: name,
            isWaitingForRetry: false
        }));

    }


}