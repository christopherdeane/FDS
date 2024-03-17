import StyleDictionary from "style-dictionary";

const config = {
    source: ["tokens/**/*.token.json"],
    platforms: {
        css: {
            buildPath: "dist/css/",
            transformGroup: "css",
            files: [
                {
                    format: "css/styles",
                    destination: "styles.css",
                },
            ],
        },
    },
};

// Helper function to resolve nested color references
const resolveColorReference = (dictionary, value) => {
    if (!value.startsWith("{") || !value.endsWith("}")) {
        return value;
    }

    const path = value.slice(1, -1).split(".");
    let colorToken = dictionary.allProperties.find(
        (prop) => prop.path.join(".") === path.join(".")
    );

    while (colorToken && colorToken.value.startsWith("{")) {
        const nestedPath = colorToken.value.slice(1, -1).split(".");
        colorToken = dictionary.allProperties.find(
            (prop) => prop.path.join(".") === nestedPath.join(".")
        );
    }

    return colorToken ? colorToken.value : value;
};

// Register custom format for color variables and theme styles
StyleDictionary.registerFormat({
    name: "css/styles",
    formatter: function (dictionary) {
        const getColorValue = (value) => {
            const isReference = value.startsWith("{") && value.endsWith("}");
            const path = isReference ? value.slice(1, -1) : value;
            const colorToken = dictionary.allProperties.find(
                (prop) => prop.path.join(".") === path
            );
            return colorToken ? colorToken.value : value;
        };

        // const colorVariables = dictionary.allProperties
        //     .filter((prop) => prop.attributes.category === "Color" && prop.attributes.type === "color")
        //     .map((prop) => ` --fds-color-${prop.path.slice(1).join("-").toLowerCase()}: ${prop.value};`)
        //     .join("\n");

        const rootValueStore = []
        const rootPathStore = []
        const rootVariables = dictionary.allProperties
            .filter(prop => prop.path.length === 3 && prop.path[0] === 'Color')
            .map(prop => {
                rootValueStore.push(prop.value)
                rootPathStore.push((prop.path.slice(1).join("-").toLowerCase()).replace(" ", "-"))
                return ` --fds-color-${(prop.path.slice(1).join("-").toLowerCase()).replace(" ", "-")}: ${prop.value};`
            })
            .join('\n');


        const lightTheme = dictionary.allProperties
            .filter((prop) => prop.path[0] === "Light")
            .map((prop) => {
                const propValue = resolveColorReference(dictionary, prop.value);
                const filteredPropValue = rootPathStore.filter((item, i) => {
                    if (rootValueStore[i] === propValue) {
                        return item
                    }
                })
                return ` --fds-color-${(prop.path.slice(1).join("-").toLowerCase()).replace(" ", "-")}: var(--fds-color-${filteredPropValue[0]});`;
            })
            .join("\n");

        const darkTheme = dictionary.allProperties
            .filter((prop) => prop.path[0] === "Dark")
            .map((prop) => {
                const propValue = resolveColorReference(dictionary, prop.value);
                const filteredPropValue = rootPathStore.filter((item, i) => {
                    if (rootValueStore[i] === propValue) {
                        return item
                    }
                })
                return ` --fds-color-${(prop.path.slice(1).join("-").toLowerCase()).replace(" ", "-")}: var(--fds-color-${filteredPropValue[0]});`;
            })
            .join("\n");

        return `:root {\n${rootVariables}\n}\n\n[data-theme="light"] {\n${lightTheme}\n}\n\n[data-theme="dark"] {\n${darkTheme}\n}`;
    },
});

const sd = StyleDictionary.extend(config);
sd.buildAllPlatforms();
