import * as React from "react";
import { GameInfoPlus } from "../models/GameInfo";
import { Card } from "semantic-ui-react";
import GameCardItem from "./GameCardItem";

interface Props {
    games: GameInfoPlus[];
}

export default class CollectionGrid extends React.PureComponent<Props> {
    render() {
        const { games } = this.props;
        return (
            <Card.Group centered  >
                {games.map((game) => <GameCardItem key={game.id} item={game} />)}
            </Card.Group>
        );
    }
}
