import config from "../config";
import mysql from "mysql";

export function setUpMysql() {
    var con = mysql.createConnection({
        host: config.sql.host,
        user: config.sql.user,
        port: config.sql.port,
        password: config.sql.password,
        database: config.sql.database,
    } as any);

    con.connect();

    con.on('error', error => console.warn("error"));

    return con as mysql.Connection;
}

export function query(sql: string | mysql.QueryOptions, values?: any): Promise<Array<any>> {
    let con = setUpMysql();
    return new Promise((resolve, reject) => {
        con.query(sql as string, values, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

export function close(): Promise<void> {
    let con = setUpMysql();
    return new Promise((resolve, reject) => {
        con.end(err => {
            if (err)
                return reject(err);
            resolve();
        });
    });
}