import * as React from "react";
import "./../assets/scss/App.scss";
import BggGameService from "../services/BggGameService";
import { GameInfo } from "../models/GameInfo";

export interface AppProps {
}


export interface AppState {
    games: GameInfo[];
}


export default class App extends React.Component<AppProps, AppState> {

    private bggService: BggGameService;
    constructor(superProps: Readonly<AppProps>) {
        super(superProps);
        this.state = { games: [] };
        this.fetchGames = this.fetchGames.bind(this);
        this.bggService = new BggGameService(window.fetch);
    }

    componentDidMount() {
        this.fetchGames();
    }

    async fetchGames() {
        const games = await this.bggService.getUserCollection("Cyndaq");
        console.log(games);
        this.setState({ games: games });
    }

    render() {
        const { games } = this.state;
        return (
            <div className="app">
                Hello World
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
