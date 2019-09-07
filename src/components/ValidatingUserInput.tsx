import * as React from "react";
import { Item } from "semantic-ui-react";
import SelectUserInput from "./SelectUserInput";



interface Props {
    //can ask this if user is valid or not
    userValidator?: (name: string) => Promise<boolean>
}

interface State {
    shownNames: string[];
    validNames: string[];
    invalidNames: string[];
    loadingNames: string[];

}


const initialState: State = {
    shownNames: [],
    validNames: [],
    invalidNames: [],
    loadingNames: [],
}


export default class ValidatingUserInput extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.onNamesChange = this.onNamesChange.bind(this);
        this.state = initialState;
    }

    onNamesChange(names: string[]) {
        const validate = this.props.userValidator;
        const knownNames = [...this.state.validNames, ...this.state.invalidNames];
        const namesToValidate = names.filter((name) => knownNames.indexOf(name) === -1);
        this.setState({
            shownNames: names,
            loadingNames: namesToValidate
        });
        if (namesToValidate) {
            namesToValidate.forEach(async (name) => {
                const isValid = await validate(name);
                const newLoading = [...this.state.loadingNames].filter((loadingName) => loadingName !== name)
                if (isValid) {
                    this.setState({
                        validNames: [...this.state.validNames, name],
                        loadingNames: newLoading
                    })
                } else {
                    this.setState({
                        invalidNames: [...this.state.invalidNames, name],
                        loadingNames: newLoading
                    })
                }
            });
        };
    }

    render() {
        const { validNames, shownNames, loadingNames } = this.state;
        return <SelectUserInput bggNames={shownNames} validNames={validNames} onNameChange={this.onNamesChange} loadingNames={loadingNames} />
    }
}
