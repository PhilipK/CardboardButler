import * as React from "react";
import { GameInfo } from "../models/GameInfo";
import { Item } from "semantic-ui-react";

export interface AppProps {
    item: GameInfo;
}

/**
 * PureComponent that renders  a given GameInfo item into a list like view.
 */
export default class GameListItem extends React.PureComponent<AppProps> {
    render() {
        const { item } = this.props;
        return (
            <Item >
                {/* <Item.Image size={large ? 'large' : 'small'} >{image}</Item.Image> */}
                <Item.Content verticalAlign={"middle"}>
                    <Item.Header as="a" size={"medium"} target="_blank">{item.name}</Item.Header>
                    {/* <Item.Meta>{game.get("yearpublished") + " - " + game.get("owners").join(', ')}</Item.Meta> */}
                    {/* {hasLastTimePlayed && <Item.Meta> Last played {timeSince(game.get("lastTimePlayed"))}</Item.Meta>} */}
                    {/* {hasTimePlayed && <Item.Meta> Time played {timePlayed(game.get("lengthPlayed"))}</Item.Meta>} */}
                    <Item.Description>
                        {/* {generateDescription(game)} */}
                    </Item.Description>
                    {/* <Item.Extra>{game.get("mechanics").map(mec => mec.get("value")).join(", ")}</Item.Extra> */}
                </Item.Content>
            </Item>
        );
    }
}
