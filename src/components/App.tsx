import * as React from "react";
import "./../assets/scss/App.scss";

export interface AppProps {
}


export interface AppState {
    xmlText: string;
}


export default class App extends React.Component<AppProps, AppState> {
    constructor(superProps: Readonly<AppProps>) {
        super(superProps);
        this.state = { xmlText: undefined };
        this.fetchGames = this.fetchGames.bind(this);
    }

    componentDidMount() {
        this.fetchGames();
    }

    async fetchGames() {
        const url = "https://cors-anywhere.herokuapp.com/https://bggproxy.azurewebsites.net/collection?username=Warium&own=1";
        let gamesText = await fetch(url)
            .then((res) => res.text())
        this.setState({ xmlText: gamesText });
    }

    render() {
        const { xmlText } = this.state;
        return (
            <div className="app">
                Hello World
                <div>
                    {xmlText}
                </div>
            </div>
        );
    }
}
