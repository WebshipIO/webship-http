"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const styles_1 = require("@material-ui/styles");
const jss_1 = require("jss");
class StyleProvider extends Map {
    static get instance() {
        if (StyleProvider.sInstance === undefined) {
            jss_1.default.setup(styles_1.jssPreset());
            StyleProvider.sInstance = new Map();
        }
        return StyleProvider.sInstance;
    }
    static of(C) {
        return StyleProvider.instance.get(C).classes;
    }
    static set(C, styles) {
        return StyleProvider.instance.set(C, jss_1.default.createStyleSheet(styles).attach());
    }
}
exports.StyleProvider = StyleProvider;
function Style(styles) {
    return function (C) {
        StyleProvider.set(C, styles);
        return C;
    };
}
exports.Style = Style;

//# sourceMappingURL=index.js.map
