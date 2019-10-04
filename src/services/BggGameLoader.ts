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
const storageVersion = "2";


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
        this.loadCollectionsFromCache();
        this.loadExtraInfo();
        this.setStorageVersion();
    }

    public async loadCollections(usernames: string[]): Promise<GameInfo[][]> {
        this.currentNames = usernames;
        this.informCollectionUpdateHandlers();
        return await Promise.all(usernames.map(async (username) => {
            const games = await this.loadCollectionWithRetry(username);
            this.collectionMap[username] = games;
            this.storeCollections();
            this.informCollectionUpdateHandlers();
            return games;
        }));

    }

    public async loadExtendedInfo() {
        const allGames = this.getAllGamesPlus();
        const allUnknownGames = allGames.filter((game) => this.extraInfoMap[game.id] === undefined);
        const loadingInfo: LoadingInfo[] = allUnknownGames.map((game) => ({
            type: "game",
            isLoading: false,
            gameinfo: game
        }));
        this.loadingInfo = [...loadingInfo, ...this.loadingInfo];
        const chunks = this.chunk(allUnknownGames, 50);
        return await Promise.all(chunks.map((unknownGames) => {
            return this.loadGamesWithRetry(unknownGames).then((extraInfos) => {
                extraInfos.forEach((extraInfo, i) => {
                    this.extraInfoMap[unknownGames[i].id] = extraInfo;
                });
                this.storeExtraInfo();
                this.informCollectionUpdateHandlers();
                return extraInfos;
            });
        }));
    }

    public async loadPlays() {
        const names = this.currentNames;
        return Promise.all(names.map(async (name) => {
            const playerPlays = await this.service.getPlays(name);
        }));
    }

    private chunk<T>(input: T[], chunkSize: number): T[][] {
        const chunked_arr: T[][] = [];
        const copied = [...input];
        const numOfChild = Math.ceil(copied.length / chunkSize);
        for (let i = 0; i < numOfChild; i++) {
            chunked_arr.push(copied.splice(0, chunkSize));
        }
        return chunked_arr;
    }


    private storeExtraInfo() {
        if (localStorage && this.useCache) {
            localStorage.setItem("extrainfo", JSON.stringify(this.extraInfoMap));
        }
    }

    private loadExtraInfo() {
        this.extraInfoMap = {};
        if (localStorage && this.useCache) {
            if (localStorage.getItem("storageVersion") !== storageVersion) {
                localStorage.removeItem("extrainfo");
            }
            const cache = JSON.parse(localStorage.getItem("extrainfo")) as ExtraInfoMap;
            if (cache) {
                this.extraInfoMap = cache;
            }
        }
    }

    private setStorageVersion() {
        if (localStorage && this.useCache) {
            localStorage.setItem("storageVersion", storageVersion);
        }
    }


    private storeCollections() {
        if (localStorage && this.useCache) {
            localStorage.setItem("collections", JSON.stringify(this.collectionMap));
        }
    }

    private loadCollectionsFromCache() {
        this.collectionMap = {};
        if (localStorage && this.useCache) {
            if (localStorage.getItem("storageVersion") !== storageVersion) {
                localStorage.removeItem("collections");
            }
            const cache = JSON.parse(localStorage.getItem("collections")) as CollectionMap;
            if (cache) {
                this.collectionMap = cache;
            }
        }
    }

    private getAllGamesPlus() {
        const shownGamesMap = this.currentNames.reduce((prev, cur) => {
            const known = this.collectionMap[cur];
            if (!known) {
                return prev;
            }
            const newC: CollectionMap = {};
            newC[cur] = known;
            return Object.assign({}, prev, newC);
        }, {}) as CollectionMap;
        const allGames = this.merger.getMergedCollection(shownGamesMap);
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
        this.loadingInfo = this.loadingInfo.filter((n) => n.type === "collection" && n.username !== name);
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

    private async loadGamesWithRetry(games: GameInfo[]) {
        const ids = games.map((g) => g.id);
        ids.forEach((id) => {
            const loadingIndex = this.loadingInfo.findIndex((li) => li.type === "game" && li.gameinfo.id === id);
            this.loadingInfo[loadingIndex].isLoading = true;
            this.loadingInfo[loadingIndex].retryInfo = undefined;
        });
        this.informLoadingHandlers();
        const extendeds = await this.service.getGamesInfo(ids);
        if (!("retryLater" in extendeds)) {
            ids.forEach((id) => {
                this.loadingInfo = this.loadingInfo.filter((g) => g.type !== "game" || g.gameinfo.id !== id);
            });
            this.informLoadingHandlers();
            return extendeds;
        } else {
            const retryTime = (extendeds && extendeds.backoff) ? 10000 : 3000;
            if (extendeds && extendeds.backoff) {
                this.concurrentRequestLimit = Math.max(this.concurrentRequestLimit - 1, 1);
            }
            ids.forEach((id) => {
                const loadingIndex = this.loadingInfo.findIndex((li) => li.type === "game" && li.gameinfo.id === id);
                this.loadingInfo[loadingIndex].retryInfo = extendeds;
            });
            this.informLoadingHandlers();
            return new Promise<ExtendedGameInfo[]>(async resolver => {
                setTimeout(() => resolver(this.loadGamesWithRetry(games)), retryTime);
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