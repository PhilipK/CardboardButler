

import * as React from "react";
import ValidatingUserInput from "./ValidatingUserInput";
import { Image, Header, Message } from "semantic-ui-react";

interface Props {
    onNameSelect: (names: string[]) => any;
    userValidator: (name: string) => Promise<boolean>;
    showWarning?: boolean;
}


export default class WelcomePage extends React.PureComponent<Props> {

    render() {
        const { userValidator, onNameSelect, showWarning } = this.props;
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
                                userValidator={userValidator}
                                onNameSelect={onNameSelect}
                            />
                        </div>
                    </div>
                    {showWarning && <Message>
                        <Message.Header>BGG is taking a breather</Message.Header>
                        <p>
                            Boardgame Geek has a limit on how many requests I can make.
                            Unfortunatly the limit has been hit for a while, so try agian in a couple of minutes (or 10).
    </p>
                    </Message>}
                </div>

            </div>
        );
    }
}
