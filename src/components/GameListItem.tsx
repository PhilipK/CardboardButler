import * as React from "react";
import { GameInfoPlus } from "../models/GameInfo";
import { Item } from "semantic-ui-react";
import DescriptionGenerator from "../services/GameDescriptionGenerator";

type Size = "mini" | "tiny" | "small" | "medium" | "large" | "big" | "huge" | "massive";

export interface AppProps {
    item: GameInfoPlus;
    size?: Size;

}

const gameDescription = new DescriptionGenerator();

/**
 * PureComponent that renders  a given GameInfo item into a list like view.
 */
export default class GameListItem extends React.PureComponent<AppProps> {

    render() {
        const { item, size } = this.props;
        const { owners = [] } = item;
        return (
            <Item >
                <Item.Image size={size}><img data-testid="GameImage" src={item.imageUrl} /></Item.Image>
                <Item.Content verticalAlign={"middle"}>
                    <Item.Header data-testid="GameName" href={"https://boardgamegeek.com/boardgame/" + item.id} as="a" size={size} target="_blank">{item.name}</Item.Header>
                    <Item.Meta data-testid="GameYear">
                        <span>{item.yearPublished}</span>
                        {item.owners && <span data-testid="Owners"> - <span>{owners.join(", ")}</span></span>}
                    </Item.Meta >
                    <Item.Description data-testid="GameDescription">
                        {gameDescription.generateDescription(item)}
                    </Item.Description>
                    {/* {("mechanics" in item) && <Item.Extra>{item.mechanics.join(", ")}</Item.Extra>} */}
                    {("categories" in item) && <Item.Extra>{item.categories.join(", ")}</Item.Extra>}
                </Item.Content>
            </Item>
        );
    }
}
