import * as React from "react";
// import "./../assets/scss/App.scss";
import BggGameService from "../services/BggGameService";
import { GameInfo } from "../models/GameInfo";
import { CollectionMerger } from "../services/CollectionMerger";
import WelcomePage from "./WelcomePage";
import CollectionPage from "./CollectionPage";

export interface AppProps {
    bggServce?: BggGameService;
}


export interface AppState {
    userCollections: { [names: string]: GameInfo[] };
    names: string[];
    games: GameInfo[];
    loadingMessage: string;
    showingCollection: boolean;
}


export default class App extends React.Component<AppProps, AppState> {

    private collectionMerger: CollectionMerger;
    constructor(superProps: Readonly<AppProps>) {
        super(superProps);
        this.state = { games: [], loadingMessage: "", names: [], userCollections: {}, showingCollection: false };
        this.collectionMerger = new CollectionMerger();

        this.fetchGames = this.fetchGames.bind(this);
        this.onNameSelect = this.onNameSelect.bind(this);
        this.userValidator = this.userValidator.bind(this);

    }


    async fetchGames(name: string) {
        this.setState({ loadingMessage: "Fetching games", games: [] });
        const games = await this.getBggService().getUserCollection(name);
        if (Array.isArray(games)) {
            const collection = this.state.userCollections;
            collection[name] = games;
            const allGames = this.collectionMerger.getMergedCollection(collection);
            this.setState({ games: allGames, userCollections: collection, loadingMessage: "", showingCollection: true });
        } else if (games.retryLater) {
            if (games.error) {
                this.setState({ loadingMessage: "An error occoured, trying agian in 5 seconds" });
            } else {
                this.setState({ loadingMessage: "Bgg is working on it, trying again in 5 seconds" });
            }
            setTimeout(() => this.fetchGames(name), 5000);
        }
    }

    getBggService() {
        return this.props.bggServce || new BggGameService();
    }


    onNameSelect(newNames: string[]) {
        this.setState({
            names: newNames,
            userCollections: {}
        });
        newNames.forEach(this.fetchGames);
    }


    async userValidator(name: string) {
        const res = await this.getBggService().getUserInfo(name);
        return res.isValid === true;
    }

    render() {
        const { loadingMessage, games, showingCollection } = this.state;
        return (
            <span >
                {!showingCollection && <WelcomePage onNameSelect={this.onNameSelect} userValidator={this.userValidator} />}
                {loadingMessage}
                {showingCollection && <CollectionPage games={games} />}
            </span>
        );
    }
}
