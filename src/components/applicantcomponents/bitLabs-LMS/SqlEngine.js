/**
 * SqlEngine.js
 *
 * In-browser SQL execution engine powered by sql.js (SQLite compiled to WASM).
 * Maintains a persistent database per session so students can CREATE a table
 * in one assignment and INSERT into it in another.
 *
 * Usage:
 *   const engine = SqlEngine.getInstance();
 *   await engine.init();                // loads WASM once
 *   const result = engine.execute(sql); // returns structured result
 *   engine.reset();                     // wipe database
 */

import initSqlJs from 'sql.js';

// CDN for the sql.js WASM binary — avoids bundling a 1 MB file
const SQL_WASM_URL = 'https://sql.js.org/dist/sql-wasm.wasm';

class SqlEngine {
    // ── Singleton ──────────────────────────────────────────────
    static _instance = null;

    static getInstance() {
        if (!SqlEngine._instance) {
            SqlEngine._instance = new SqlEngine();
        }
        return SqlEngine._instance;
    }

    constructor() {
        this._SQL = null;      // sql.js module
        this._db = null;       // Database instance
        this._ready = false;
        this._loading = false;
        this._initPromise = null;
    }

    // ── Lifecycle ──────────────────────────────────────────────

    /** Initialise the WASM runtime and create a fresh database (idempotent). */
    async init() {
        if (this._ready && this._db) return;
        if (this._initPromise) return this._initPromise;

        this._loading = true;
        this._initPromise = (async () => {
            try {
                console.log('[SqlEngine] Loading sql.js WASM…');
                this._SQL = await initSqlJs({
                    locateFile: () => SQL_WASM_URL,
                });
                this._db = new this._SQL.Database();
                this._ready = true;
                console.log('[SqlEngine] Ready.');
            } catch (err) {
                console.error('[SqlEngine] Init failed:', err);
                throw err;
            } finally {
                this._loading = false;
            }
        })();

        return this._initPromise;
    }

    get isReady() {
        return this._ready && !!this._db;
    }

    get isLoading() {
        return this._loading;
    }

    /** Drop everything and create a brand-new in-memory database. */
    reset() {
        if (this._db) {
            try { this._db.close(); } catch (_) { /* ignore */ }
        }
        if (this._SQL) {
            this._db = new this._SQL.Database();
        }
        console.log('[SqlEngine] Database reset.');
    }

    // ── Execution ─────────────────────────────────────────────

    /**
     * Execute one or more SQL statements.
     *
     * @param {string} sql — raw SQL text from the student
     * @returns {{
     *   success: boolean,
     *   statements: Array<{
     *     sql: string,
     *     type: string,            // 'SELECT' | 'INSERT' | 'CREATE' | …
     *     columns: string[],       // column headers (SELECT only)
     *     rows: Array<any[]>,      // result rows   (SELECT only)
     *     rowsAffected: number,
     *     message: string          // human-readable summary
     *   }>,
     *   error: string|null,
     *   summary: string            // one-line overall summary
     * }}
     */
    execute(sql) {
        if (!this._ready || !this._db) {
            return {
                success: false,
                statements: [],
                error: 'SQL engine is not initialised. Please wait for it to load.',
                summary: 'Engine not ready',
            };
        }

        const trimmed = (sql || '').trim();
        if (!trimmed) {
            return {
                success: false,
                statements: [],
                error: 'No SQL query provided.',
                summary: 'Empty query',
            };
        }

        // Split into individual statements for reporting
        const stmts = this._splitStatements(trimmed);
        const results = [];

        try {
            for (const raw of stmts) {
                const stmtTrimmed = raw.trim();
                if (!stmtTrimmed) continue;

                const type = this._detectType(stmtTrimmed);

                // Capture row count BEFORE execution for change-tracking
                const changesBefore = this._db.getRowsModified();

                let columns = [];
                let rows = [];

                try {
                    const execResult = this._db.exec(stmtTrimmed);

                    if (execResult && execResult.length > 0) {
                        // SELECT-like — has result sets
                        columns = execResult[0].columns || [];
                        rows = execResult[0].values || [];
                    }
                } catch (stmtErr) {
                    // If a single statement in a batch fails, report it
                    return {
                        success: false,
                        statements: results,
                        error: stmtErr.message,
                        summary: `Execution Error`,
                    };
                }

                const changesAfter = this._db.getRowsModified();
                const rowsAffected = changesAfter - changesBefore;

                const message = this._buildMessage(type, rows.length, rowsAffected, stmtTrimmed);

                results.push({
                    sql: stmtTrimmed,
                    type,
                    columns,
                    rows,
                    rowsAffected,
                    message,
                });
            }

            // Build overall summary
            const summaryParts = results.map(r => r.message);
            return {
                success: true,
                statements: results,
                error: null,
                summary: summaryParts.join('\n'),
            };
        } catch (err) {
            return {
                success: false,
                statements: results,
                error: err.message,
                summary: 'Execution Error',
            };
        }
    }

    // ── Private helpers ───────────────────────────────────────

    /** Naive statement splitter — splits on semicolons outside quotes. */
    _splitStatements(sql) {
        const parts = [];
        let current = '';
        let inSingle = false;
        let inDouble = false;

        for (let i = 0; i < sql.length; i++) {
            const ch = sql[i];
            if (ch === "'" && !inDouble) { inSingle = !inSingle; }
            if (ch === '"' && !inSingle) { inDouble = !inDouble; }

            if (ch === ';' && !inSingle && !inDouble) {
                current += ch;
                parts.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
        if (current.trim()) parts.push(current);
        return parts;
    }

    /** Detect the SQL statement type from the first keyword. */
    _detectType(sql) {
        const upper = sql.toUpperCase().replace(/^\s*--[^\n]*\n/gm, '').trim();
        const first = upper.split(/\s+/)[0];
        const TYPES = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TRUNCATE', 'BEGIN', 'COMMIT', 'ROLLBACK', 'PRAGMA', 'EXPLAIN', 'REPLACE'];
        return TYPES.includes(first) ? first : 'UNKNOWN';
    }

    /** Build a human-readable success message for a statement. */
    _buildMessage(type, rowCount, rowsAffected, sql) {
        switch (type) {
            case 'CREATE': {
                // Detect what was created
                const upper = sql.toUpperCase();
                if (upper.includes('VIEW')) return 'View created successfully';
                if (upper.includes('INDEX')) return 'Index created successfully';
                return 'Table created successfully';
            }
            case 'DROP': {
                const upper = sql.toUpperCase();
                if (upper.includes('VIEW')) return 'View dropped successfully';
                if (upper.includes('INDEX')) return 'Index dropped successfully';
                return 'Table dropped successfully';
            }
            case 'ALTER':
                return 'Table altered successfully';
            case 'INSERT':
                return `${rowsAffected} row${rowsAffected !== 1 ? 's' : ''} inserted`;
            case 'UPDATE':
                return `${rowsAffected} row${rowsAffected !== 1 ? 's' : ''} updated`;
            case 'DELETE':
                return `${rowsAffected} row${rowsAffected !== 1 ? 's' : ''} deleted`;
            case 'TRUNCATE':
                return 'Table truncated successfully';
            case 'SELECT':
                return `Query executed successfully — ${rowCount} row${rowCount !== 1 ? 's' : ''} returned`;
            case 'BEGIN':
                return 'Transaction started';
            case 'COMMIT':
                return 'Transaction committed';
            case 'ROLLBACK':
                return 'Transaction rolled back';
            default:
                return 'Query executed successfully';
        }
    }
}

export default SqlEngine;
