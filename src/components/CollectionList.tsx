import * as React from "react";
import GameListItem from "./GameListItem";
import { GameInfoPlus } from "../models/GameInfo";
import { Item } from "semantic-ui-react";

interface Props {
    games: GameInfoPlus[];
}

export default class CollectionList extends React.PureComponent<Props> {
    render() {
        const { games } = this.props;
        return (
            <Item.Group>
                {games.map((game) => <GameListItem key={game.id} item={game} />)}
            </Item.Group>
        );
    }
}
