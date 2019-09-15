import * as React from "react";
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

        this.collectionMerger = new CollectionMerger();

        this.fetchGames = this.fetchGames.bind(this);
        this.onNameSelect = this.onNameSelect.bind(this);
        this.userValidator = this.userValidator.bind(this);
        this.handleHashChange = this.handleHashChange.bind(this);
        this.state = { games: [], loadingMessage: "", names: [], userCollections: {}, showingCollection: false };
        window.addEventListener("hashchange", this.handleHashChange, false);
    }

    private retries: any[] = [];


    async fetchGames(name: string) {
        this.setState({ loadingMessage: "Fetching games" });
        const games = await this.getBggService().getUserCollection(name);
        if (Array.isArray(games)) {
            const collection = this.state.userCollections;
            collection[name] = games;
            const allGames = this.collectionMerger.getMergedCollection(collection);
            this.setState({ games: allGames, userCollections: collection, loadingMessage: "", showingCollection: true });
        } else if (games && games.retryLater) {
            if (games.error) {
                this.setState({ loadingMessage: "An error occoured, trying agian in 5 seconds" });
            } else {
                this.setState({ loadingMessage: "Bgg is working on it, trying again in 5 seconds" });
            }
            const timeoutHandler = setTimeout(() => this.fetchGames(name), 5000);
            this.retries.push(timeoutHandler);
        }
    }


    componentDidMount() {
        this.handleHashChange();
    }

    handleHashChange() {
        const hashValue = window.location.hash.substr(0);
        if (hashValue && hashValue !== "" && hashValue.indexOf("usernames=") > -1) {
            const usernames = hashValue.substring("usernames=".length + 1).split(",");
            this.onNameSelect(usernames);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("hashchange", this.handleHashChange, false);
        this.retries.forEach((retry) => {
            clearTimeout(retry);
        });
    }

    getBggService() {
        return this.props.bggServce || new BggGameService();
    }


    onNameSelect(newNames: string[]) {
        if (newNames.join(",") !== this.state.names.join(",")) {
            this.setState({
                names: newNames,
                userCollections: {}
            });
            window.location.hash = "usernames=" + newNames.join(",");
            newNames.forEach(this.fetchGames);
        }
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
                {showingCollection && <CollectionPage currentUsers={this.state.names} games={games} />}
            </span>
        );
    }
}
