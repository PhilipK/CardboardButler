import * as React from "react";
import "./../assets/scss/App.scss";
import BggGameService from "../services/BggGameService";
import { GameInfo } from "../models/GameInfo";
import GameListItem from "./GameListItem";
import SelectUserInput from "./SelectUserInput";



import { Item, Container } from "semantic-ui-react";
import ValidatingUserInput from "./ValidatingUserInput";
import { CollectionMerger } from "../services/CollectionMerger";

export interface AppProps {
}


export interface AppState {
    games: GameInfo[];
    userCollections: { [names: string]: GameInfo[] };
    loadingMessage: string;
    names: string[];
}


export default class App extends React.Component<AppProps, AppState> {

    private bggService: BggGameService;
    private collectionMerger: CollectionMerger;
    constructor(superProps: Readonly<AppProps>) {
        super(superProps);
        this.state = { games: [], loadingMessage: "", names: [], userCollections: {} };
        this.bggService = new BggGameService(window.fetch);
        this.collectionMerger = new CollectionMerger();

        this.fetchGames = this.fetchGames.bind(this);
        this.onNameSelect = this.onNameSelect.bind(this);
        this.userValidator = this.userValidator.bind(this);

    }


    async fetchGames(name: string) {
        this.setState({ loadingMessage: "Fetching games", games: [] });
        const games = await this.bggService.getUserCollection(name);
        if (Array.isArray(games)) {
            const collection = this.state.userCollections;
            collection[name] = games;
            const allGames = this.collectionMerger.getMergedCollection(collection);
            this.setState({ games: allGames, userCollections: collection, loadingMessage: "" });
        } else if (games.retryLater) {
            if (games.error) {
                this.setState({ loadingMessage: "An error occoured, trying agian in 5 seconds" });
            } else {
                this.setState({ loadingMessage: "Bgg is working on it, trying again in 5 seconds" });
            }
            setTimeout(() => this.fetchGames(name), 5000);
        }
    }

    onNameSelect(newNames: string[]) {
        this.setState({
            names: newNames,
            userCollections: {}
        });
        newNames.forEach(this.fetchGames);
    }

    async userValidator(name: string) {
        const res = await this.bggService.getUserInfo(name);
        return res.isValid === true;
    }

    render() {
        const { games, loadingMessage } = this.state;
        return (
            <div className="app">
                <ValidatingUserInput userValidator={this.userValidator} onNameSelect={this.onNameSelect} />
                {loadingMessage}
                <Container fluid className="collections">
                    <div>
                        <Container text className="main" >
                            <Item.Group>
                                {games.map((game) => <GameListItem item={game} />)}
                            </Item.Group>
                        </Container>
                    </div>
                </Container>
            </div>
        );
    }
}
