import * as React from "react";
import { Item, Header } from "semantic-ui-react";
import SelectUserInput from "./SelectUserInput";



interface Props {
    // can ask this if user is valid or not
    userValidator?: (name: string) => Promise<boolean>;
    onNameSelect?: (names: string[]) => any;
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
};


export default class ValidatingUserInput extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.onNamesChange = this.onNamesChange.bind(this);
        this.state = initialState;
        this.doesNameNeedValidation = this.doesNameNeedValidation.bind(this);
        this.isNameShown = this.isNameShown.bind(this);
        this.setNameLoading = this.setNameLoading.bind(this);
        this.setNameValidity = this.setNameValidity.bind(this);
    }


    private doesNameNeedValidation(name: string): boolean {
        if (name === "" || name === undefined) {
            return false;
        }
        const { validNames, invalidNames, loadingNames } = this.state;
        const { userValidator } = this.props;
        if (!userValidator) {
            return false;
        }
        return !(validNames.indexOf(name) > -1)
            && !(invalidNames.indexOf(name) > -1)
            && !(loadingNames.indexOf(name) > -1);
    }

    private isNameShown(name: string): boolean {
        return this.state.shownNames.indexOf(name) > -1;
    }

    private setNameLoading(name: string, loading: boolean) {
        if (loading) {
            this.setState({
                loadingNames: [...this.state.loadingNames, name]
            });
        } else {
            this.setState({
                loadingNames: this.state.loadingNames.filter((loadingName) => loadingName !== name)
            });
        }
    }

    private setNameValidity(name: string, isValid: boolean) {
        if (isValid) {
            this.setState({
                validNames: [...this.state.validNames, name]
            });
        } else {
            this.setState({
                invalidNames: [...this.state.invalidNames, name]
            });
        }
    }

    private onNamesChange(names: string[]) {
        const { doesNameNeedValidation, isNameShown, setNameValidity, setNameLoading } = this;
        const { userValidator } = this.props;
        this.setState({
            shownNames: names,
        });
        const namesToValidate = names.filter(doesNameNeedValidation);
        namesToValidate.forEach(async (name) => {
            setTimeout(async () => {
                // things might have changed, so check again if the name is still shown
                if (isNameShown(name) && doesNameNeedValidation(name)) {
                    setNameLoading(name, true);
                    const isValid = await userValidator(name);
                    setNameValidity(name, isValid);
                    setNameLoading(name, false);
                }
                // wait a little with calling validator, to make sure people are done typing.
            }, 300);
        });
    }

    render() {
        const { validNames, shownNames, loadingNames } = this.state;
        const { onNameSelect } = this.props;
        return (
            <div>
                <Header as="h4" style={{ marginTop: "2em" }}>
                    Hi {shownNames.length <= 1 ? "my name is" : "our names are"}
                </Header>
                <SelectUserInput
                    bggNames={shownNames}
                    validNames={validNames}
                    onNameChange={this.onNamesChange}
                    loadingNames={loadingNames}
                    onNameSelect={onNameSelect}
                />
            </div >
        );
    }
}
