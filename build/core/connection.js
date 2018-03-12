"use strict";
/*
  Connection
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:39:05 GMT+0800 (CST)
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("websocket");
const log_1 = require("core/log");
const Util = require("core/util");
const events_1 = require("events");
const CONNECT_FAILED_EVENT = 'connectFailed';
const CONNECT_EVENT = 'connect';
const MODULE_NAME = 'CONNECTION';
const HEARTBREAT_TIMEOUT = 10 * 1000;
const log = log_1.default(MODULE_NAME);
var WSDataType;
(function (WSDataType) {
    WSDataType["UTF8"] = "utf8";
    WSDataType["BINARY"] = "binary";
})(WSDataType || (WSDataType = {}));
;
class Connection extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.client = null;
        this.connection = null;
        this.pingTimeout = null;
        this.name = 'connection';
        this.protocol = 'echo-protocol';
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const { host, protocol } = this;
            log.log(`[${this.name}] trying to connect server, host: [${host}], protocol: [${protocol}] ...`);
            if (null !== this.client) {
                this.client.abort();
                this.client = null;
            }
            this.client = new websocket_1.client();
            this.client.connect(this.host, this.protocol);
            this.client.on(CONNECT_FAILED_EVENT, this.onConnectFailed.bind(this));
            this.client.on(CONNECT_EVENT, this.onConnect.bind(this));
            return new Promise((resolve, reject) => {
                this.connectionDone = resolve;
            });
        });
    }
    send(data) {
        this.connection.send(data);
    }
    onConnectFailed(error) {
        return __awaiter(this, void 0, void 0, function* () {
            log.error(error.message);
            log.error(error.stack);
            log.warn(`[${this.name}] connection failed! waiting for reconnection!`);
            yield Util.sleep(3);
            this.connect();
        });
    }
    onConnect(connection) {
        log.log(`[${this.name}] connect success!`);
        this.connection = connection;
        connection.on('message', this.onMessage.bind(this));
        connection.on('error', this.onError.bind(this));
        connection.on('close', this.onClose.bind(this));
        this.ping();
        this.connectionDone();
    }
    onClose() {
        return __awaiter(this, void 0, void 0, function* () {
            log.log(`[${this.name}] connection closed, waiting for reconnect`);
            yield Util.sleep(3);
            this.connect();
        });
    }
    onError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            log.log(`[${this.name}] connection closed, waiting for reconnect`);
            yield Util.sleep(3);
            this.connect();
        });
    }
    onMessage(data) {
        if (WSDataType.UTF8 === data.type) {
            // log.log( `[${ this.name}] got ws data: ${data.utf8Data}` );
        }
        else if (WSDataType.BINARY === data.type) {
            log.warn(`[${this.name}] got ws binary data, ignore it!`);
            return;
        }
        const pongData = this.pong(data.utf8Data);
        if (false === pongData) {
            this.onData(data.utf8Data);
            // this.emit( ConnectionEvents.DATA, data.utf8Data );
        }
    }
    onData(data) {
    }
    pingData() {
        return '';
    }
    ping() {
        log.log('ping');
        const pingContent = this.pingData();
        this.send(pingContent);
        this.pingTimeout = setTimeout(() => {
            log.error(`[${this.name}] heart beat timeout! reconnect`);
            this.connect();
        }, HEARTBREAT_TIMEOUT);
    }
    pongData(data) {
        return false;
    }
    pong(data) {
        if (true === this.pongData(data)) {
            clearTimeout(this.pingTimeout);
            log.log('pong');
            return true;
        }
        return false;
    }
}
exports.Connection = Connection;
