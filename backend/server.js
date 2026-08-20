const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

const PLACEHOLDER_DOB = "1900-01-01";

function archiveChildrenAboveSix(callback) {
    const sql = `
        UPDATE children
        SET status = 'archived'
        WHERE status = 'active'
        AND dob IS NOT NULL
        AND dob <> ?
        AND DATE_ADD(dob, INTERVAL 6 YEAR) <= CURDATE()
    `;

    db.query(sql, [PLACEHOLDER_DOB], function (err) {
        if (err) {
            console.error(err);
            return callback(err);
        }

        callback(null);
    });
}

app.get("/", function (req, res) {
    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );
});

app.post("/api/children", function (req, res) {

    const name =
        req.body.name &&
        req.body.name.trim()
            ? req.body.name.trim()
            : "Not provided";

    const dob =
        req.body.dob
            ? req.body.dob
            : PLACEHOLDER_DOB;

    const gender =
        req.body.gender === "Girl"
            ? "Girl"
            : "Boy";

    const parent_name =
        req.body.parent_name &&
        req.body.parent_name.trim()
            ? req.body.parent_name.trim()
            : "Not provided";

    const contact =
        req.body.contact &&
        req.body.contact.trim()
            ? req.body.contact.trim()
            : "Not provided";

    const height =
        req.body.height !== undefined &&
        req.body.height !== null &&
        req.body.height !== ""
            ? req.body.height
            : 0;

    const weight =
        req.body.weight !== undefined &&
        req.body.weight !== null &&
        req.body.weight !== ""
            ? req.body.weight
            : 0;

    const sql = `
        INSERT INTO children
        (
            name,
            dob,
            gender,
            parent_name,
            contact,
            height,
            weight
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            dob,
            gender,
            parent_name,
            contact,
            height,
            weight
        ],
        function (err, result) {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to add child"
                });
            }

            res.status(201).json({
                message:
                    "Child added successfully",
                id: result.insertId
            });
        }
    );
});

app.get("/api/children", function (req, res) {

    archiveChildrenAboveSix(function (err) {

        if (err) {
            return res.status(500).json({
                message:
                    "Failed to update child status"
            });
        }

        const sql = `
            SELECT *
            FROM children
            ORDER BY id DESC
        `;

        db.query(
            sql,
            function (err, results) {

                if (err) {
                    console.error(err);

                    return res.status(500).json({
                        message:
                            "Failed to fetch children"
                    });
                }

                res.json(results);
            }
        );
    });
});

app.get(
    "/api/children/archived",
    function (req, res) {

        archiveChildrenAboveSix(
            function (err) {

                if (err) {
                    return res.status(500).json({
                        message:
                            "Failed to update child status"
                    });
                }

                const sql = `
                    SELECT *
                    FROM children
                    WHERE status = 'archived'
                    ORDER BY id DESC
                `;

                db.query(
                    sql,
                    function (err, results) {

                        if (err) {
                            console.error(err);

                            return res.status(500).json({
                                message:
                                    "Failed to fetch archived children"
                            });
                        }

                        res.json(results);
                    }
                );
            }
        );
    }
);

app.get(
    "/api/children/:id",
    function (req, res) {

        const id = req.params.id;

        archiveChildrenAboveSix(
            function (err) {

                if (err) {
                    return res.status(500).json({
                        message:
                            "Failed to update child status"
                    });
                }

                const sql = `
                    SELECT *
                    FROM children
                    WHERE id = ?
                `;

                db.query(
                    sql,
                    [id],
                    function (err, results) {

                        if (err) {
                            console.error(err);

                            return res.status(500).json({
                                message:
                                    "Failed to fetch child"
                            });
                        }

                        if (
                            results.length === 0
                        ) {
                            return res.status(404).json({
                                message:
                                    "Child not found"
                            });
                        }

                        res.json(results[0]);
                    }
                );
            }
        );
    }
);

app.put(
    "/api/children/:id",
    function (req, res) {

        const id = req.params.id;

        const name =
            req.body.name &&
            req.body.name.trim()
                ? req.body.name.trim()
                : "Not provided";

        const dob =
            req.body.dob
                ? req.body.dob
                : PLACEHOLDER_DOB;

        const gender =
            req.body.gender === "Girl"
                ? "Girl"
                : "Boy";

        const parent_name =
            req.body.parent_name &&
            req.body.parent_name.trim()
                ? req.body.parent_name.trim()
                : "Not provided";

        const contact =
            req.body.contact &&
            req.body.contact.trim()
                ? req.body.contact.trim()
                : "Not provided";

        const height =
            req.body.height !== undefined &&
            req.body.height !== null &&
            req.body.height !== ""
                ? req.body.height
                : 0;

        const weight =
            req.body.weight !== undefined &&
            req.body.weight !== null &&
            req.body.weight !== ""
                ? req.body.weight
                : 0;

        const sql = `
            UPDATE children
            SET
                name = ?,
                dob = ?,
                gender = ?,
                parent_name = ?,
                contact = ?,
                height = ?,
                weight = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                name,
                dob,
                gender,
                parent_name,
                contact,
                height,
                weight,
                id
            ],
            function (err, result) {

                if (err) {
                    console.error(err);

                    return res.status(500).json({
                        message:
                            "Failed to update child"
                    });
                }

                if (
                    result.affectedRows === 0
                ) {
                    return res.status(404).json({
                        message:
                            "Child not found"
                    });
                }

                archiveChildrenAboveSix(
                    function (archiveError) {

                        if (archiveError) {
                            return res.status(500).json({
                                message:
                                    "Child updated but status check failed"
                            });
                        }

                        res.json({
                            message:
                                "Child updated successfully"
                        });
                    }
                );
            }
        );
    }
);

app.delete(
    "/api/children/:id",
    function (req, res) {

        const id = req.params.id;

        const sql = `
            DELETE FROM children
            WHERE id = ?
        `;

        db.query(
            sql,
            [id],
            function (err, result) {

                if (err) {
                    console.error(err);

                    return res.status(500).json({
                        message:
                            "Failed to delete child"
                    });
                }

                if (
                    result.affectedRows === 0
                ) {
                    return res.status(404).json({
                        message:
                            "Child not found"
                    });
                }

                res.json({
                    message:
                        "Child deleted successfully"
                });
            }
        );
    }
);

const PORT = 3000;

app.listen(
    PORT,

    
    function () {
        console.log(
            `Angan Sathi server running on http://localhost:${PORT}`
        );
    }
);