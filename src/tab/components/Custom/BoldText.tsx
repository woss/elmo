import React from "react";

function BoldText({ children }) {
    return <span style={{ fontWeight: "bold" }}>{...children}</span>;
}

export default BoldText;
