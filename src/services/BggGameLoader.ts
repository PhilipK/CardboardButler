import BggGameService from "./BggGameService";
import { GameInfo, GameInfoPlus, ExtendedGameInfo } from "../models/GameInfo";
import { CollectionMap, CollectionMerger, CollectionMapPlus } from "./CollectionMerger";



interface LoadingInfo {
    username: string;
    isWaitingForRetry: boolean;
}

interface ExtraInfoMap {
    [id: number]: (ExtendedGameInfo | undefined);
}

type CollectionUpdateEventHandler = (games: GameInfoPlus[]) => void;
type LoadingUpdateEventHandler = (games: LoadingInfo[]) => void;


export default class BggGameLoader {

    private readonly service: BggGameService;
    private collectionMap: CollectionMapPlus = {};

    private extraInfoMap: ExtraInfoMap = {};


    private currentNames: string[] = [];
    private loadingNames: string[] = [];
    private readonly eventHandlers: CollectionUpdateEventHandler[] = [];
    private readonly loadingEventHandlers: LoadingUpdateEventHandler[] = [];

    private readonly merger: CollectionMerger;
    private useCache: boolean;



    constructor(bggService: BggGameService, merger: CollectionMerger, useCache: boolean = false) {
        this.service = bggService;
        this.loadCollections = this.loadCollections.bind(this);
        this.loadCollectionWithRetry = this.loadCollectionWithRetry.bind(this);
        this.getAllGamesPlus = this.getAllGamesPlus.bind(this);
        this.informCollectionUpdateHandlers = this.informCollectionUpdateHandlers.bind(this);
        this.merger = merger;
        this.useCache = useCache;
        this.extraInfoMap = {};
        this.LoadExtraInfo();

    }

    public async loadCollections(usernames: string[]): Promise<GameInfo[][]> {
        this.collectionMap = {};
        this.currentNames = usernames;
        return await Promise.all(usernames.map(async (username) => {
            const games = await this.loadCollectionWithRetry(username);
            this.collectionMap[username] = games;
            this.informCollectionUpdateHandlers();
            return games;
        }));

    }

    public async loadExtendedInfo(): Promise<GameInfoPlus[]> {
        const allGames = this.merger.getMergedCollection(this.collectionMap);
        const unknownGames = allGames.filter((game) => this.extraInfoMap[game.id] === undefined);
        await Promise.all(unknownGames.map(async (gameNeedsInfo) => {
            const extraInfo = await this.loadGameWithRetry(gameNeedsInfo);
            this.extraInfoMap[gameNeedsInfo.id] = extraInfo;
            this.StoreExtraInfo();
            this.informCollectionUpdateHandlers();
        }));
        return;
    }


    private StoreExtraInfo() {
        if (localStorage && this.useCache) {
            localStorage.setItem("extrainfo", JSON.stringify(this.extraInfoMap));
        }
    }

    private LoadExtraInfo() {
        this.extraInfoMap = {};
        if (localStorage && this.useCache) {
            const cache = JSON.parse(localStorage.getItem("extrainfo")) as ExtraInfoMap;
            if (cache) {
                this.extraInfoMap = cache;
            }
        }
    }

    private getAllGamesPlus() {
        const allGames = this.merger.getMergedCollection(this.collectionMap);
        const allGamesPlus = allGames.map((ag) => Object.assign({}, ag, this.extraInfoMap[ag.id] || {}));
        return allGamesPlus;
    }

    private informCollectionUpdateHandlers() {
        const allGamesPlus = this.getAllGamesPlus();
        this.eventHandlers.forEach((handler) => handler(allGamesPlus));
    }

    private informLoadingHandlers() {
        const loadingInfo = this.getLoadingInfo();
        this.loadingEventHandlers.forEach((handler) => handler(loadingInfo));
    }


    private async loadCollectionWithRetry(name: string): Promise<GameInfo[]> {
        this.loadingNames.push(name);
        this.informLoadingHandlers();
        const games = await this.service.getUserCollection(name);
        if (Array.isArray(games)) {
            this.loadingNames = this.loadingNames.filter((n) => n !== name);
            this.informLoadingHandlers();
            return games;
        } else {
            // add reload info
            return new Promise<GameInfo[]>(async resolver => {
                setTimeout(() => resolver(this.loadCollectionWithRetry(name)), 1000);
            });
        }
    }

    private async loadGameWithRetry(game: GameInfo): Promise<ExtendedGameInfo> {
        const { id, name } = game;
        this.loadingNames.push(name);
        this.informLoadingHandlers();
        const extended = await this.service.getGameInfo(id);
        if (!("retryLater" in extended)) {
            this.loadingNames = this.loadingNames.filter((n) => n !== name);
            this.informLoadingHandlers();
            return extended;
        } else {
            // add reload info
            return new Promise<ExtendedGameInfo>(async resolver => {
                setTimeout(() => resolver(this.loadGameWithRetry(game)), 1000);
            });
        }
    }

    public onGamesUpdate(handler: CollectionUpdateEventHandler) {
        this.eventHandlers.push(handler);
    }

    public getCurrentNames(): string[] {
        return this.currentNames;
    }

    public getLoadingInfo(): LoadingInfo[] {
        return this.loadingNames.map((name) => ({
            username: name,
            isWaitingForRetry: false
        }));
    }



    public onLoadUpdate(handler: LoadingUpdateEventHandler) {
        this.loadingEventHandlers.push(handler);
    }


}