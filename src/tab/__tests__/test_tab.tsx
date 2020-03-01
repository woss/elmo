import * as React from "react";
import Tab from "../component";
import renderer, { ReactTestRendererJSON } from "react-test-renderer";

it("component renders", () => {
    const tree: ReactTestRendererJSON | null = renderer
        .create(<Tab />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
