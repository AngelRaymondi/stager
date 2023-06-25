"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const cli_color_1 = __importDefault(require("cli-color"));
const index_1 = require("./index");
(async () => {
    console.clear();
    const host = new index_1.Backdoor();
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    host.on("response", (res) => {
        if (res.error) {
            process.stdout.write(cli_color_1.default.red(res.response));
        }
        else {
            process.stdout.write(res.response);
        }
    });
    await host.connect("[::1]", 8063);
    rl.setPrompt("");
    rl.prompt();
    rl.on("line", (input) => {
        host.emit(input);
    });
})();
