import * as React from "react";
import { Input, Icon } from "semantic-ui-react";

interface AppProps {
    bggNames?: string[];
    onNameChange?: (newNames: string[]) => any;
    validNames?: string[];
    loadingNames?: string[];
    onNameSelect?: (names: string[]) => any;
}


/**
 * PureComponent that renders  a given GameInfo item into a list like view.
 */
export default class SelectUserInput extends React.PureComponent<AppProps> {

    constructor(props: AppProps) {
        super(props);
        this.onInputChange = this.onInputChange.bind(this);
        this.getNamesToShow = this.getNamesToShow.bind(this);
        this.onAddClick = this.onAddClick.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);
        this.onUseClick = this.onUseClick.bind(this);
    }

    onInputChange(value: string, index: number) {
        if (this.props.onNameChange) {
            const bggNames = this.props.bggNames || [];
            const clone = [...bggNames];
            clone[index] = value;
            this.props.onNameChange(clone);
        }
    }

    onAddClick() {
        if (this.props.onNameChange) {
            const newNamesToShow = this.getNamesToShow().concat([""]);
            this.props.onNameChange(newNamesToShow);
        }
    }

    onDeleteClick(index: number) {
        if (this.props.onNameChange && this.props.bggNames) {
            const clone = [...this.props.bggNames];
            clone.splice(index, 1);
            this.props.onNameChange(clone);
        }
    }

    getNamesToShow() {
        const { bggNames } = this.props;
        const namesToShow = (bggNames === undefined || bggNames.length === 0) ? [""] : [...bggNames];
        return namesToShow;

    }

    onUseClick() {
        const { onNameSelect } = this.props;
        if (onNameSelect) {
            onNameSelect(this.props.bggNames);
        }
    }

    render() {
        const namesToShow = this.getNamesToShow();
        const showDelete = namesToShow.length > 1;
        const { validNames = [], loadingNames = [] } = this.props;
        const hasEnoughNames = namesToShow.length > 0 && namesToShow[0] !== "";
        const forwardButtonText = `Can you help ${namesToShow.length === 1 ? "me" : "us"} find a game to play?`;
        const canUseNames = hasEnoughNames && namesToShow.every((name) => validNames.indexOf(name) > -1);
        return (
            <div >
                {
                    namesToShow.map((name, i) => {
                        const isValid = validNames.indexOf(name) > -1;
                        const isLoading = loadingNames.indexOf(name) > -1;
                        const isLast = i === namesToShow.length - 1;
                        const inputName = "Input" + i;
                        const isValidLabel = isValid ? { icon: "check", "data-testid": inputName + "Valid" } : null;
                        const removeButton = showDelete ? (
                            <Icon
                                data-testid={inputName + "Delete"}
                                style={{ cursor: "pointer" }}
                                name="remove"
                                className="link"
                                onClick={() => this.onDeleteClick(i)}
                            />) : null;

                        return <div key={inputName} className="field">
                            <Input
                                labelPosition="left corner"
                                placeholder="BGG Username"
                                label={isValidLabel}
                                input={{
                                    "data-testid": inputName
                                }
                                }
                                icon={removeButton}
                                loading={isLoading}
                                value={name}
                                data-testid={isLoading ? inputName + "Loading" : null}
                                type="text"
                                autoFocus={isLast}
                                onChange={(e) => this.onInputChange(e.target.value, i)} />
                        </div>;
                    }
                    )
                }
                <div className="field">
                    <button data-testid="AddButton" onClick={(e) => this.onAddClick()} className="ui basic button tiny">
                        <i className="icon plus"></i>
                        Add a friend
                </button>
                </div>
                <div className="field">
                    <button data-testid="UseNames"
                        disabled={!canUseNames}
                        onClick={this.onUseClick} className="ui basic button large">
                        {forwardButtonText}
                    </button>
                </div>
            </div >
        );
    }
}
