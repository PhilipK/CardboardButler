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
        this.doesNameNeedValidation = this.doesNameNeedValidation.bind(this);
        this.isNameShown = this.isNameShown.bind(this);
    }


    doesNameNeedValidation(name: string): boolean {
        const { validNames, invalidNames, loadingNames } = this.state;
        const { userValidator } = this.props;
        if (!userValidator) {
            return false;
        }
        return !(validNames.indexOf(name) > -1)
            && !(invalidNames.indexOf(name) > -1)
            && !(loadingNames.indexOf(name) > -1);
    }

    isNameShown(name: string): boolean {
        return this.state.shownNames.indexOf(name) > -1;
    }

    onNamesChange(names: string[]) {
        this.setState({
            shownNames: names,
        });
        const needValidate = this.doesNameNeedValidation;
        const namesToValidate = names.filter(needValidate);
        namesToValidate.forEach(async (name) => {
            setTimeout(async () => {
                //things might have changed, so check again if the name is still shown
                if (this.isNameShown(name) && needValidate(name)) {
                    const { userValidator } = this.props;
                    const loadingNow = this.state.loadingNames;
                    this.setState({
                        loadingNames: [...loadingNow, name]
                    })
                    const isValid = await userValidator(name);
                    const loadingWithoutName = this.state.loadingNames.filter((loadingName) => loadingName !== name)
                    if (isValid) {
                        this.setState({
                            validNames: [...this.state.validNames, name],
                            loadingNames: loadingWithoutName
                        })
                    } else {
                        this.setState({
                            invalidNames: [...this.state.invalidNames, name],
                            loadingNames: loadingWithoutName
                        })
                    }
                }
                //wait a little with calling validator, to make sure people are done typing.
            }, 200);
        });
    }

    render() {
        const { validNames, shownNames, loadingNames } = this.state;
        return <SelectUserInput bggNames={shownNames} validNames={validNames} onNameChange={this.onNamesChange} loadingNames={loadingNames} />
    }
}
