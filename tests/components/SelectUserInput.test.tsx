
import * as React from "react";
import { render, fireEvent, waitForElement } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import SelectUserInput from "../../src/components/SelectUserInput";
describe("SelectUserInput react component", () => {


    describe("Rendering names", () => {
        it(" without problems", () => {
            const { baseElement } = render(<SelectUserInput />);
            expect(baseElement).toBeDefined();
        });

        it("can take a list of current names", () => {
            const testNames: string[] = ["Warium", "Cyndaq"];
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} />);
            expect(getByTestId("Input0")).toHaveAttribute("value", "Warium");
            expect(getByTestId("Input1")).toHaveAttribute("value", "Cyndaq");
        });
        it("there should always be an empty input field on no names given", () => {
            const { getByTestId } = render(<SelectUserInput />);
            expect(getByTestId("Input0")).toBeDefined();
        });
        it("there should always be an empty input field on empty array given", () => {
            const { getByTestId } = render(<SelectUserInput bggNames={[]} />);
            expect(getByTestId("Input0")).toBeDefined();
        });
        it("shows a 'use theese names' button", () => {
            const { getByTestId } = render(<SelectUserInput />);
            expect(getByTestId("UseNames")).toBeDefined();
        });
    });

    describe("Adding names", () => {
        it("calls the 'onchange' prop on typing a name", () => {
            const testNames: string[] = ["Warium", "Cyndaq"];
            const onChangeMock = jest.fn();
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} onNameChange={onChangeMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: "Nakul" } });
            expect(onChangeMock.mock.calls.length).toBe(1);
            expect(onChangeMock.mock.calls[0][0]).toEqual(["Nakul", "Cyndaq"]);
        });


        it("can add another input by clicking the add button", () => {
            const onChangeMock = jest.fn();
            const { getByTestId } = render(<SelectUserInput bggNames={["Warium"]} onNameChange={onChangeMock} />);
            fireEvent.click(getByTestId("AddButton"));
            expect(onChangeMock.mock.calls.length).toBe(1);
            expect(onChangeMock.mock.calls[0][0]).toEqual(["Warium", ""]);
        });

        it("calls the 'onchange' prop on typing a name even when none where given", () => {
            const onChangeMock = jest.fn();
            const { getByTestId } = render(<SelectUserInput onNameChange={onChangeMock} />);
            fireEvent.change(getByTestId("Input0"), { target: { value: "Nakul" } });
            expect(onChangeMock.mock.calls.length).toBe(1);
            expect(onChangeMock.mock.calls[0][0]).toEqual(["Nakul"]);
        });
    });

    describe("Valid Names Check", () => {
        it("Renders a check to show if name is valid", () => {
            const testNames: string[] = ["Warium", "Cyndaq", "Hejej"];
            const validNames: string[] = ["Warium", "Cyndaq"];
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} validNames={validNames} />);
            expect(getByTestId("Input0Valid")).toBeDefined();
            expect(() => getByTestId("Input2Valid")).toThrow();
        });
        it("Disables 'use theese names' button when there are invalid names", () => {
            const testNames: string[] = ["Warium", "Cyndaq", "Hejej"];
            const validNames: string[] = ["Warium", "Cyndaq"];
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} validNames={validNames} />);
            expect(getByTestId("UseNames")).toHaveAttribute("disabled");
        });
        it("Disables 'use theese names' button when there are no names", () => {
            const testNames: string[] = [""];
            const validNames: string[] = ["Warium", "Cyndaq"];
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} validNames={validNames} />);
            expect(getByTestId("UseNames")).toHaveAttribute("disabled");
        });
        it("Enables 'use theese names' button when all names are valid", () => {
            const testNames: string[] = ["Warium", "Cyndaq"];
            const validNames: string[] = ["Warium", "Cyndaq"];
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} validNames={validNames} />);
            expect(getByTestId("UseNames")).not.toHaveAttribute("disabled");
        });

    });

    describe("Loading Check", () => {
        it("Renders a loop to show if name is loading", () => {
            const testNames: string[] = ["Warium", "Cyndaq", "Hejej"];
            const validNames: string[] = ["Warium", "Cyndaq"];
            const loadingNames: string[] = ["Hejej"];
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} validNames={validNames} loadingNames={loadingNames} />);
            expect(getByTestId("Input2Loading")).toBeDefined();
            expect(() => getByTestId("Input0Loading")).toThrow();
        });
    });

    describe("Removing names", () => {
        it("Shows a delete button next to names", () => {
            const testNames: string[] = ["Warium", "Cyndaq"];
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} />);
            expect(getByTestId("Input0Delete")).toBeDefined();
            expect(getByTestId("Input1Delete")).toBeDefined();
        });
        it("Shows no delete button when only one name", () => {
            const testNames: string[] = ["W"];
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} />);
            expect(() => getByTestId("Input0Delete")).toThrow();
        });

        it("Deletes when delete clicked first", () => {
            const onChangeMock = jest.fn();

            const testNames: string[] = ["Warium", "Cyndaq"];
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} onNameChange={onChangeMock} />);
            fireEvent.click(getByTestId("Input0Delete"));

            expect(onChangeMock.mock.calls.length).toBe(1);
            expect(onChangeMock.mock.calls[0][0]).toEqual(["Cyndaq"]);
        });
        it("Deletes when delete clicked middle", () => {
            const onChangeMock = jest.fn();

            const testNames: string[] = ["Warium", "Cyndaq", "Nakul"];
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} onNameChange={onChangeMock} />);
            fireEvent.click(getByTestId("Input1Delete"));

            expect(onChangeMock.mock.calls.length).toBe(1);
            expect(onChangeMock.mock.calls[0][0]).toEqual(["Warium", "Nakul"]);
        });
    });

    describe("Use Names", () => {
        it("Calls Usenames when clicking go", () => {
            const testNames: string[] = ["Warium", "Cyndaq"];
            const useNamesMock = jest.fn((names) => names);
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} validNames={testNames} onNameSelect={useNamesMock} />);
            fireEvent.click(getByTestId("UseNames"));
            expect(useNamesMock.mock.calls.length).toBe(1);
            expect(useNamesMock.mock.calls[0][0]).toEqual(testNames);
        });

        it("does not call when names are invalid", () => {
            const testNames: string[] = ["Warium", "Cyndaq"];
            const useNamesMock = jest.fn((names) => names);
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} onNameSelect={useNamesMock} />);
            fireEvent.click(getByTestId("UseNames"));
            expect(useNamesMock.mock.calls.length).toBe(0);
        });

        it("does not call when names are loading", () => {
            const testNames: string[] = ["Warium", "Cyndaq", "Nakul"];
            const useNamesMock = jest.fn((names) => names);
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} onNameSelect={useNamesMock} loadingNames={["Nakul"]} />);
            fireEvent.click(getByTestId("UseNames"));
            expect(useNamesMock.mock.calls.length).toBe(0);
        });

        it("has text for  one name", () => {
            const testNames: string[] = ["Warium"];
            const useNamesMock = jest.fn((names) => names);
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} onNameSelect={useNamesMock} />);
            expect(getByTestId("UseNames")).toContainHTML("me");
        });
        it("has different text for multiple names", () => {
            const testNames: string[] = ["Warium", "Nakul"];
            const useNamesMock = jest.fn((names) => names);
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} onNameSelect={useNamesMock} />);
            expect(getByTestId("UseNames")).toContainHTML("us");
        });

        it("trim names", () => {
            const testNames: string[] = ["Warium ", " Nakul "];
            const useNamesMock = jest.fn((names) => names);
            const { getByTestId } = render(<SelectUserInput bggNames={testNames} onNameSelect={useNamesMock} validNames={testNames} />);
            fireEvent.click(getByTestId("UseNames"));
            expect(useNamesMock.mock.calls[0][0]).toEqual(["Warium", "Nakul"]);
        });
    });




});


