import BggGameService, { BggRetryResult } from "./BggGameService";
import { GameInfo, GameInfoPlus, ExtendedGameInfo } from "../models/GameInfo";
import { CollectionMap, CollectionMerger, CollectionMapPlus } from "./CollectionMerger";



interface LoadingStatus {
    isLoading: boolean;
    retryInfo?: BggRetryResult;
}


interface GameLoadingInfo {
    type: "game";
    gameinfo: GameInfo;
}

interface CollectionLoadingInfo {
    type: "collection";
    username: string;
}


export type LoadingInfo = LoadingStatus & (GameLoadingInfo | CollectionLoadingInfo);

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
    private loadingInfo: LoadingInfo[] = [];
    private readonly eventHandlers: CollectionUpdateEventHandler[] = [];
    private readonly loadingEventHandlers: LoadingUpdateEventHandler[] = [];

    private readonly merger: CollectionMerger;
    private useCache: boolean;


    private concurrentRequestLimit: number = 5;


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

    public async loadExtendedInfo() {
        const allGames = this.merger.getMergedCollection(this.collectionMap);
        const unknownGames = allGames.filter((game) => this.extraInfoMap[game.id] === undefined);
        const loadingInfo: LoadingInfo[] = unknownGames.map((game) => ({
            type: "game",
            isLoading: false,
            gameinfo: game
        }));
        this.loadingInfo = [...loadingInfo, ...this.loadingInfo];
        while (unknownGames.length > 0) {
            const promises: Promise<ExtendedGameInfo>[] = [];
            for (let i = 0; i < this.concurrentRequestLimit; i++) {
                const currentGame = unknownGames.pop();

                if (currentGame !== undefined) {
                    const promise = this.loadGameWithRetry(currentGame).then((extraInfo) => {
                        this.extraInfoMap[currentGame.id] = extraInfo;
                        this.StoreExtraInfo();
                        this.informCollectionUpdateHandlers();
                        return extraInfo;
                    });
                    promises.push(promise);
                }
            }
            await Promise.all(promises);
        }
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
        this.loadingInfo.push({
            isLoading: true,
            type: "collection",
            username: name
        });
        this.informLoadingHandlers();
        const games = await this.service.getUserCollection(name);
        if (Array.isArray(games)) {
            this.loadingInfo = this.loadingInfo.filter((n) => n.type === "collection" && n.username !== name);
            this.informLoadingHandlers();
            return games;
        } else {
            const retryTime = games && games.backoff ? 10000 : 1000;
            return new Promise<GameInfo[]>(async resolver => {
                setTimeout(() => resolver(this.loadCollectionWithRetry(name)), retryTime);
            });
        }
    }

    private async loadGameWithRetry(game: GameInfo) {
        const { id } = game;
        const loadingIndex = this.loadingInfo.findIndex((li) => li.type === "game" && li.gameinfo.id === id);
        this.loadingInfo[loadingIndex].isLoading = true;
        this.loadingInfo[loadingIndex].retryInfo = undefined;
        this.informLoadingHandlers();
        const extended = await this.service.getGameInfo(id);
        if (!("retryLater" in extended)) {
            this.loadingInfo = this.loadingInfo.filter((g) => g.type !== "game" || g.gameinfo.id !== id);
            this.informLoadingHandlers();
            return extended;
        } else {
            const retryTime = (extended && extended.backoff) ? 10000 : 3000;
            if (extended && extended.backoff) {
                this.concurrentRequestLimit = Math.max(this.concurrentRequestLimit - 1, 1);
            }
            const loadingIndex = this.loadingInfo.findIndex((li) => li.type === "game" && li.gameinfo.id === id);
            this.loadingInfo[loadingIndex].retryInfo = extended;
            this.informLoadingHandlers();
            return new Promise<ExtendedGameInfo>(async resolver => {
                setTimeout(() => resolver(this.loadGameWithRetry(game)), retryTime);
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
        return this.loadingInfo;
    }



    public onLoadUpdate(handler: LoadingUpdateEventHandler) {
        this.loadingEventHandlers.push(handler);
    }


}