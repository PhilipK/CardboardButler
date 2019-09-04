import * as React from "react";
import { GameInfo } from "../models/GameInfo";

export interface AppProps {
    item: GameInfo;
}


export default class GameListItem extends React.PureComponent<AppProps> {
    render() {
        const { item } = this.props;
        return (
            <div className="app">
                <h1>{item.name}</h1>
            </div>
        );
    }
