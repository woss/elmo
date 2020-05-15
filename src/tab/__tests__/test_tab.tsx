import React from "react";
import Tab from "../tab";
import renderer, { ReactTestRendererJSON } from "react-test-renderer";

it("tab renders", () => {
    const tree: ReactTestRendererJSON | null = renderer
        .create(<Tab />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
