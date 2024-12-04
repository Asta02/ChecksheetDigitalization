const mssql = require("mssql");
const { app, sqlConfig } = require("./app");

app.put("/updateContainerRevised/:id", async(req, res) => {
    try {
        const id_container = req.params.id;
        const updatedFields = req.body;

        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        // Fungsi bantu format nilai
        const formatValue = (value) => {
            if (value === null || value === true || value === '' || (Array.isArray(value) && value.length === 0)) {
                return 'NULL';
            } else if (Array.isArray(value)) {
                return `'${value.join(',')}'`;
            } else {
                return `'${value}'`;
            }
        };

        // Buat SET clause secara dinamis
        const setClause = Object.keys(updatedFields)
            .map(field => `${field} = ${formatValue(updatedFields[field])}`)
            .join(", ");

        const query = `
            UPDATE t_container
            SET ${setClause}
            WHERE id_container = '${id_container}';
        `;

        const request = connection.request();
        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Container updated successfully" });
    } catch (error) {
        console.error("Error updating container:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});