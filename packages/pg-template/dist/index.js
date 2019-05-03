"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const PostgresFormat = require("pg-format");
class Repository {
    constructor(pool) {
        this.pool = pool;
    }
}
exports.Repository = Repository;
class SQLTemplateContainer extends Map {
    static get instance() {
        if (SQLTemplateContainer.sInstance === undefined) {
            SQLTemplateContainer.sInstance = new SQLTemplateContainer();
        }
        return SQLTemplateContainer.sInstance;
    }
    transform() {
        for (let [classType, map] of super.entries()) {
            for (let [key, value] of map.entries()) {
                switch (value.type) {
                    case 'query':
                        if (typeof value.sql === 'string') {
                            var f = Reflect.get(classType.prototype, key);
                            Reflect.defineProperty(classType.prototype, key, {
                                value: function (...args) {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        let result = yield this.pool.query(PostgresFormat.withArray(value.sql, args));
                                        return typeof value.filter === 'function' ? value.filter(result) : result;
                                    });
                                }
                            });
                        }
                        break;
                    case 'transcation':
                        if (typeof value.sql === 'string') {
                            var f = Reflect.get(classType.prototype, key);
                            Reflect.defineProperty(classType.prototype, key, {
                                value: function (...args) {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        let connection = yield this.pool.connect();
                                        let result = [];
                                        let sqls = PostgresFormat.withArray(value.sql, args).split(';').filter(x => x.trim().length > 0);
                                        try {
                                            yield connection.query('BEGIN');
                                            for (let s of sqls) {
                                                let a = yield connection.query(s);
                                                result.push(a);
                                            }
                                            yield connection.query('COMMIT');
                                        }
                                        catch (e) {
                                            yield connection.query('ROLLBACK');
                                            throw e;
                                        }
                                        finally {
                                            connection.release();
                                        }
                                        return typeof value.filter === 'function' ? value.filter(result) : result;
                                    });
                                }
                            });
                        }
                        break;
                }
            }
        }
    }
}
exports.SQLTemplateContainer = SQLTemplateContainer;
function Query(sql) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!SQLTemplateContainer.instance.has(classType)) {
            SQLTemplateContainer.instance.set(classType, new Map());
        }
        if (!SQLTemplateContainer.instance.get(classType).has(propertyKey)) {
            SQLTemplateContainer.instance.get(classType).set(propertyKey, {
                type: 'query',
                sql: sql
            });
        }
        else {
            SQLTemplateContainer.instance.get(classType).get(propertyKey).sql = sql;
        }
    };
}
exports.Query = Query;
function QueryFilter(filter) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!SQLTemplateContainer.instance.has(classType)) {
            SQLTemplateContainer.instance.set(classType, new Map());
        }
        if (!SQLTemplateContainer.instance.get(classType).has(propertyKey)) {
            SQLTemplateContainer.instance.get(classType).set(propertyKey, {
                type: 'query',
                filter: filter
            });
        }
        else {
            SQLTemplateContainer.instance.get(classType).get(propertyKey).filter = filter;
        }
    };
}
exports.QueryFilter = QueryFilter;
function Transaction(sql) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!SQLTemplateContainer.instance.has(classType)) {
            SQLTemplateContainer.instance.set(classType, new Map());
        }
        if (!SQLTemplateContainer.instance.get(classType).has(propertyKey)) {
            SQLTemplateContainer.instance.get(classType).set(propertyKey, {
                type: 'transcation',
                sql: sql
            });
        }
        else {
            SQLTemplateContainer.instance.get(classType).get(propertyKey).sql = sql;
        }
    };
}
exports.Transaction = Transaction;
function TransactionFilter(filter) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!SQLTemplateContainer.instance.has(classType)) {
            SQLTemplateContainer.instance.set(classType, new Map());
        }
        if (!SQLTemplateContainer.instance.get(classType).has(propertyKey)) {
            SQLTemplateContainer.instance.get(classType).set(propertyKey, {
                type: 'transcation',
                filter: filter
            });
        }
        else {
            SQLTemplateContainer.instance.get(classType).get(propertyKey).filter = filter;
        }
    };
}
exports.TransactionFilter = TransactionFilter;

//# sourceMappingURL=index.js.map
