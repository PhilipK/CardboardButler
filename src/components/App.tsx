import * as React from "react";
import "./../assets/scss/App.scss";
import BggGameService from "../services/BggGameService";
import { GameInfo } from "../models/GameInfo";

export interface AppProps {
}


export interface AppState {
    games: GameInfo[];
    loadingMessage: string;
}


export default class App extends React.Component<AppProps, AppState> {

    private bggService: BggGameService;
    constructor(superProps: Readonly<AppProps>) {
        super(superProps);
        this.state = { games: [], loadingMessage: "" };
        this.fetchGames = this.fetchGames.bind(this);
        this.bggService = new BggGameService(window.fetch);
    }

    componentDidMount() {
        this.fetchGames();
    }

    async fetchGames() {
        this.setState({ loadingMessage: "Fetching games"});
        const games = await this.bggService.getUserCollection("TomVasel");
        console.log(games);
        if (Array.isArray(games)) {
            this.setState({ games: games, loadingMessage: "" });
        } else if (games.retryLater) {
            if (games.error) {
                this.setState({ loadingMessage: "An error occoured, trying agian in 5 seconds" });
            } else {
                this.setState({ loadingMessage: "Bgg is working on it, trying again in 5 seconds" });
            }
            setTimeout(this.fetchGames, 5000);
        }
    }

    render() {
        const { games, loadingMessage } = this.state;
        return (
            <div className="app">
                {loadingMessage}
                <div>
                    {games.map((game) => (
                        <div key={game.name}>
                            <h3>{game.name}</h3>
                            <img src={game.thumbnailUrl}></img>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
