"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const CreateRouter = ({ routesDir, indexFilename = (file) => ["index.ts", "index.js"].includes(file), }) => {
    const Router = express_1.default.Router();
    if (fs_1.default.existsSync(path_1.default.join(require.main.path, routesDir))) {
        const strobkeys = (object, filter) => {
            const a = [];
            const find = (object, sub_r = "") => {
                Object.keys(object).forEach((o) => {
                    if (filter(object[o])) {
                        //If it's a directory
                        find(object[o], path_1.default.join(sub_r, o));
                    }
                    else {
                        a.push(path_1.default.join(sub_r, o));
                    }
                });
            };
            find(object);
            return a;
        };
        const deepfiles = {
            search: (dirname, filter = () => true) => {
                const Files = fs_1.default.readdirSync(dirname);
                const lookUp = (files, sub_r = "") => {
                    const result = [];
                    files.forEach((file) => {
                        const File = fs_1.default.statSync(path_1.default.join(dirname, sub_r, file));
                        const file_type = File.isFile() ? "file" : "folder";
                        const file_data = {
                            name: file,
                            type: File.isFile() ? "file" : "folder",
                        };
                        if (filter(file) || file_type === "folder") {
                            result.push(file_data);
                        }
                        if (file_type === "folder") {
                            result[result.indexOf(file_data)].childs = lookUp(fs_1.default.readdirSync(path_1.default.join(dirname, sub_r, file)), path_1.default.join(sub_r, file));
                        }
                        else if (!filter(file))
                            return;
                    });
                    return result;
                };
                return {
                    name: dirname,
                    type: "folder",
                    childs: lookUp(Files),
                };
            },
            simple: (dirname, filter = () => true) => {
                const Files = fs_1.default.readdirSync(dirname);
                const lookUp = (files, sub_r = "") => {
                    const result = {};
                    files.forEach((file) => {
                        const File = fs_1.default.statSync(path_1.default.join(dirname, sub_r, file));
                        const file_type = File.isFile() ? "file" : "folder";
                        if (filter(file) || file_type === "folder") {
                            result[file] = { file_type };
                        }
                        if (file_type === "folder") {
                            result[file] = lookUp(fs_1.default.readdirSync(path_1.default.join(dirname, sub_r, file)), path_1.default.join(sub_r, file));
                        }
                    });
                    return result;
                };
                return lookUp(Files);
            },
            string: (dirname, filter = () => true) => {
                const Files = fs_1.default.readdirSync(dirname);
                const lookUp = (files, sub_r = "") => {
                    const result = {};
                    files.forEach((file) => {
                        const File = fs_1.default.statSync(path_1.default.join(dirname, sub_r, file));
                        const file_type = File.isFile() ? "file" : "folder";
                        if (filter(file) || file_type === "folder") {
                            result[file] = { file_type };
                        }
                        if (file_type === "folder") {
                            result[file] = lookUp(fs_1.default.readdirSync(path_1.default.join(dirname, sub_r, file)), path_1.default.join(sub_r, file));
                        }
                    });
                    return result;
                };
                return strobkeys(lookUp(Files), (o) => !o.file_type);
            },
        };
        deepfiles
            .string(path_1.default.join(require.main.path, routesDir), (o) => !o.type)
            .forEach((r) => {
            let { default: data } = require(path_1.default.join(require.main.path, routesDir, r));
            if (Array.isArray(data)) {
                data.forEach((data) => {
                    let route = `${(indexFilename(r)
                        ? "/"
                        : `/${r.slice(0, -3)}`).replaceAll("\\", "/")}${data.params ? "/" + data.params : ""}`;
                    if (data.route)
                        route = data.route;
                    if (!data)
                        return;
                    if (!data.method || !data.handler)
                        return;
                    Router[data.method.toLowerCase()](route, data.handler);
                });
            }
            else {
                let route = `${(indexFilename(r)
                    ? "/"
                    : `/${r.slice(0, -3)}`).replaceAll("\\", "/")}${data.params ? "/" + data.params : ""}`;
                if (data.route)
                    route = data.route;
                if (!data)
                    return;
                if (!data.method || !data.handler)
                    return;
                Router[data.method.toLowerCase()](route, data.handler);
            }
        });
    }
    return Router;
};
class Route {
    method;
    handler;
    route;
    params;
    constructor({ method, handler, route, params }) {
        this.method = method;
        this.handler = handler;
        this.route = route;
        this.params = params;
    }
}
exports.Route = Route;
exports.default = CreateRouter;
