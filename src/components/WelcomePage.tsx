

import * as React from "react";
import ValidatingUserInput from "./ValidatingUserInput";
import { Item, Image, Header, Button } from "semantic-ui-react";

interface Props {
    onNameSelect: (names: string[]) => any;
    userValidator: (name: string) => Promise<boolean>;
}


export default class WelcomePage extends React.PureComponent<Props> {

    render() {
        return (

            <div className="ui middle aligned center aligned grid givenames" data-testid="WelcomePage">
                <div className="column">
                    <div>
                        <Image src="butler.png" />
                        <Header as="h3">
                            <span>Good day, how can I help you today?</span>
                        </Header>
                    </div>
                    <div className="ui large form" >
                        <div className="ui">
                            <ValidatingUserInput
                                userValidator={this.props.userValidator}
                                onNameSelect={this.props.onNameSelect}
                            />
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}
