const StyleDictionary = require('style-dictionary');
const path = require('path');

// Define the Style Dictionary configuration
StyleDictionary.registerFormat({
  name: 'custom/css',
  formatter(dictionary) {
    console.log(dictionary); // Log the dictionary object to check its properties
    let css = '';

    // Generate CSS content from the tokens
    css += `:root {\n`;
    Object.keys(dictionary.properties).forEach((key) => {
      const value = dictionary.properties[key];
      css += `  --${key}: ${value};\n`;
    });
    css += `}\n\n`;

    // Generate light theme CSS
    css += `[data-theme="light"] {\n`;
    css += `  /* Light theme styles */\n`;
    css += `}\n\n`;

    // Generate dark theme CSS
    css += `[data-theme="dark"] {\n`;
    css += `  /* Dark theme styles */\n`;
    css += `}\n`;

    return css;
  },
});

// Define the source JSON file
StyleDictionary.extend({
  source: [path.join(__dirname, '../json/fds-tokens-structure.json')],
});

// Define the platforms object
const platforms = {
  css: {
    transformGroup: 'css',
    buildPath: 'build/css',
    files: [
      {
        destination: 'fds-tokens-color.css',
        format: 'custom/css',
        options: {
          outputReferences: true,
        },
      },
    ],
  },
};

// Build the Style Dictionary for all platforms
StyleDictionary.buildAllPlatforms({ platforms });