"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("../config/router");
exports.default = new router_1.Route({
    method: "GET",
    handler: (req, res) => {
        res.sendStatus(200);
    },
});
