import BggGameService from "./BggGameService";
import { GameInfo } from "../models/GameInfo";
import { CollectionMap, CollectionMerger } from "./CollectionMerger";

interface LoadingInfo {
    username: string;
    isWaitingForRetry: boolean;
}

type CollectionUpdateEventHandler = (games: GameInfo[]) => void;
type LoadingUpdateEventHandler = (games: LoadingInfo[]) => void;

export default class BggGameLoader {

    private readonly service: BggGameService;
    private collectionMap: CollectionMap = {};


    private currentNames: string[] = [];
    private loadingNames: string[] = [];
    private readonly eventHandlers: CollectionUpdateEventHandler[] = [];
    private readonly loadingEventHandlers: LoadingUpdateEventHandler[] = [];

    private readonly merger: CollectionMerger;


    constructor(bggService: BggGameService, merger: CollectionMerger) {
        this.service = bggService;
        this.loadCollections = this.loadCollections.bind(this);
        this.loadCollectionWithRetry = this.loadCollectionWithRetry.bind(this);
        this.merger = merger;
    }

    public async loadCollections(usernames: string[]): Promise<GameInfo[][]> {
        this.collectionMap = {};
        this.currentNames = usernames;
        const collections = await Promise.all(usernames.map(async (username) => {
            const games = await this.loadCollectionWithRetry(username);
            this.collectionMap[username] = games;
            this.informCollectionUpdateHandlers();
            return games;
        }));
        return collections;
    }

    private informCollectionUpdateHandlers() {
        const allGames = this.merger.getMergedCollection(this.collectionMap);
        this.eventHandlers.forEach((handler) => handler(allGames));
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