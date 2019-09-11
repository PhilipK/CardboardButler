

import * as React from "react";
import ValidatingUserInput from "./ValidatingUserInput";


interface Props {
    onNameSelect: (names: string[]) => any;
    userValidator: (name: string) => Promise<boolean>;
}

export default class FrontPage extends React.PureComponent<Props> {
    render() {
        return (
            <div data-testid="FrontPage">
                <ValidatingUserInput
                    userValidator={this.props.userValidator}
                    onNameSelect={this.props.onNameSelect}
                />
            </div>
        );
    }
}
