const TEST_DB = {
    links: [
        {
            title: "first link",
            url: "https://sensio.group",
        },
        {
            title: "photo link",
            url: "https://sensio.photo",
        },
        {
            title: "network link",
            url: "https://sensio.group/sensio-network",
        },
        {
            title: "sensio link",
            url: "https://sensio.group/sensio-photo",
        },
        {
            title: "first link",
            url: "https://sensio.group",
        },
        {
            title: "photo link",
            url: "https://sensio.photo",
        },
        {
            title: "network link",
            url: "https://sensio.group/sensio-network",
        },
        {
            title: "sensio link",
            url: "https://sensio.group/sensio-photo",
        },
        {
            title: "first link",
            url: "https://sensio.group",
        },
        {
            title: "photo link",
            url: "https://sensio.photo",
        },
        {
            title: "network link",
            url: "https://sensio.group/sensio-network",
        },
        {
            title: "sensio link",
            url: "https://sensio.group/sensio-photo",
        },
        {
            title: "first link",
            url: "https://sensio.group",
        },
        {
            title: "photo link",
            url: "https://sensio.photo",
        },
        {
            title: "network link",
            url: "https://sensio.group/sensio-network",
        },
        {
            title: "sensio link",
            url: "https://sensio.group/sensio-photo",
        },
        {
            title: "first link",
            url: "https://sensio.group",
        },
        {
            title: "photo link",
            url: "https://sensio.photo",
        },
        {
            title: "network link",
            url: "https://sensio.group/sensio-network",
        },
        {
            title: "sensio link",
            url: "https://sensio.group/sensio-photo",
        },
    ],
    collections: [
        {
            title: "main collection #1",
            links: [2, 4, 9, 8, 7, 6, 5, 4],
            sharedWith: [
                {
                    email: "daniel@woss.io",
                    permissions: ["r", "w"],
                },
                {
                    email: "elena@7signals.xyz",
                    permissions: ["r"],
                },
            ],
            workspaceIndexes: [0],
        },
        {
            title: "Sensio collection",
            links: [1, 3, 4, 7, 9, 12],
            workspaceIndexes: [1],
        },
        {
            title: "main collection #2",
            links: [2, 4, 1, 10, 3, 7],
            sharedWith: [
                {
                    email: "daniel@woss.io",
                    permissions: ["r", "w"],
                },
                {
                    email: "elena@7signals.xyz",
                    permissions: ["r"],
                },
            ],
            workspaceIndexes: [0, 1],
        },
    ],
    workspaces: [
        {
            name: "Personal",
            private: true,
            sharedWith: [],
        },
        {
            name: "Sensio",
            private: true,
            sharedWith: [
                {
                    email: "elena@7signals.xyz",
                    permissions: ["r"],
                },
            ],
        },
    ],
};
export default TEST_DB;
