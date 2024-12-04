const express = require("express");
const bodyParser = require('body-parser');
const mssql = require("mssql");

const app = express();
const PORT = 3003;

// Configure SQL server
// const sqlConfig = {
//     user: '',
//     password: '',
//     server: '',
//     database: '',
//     port: PORT,
//     pool: {
//         max: 10,
//         min: 0,
//         idleTimeoutMillis: 100000,
//     },
//     options: {
//         encrypt: false, // for azure
//         trustServerCertificate: true, // change to true for local dev / self-signed certs
//         enableArithAbort: true,
//     },
// };

// const sqlConfigGSportal = {
//     user: '',
//     password: '!',
//     server: '',
//     database: '',
//     port: PORT,
//     pool: {
//         max: 10,
//         min: 0,
//         idleTimeoutMillis: 100000,
//     },
//     options: {
//         encrypt: false, // for azure
//         trustServerCertificate: false, // change to true for local dev / self-signed certs
//         enableArithAbort: true,
//     },
// };

// const sqlConfigGSportalhr = {
//     user: '',
//     password: '',
//     server: '',
//     database: '',
//     port: PORT,
//     pool: {
//         max: 10,
//         min: 0,
//         idleTimeoutMillis: 100000,
//     },
//     options: {
//         encrypt: false, // for azure
//         trustServerCertificate: false, // change to true for local dev / self-signed certs
//         enableArithAbort: true,
//     },
// };

// const sqlConfigDBLakeInfor = {
//     user: '',
//     password: '',
//     server: '',
//     database: '',
//     port: PORT,
//     pool: {
//         max: 10,
//         min: 0,
//         idleTimeoutMillis: 100000,
//     },
//     options: {
//         encrypt: false, // for azure
//         trustServerCertificate: false, // change to true for local dev / self-signed certs
//         enableArithAbort: true,
//     },
// };

// const sqlConfigDBqsa = {
//     user: '',
//     password: '',
//     server: '',
//     database: '',
//     port: PORT,
//     pool: {
//         max: 10,
//         min: 0,
//         idleTimeoutMillis: 100000,
//     },
//     options: {
//         encrypt: false, // for azure
//         trustServerCertificate: false, // change to true for local dev / self-signed certs
//         enableArithAbort: true,
//     },
// };

// Configure LDAP
// const LDAP_SERVER = 'ldap://10.19.48.7';
// const LDAP_BASE_DN = 'dc=gs, dc=astra, dc=co, dc=id';
// const LDAP_DOMAIN = 'gs';

// Middleware
//app.use(morgan('short'));
//app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// SQL Connection Pools
let pools = {};

async function createPool(config, poolName) {
    try {
        pools[poolName] = new mssql.ConnectionPool(config);
        pools[poolName].on('error', err => {
            console.log(`SQL pool error (${poolName}):`, err);
            reconnectPool(config, poolName);
        });
        await pools[poolName].connect();
        console.log(`Connected to ${poolName}`);
    } catch (err) {
        console.error(`Error creating SQL pool (${poolName}):`, err);
        reconnectPool(config, poolName);
    }
}

function reconnectPool(config, poolName, retryCount = 0) {
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30 seconds
    setTimeout(() => createPool(config, poolName), retryDelay);
}

// Create all connection pools
createPool(sqlConfig, 'sqlConfig');
// createPool(sqlConfigGSportal, 'sqlConfigGSportal');
// createPool(sqlConfigGSportalhr, 'sqlConfigGSportalhr');
// createPool(sqlConfigDBLakeInfor, 'sqlConfigDBLakeInfor');
// createPool(sqlConfigDBqsa, 'sqlConfigDBqsa');

// Route
app.get("/", (req, res) => {
    res.send("Hello from port 3003!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});



// const getUserData = () => {
//     return new Promise((resolve, reject) => {
//         const sql = `SELECT * FROM tlkp_user`;
//         const connection = new mssql.ConnectionPool(sqlConfig);

//         connection.connect(err => {
//             if (err) {
//                 console.error("Failed to connect to SQL Server:", err);
//                 return reject(err);
//             }
//             console.log("Database connected!");

//             connection.query(sql, (err, results) => {
//                 if (err) {
//                     console.error("Error executing query:", err);
//                     connection.close();
//                     return reject(err);
//                 }
//                 connection.close();
//                 resolve(results.recordset);
//             });
//         });
//     });
// };


// Draft checksheet satu satu
// app.get("/getChecksheetDetailDraft/:id", async (req, res) => {
//     try {
//         const id = req.params.id;
//         const connection = await new mssql.ConnectionPool(sqlConfig).connect();
//         const result = await connection.request().query(`
//             SELECT
//                 ct.id_checksheettransaction,
//                 ct.no_wo,
//                 ct.[shift],
//                 ct.tgl_check,
//                 ct.tgl_delivery,
//                 ib.brand_battery,
//                 ib.type_battery,
//                 ib.negara_tujuan AS batteryNegaraTujuan,
//                 ib.customer
//             FROM t_checksheettransaction AS ct
//             INNER JOIN tlkp_transactionform AS tf ON ct.id_checksheettransaction = tf.id_checksheettransaction
//             INNER JOIN t_informasi_battery AS ib ON tf.id_informasi_battery = ib.id_informasi_battery
//             WHERE ct.id_checksheettransaction = '${id}';
//         `);
//         await connection.close();
//         res.json(result.recordset);
//     } catch (error) {
//         console.error("Error retrieving checksheet detail draft data:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// app.get("/getPacking/:id", async (req, res) => {
//     try {
//         const id = req.params.id;
//         const connection = await new mssql.ConnectionPool(sqlConfig).connect();
//         const result = await connection.request().query(`
//             SELECT
//                 tp.jumlah_batterypalet_standard,
//                 tp.jumlah_batterypalet_actual,
//                 tp.kondisi_susunanbattery,
//                 tp.kondisi_ikatan,
//                 tp.type_palletno_standard,
//                 tp.type_palletno_actual,
//                 tp.tampilan_palet,
//                 tp.styrophore_karton_triplex_standard,
//                 tp.styrophore_karton_triplex_actual,
//                 tp.inspection_tag,
//                 tp.shiping_mark,
//                 tp.label_produksi,
//                 tp.plastik_shrink
//             FROM t_packing AS tp
//             INNER JOIN tlkp_transactionform AS tf ON tp.id_packing = tf.id_packing
//             INNER JOIN t_checksheettransaction AS ct ON tf.id_checksheettransaction = ct.id_checksheettransaction
//             WHERE ct.id_checksheettransaction = '${id}';
//         `);
//         await connection.close();
//         res.json(result.recordset);
//     } catch (error) {
//         console.error("Error retrieving packing data:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// app.get("/getCover/:id", async (req, res) => {
//     try {
//         const id = req.params.id;
//         const connection = await new mssql.ConnectionPool(sqlConfig).connect();
//         const result = await connection.request().query(`
//             SELECT
//                 tc.warna_cover_standard AS coverWarnaStandard,
//                 tc.warna_cover_actual AS coverWarnaActual,
//                 tc.tampilan_terminal AS coverTampilanTerminal,
//                 tc.posisi_terminal AS coverPosisiTerminal,
//                 tc.brand_mark_standard AS coverBrandMarkStandard,
//                 tc.brand_mark_actual AS coverBrandMarkActual,
//                 tc.kode_finishing_standard AS coverKodeFinishingStandard,
//                 tc.kode_finishing_actual AS coverKodeFinishingActual,
//                 tc.sticker_standard AS coverStickerStandard,
//                 tc.sticker_actual AS coverStickerActual,
//                 tc.type_vent_plug_standard AS coverTypeVentPlugStandard,
//                 tc.type_vent_plug_actual AS coverTypeVentPlugActual,
//                 tc.warna_vent_plug_standard AS coverWarnaVentPlugStandard,
//                 tc.warna_vent_plug_actual AS coverWarnaVentPlugActual,
//                 tc.tampilan_vent_plug AS coverTampilanVentPlug,
//                 tc.indicator_electrolite AS coverIndicatorElectrolite
//             FROM t_cover AS tc
//             INNER JOIN tlkp_transactionform AS tf ON tc.id_cover = tf.id_cover
//             INNER JOIN t_checksheettransaction AS ct ON tf.id_checksheettransaction = ct.id_checksheettransaction
//             WHERE ct.id_checksheettransaction = '${id}';
//         `);
//         await connection.close();
//         res.json(result.recordset);
//     } catch (error) {
//         console.error("Error retrieving cover data:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// app.get("/getContainer/:id", async (req, res) => {
//     try {
//         const id = req.params.id;
//         const connection = await new mssql.ConnectionPool(sqlConfig).connect();
//         const result = await connection.request().query(`
//             SELECT
//                 tco.warna_container_standard AS containerWarnaStandard,
//                 tco.warna_container_actual AS containerWarnaActual,
//                 tco.mark_brand_standard AS containerMarkBrandStandard,
//                 tco.mark_brand_actual AS containerMarkBrandActual,
//                 tco.mark_type_standard AS containerMarkTypeStandard,
//                 tco.mark_type_actual AS containerMarkTypeActual,
//                 tco.upperlower_level AS containerUpperLowerLevel,
//                 tco.tampilan_container AS containerTampilan,
//                 tco.mark_spec_standard AS containerMarkSpecStandard,
//                 tco.mark_spec_actual AS containerMarkSpecActual,
//                 tco.stamp_standard AS containerStampStandard,
//                 tco.stamp_actual AS containerStampActual,
//                 tco.sticker_standard AS containerStickerStandard,
//                 tco.sticker_actual AS containerStickerActual
//             FROM t_container AS tco
//             INNER JOIN tlkp_transactionform AS tf ON tco.id_container = tf.id_container
//             INNER JOIN t_checksheettransaction AS ct ON tf.id_checksheettransaction = ct.id_checksheettransaction
//             WHERE ct.id_checksheettransaction = '${id}';
//         `);
//         await connection.close();
//         res.json(result.recordset);
//     } catch (error) {
//         console.error("Error retrieving container data:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// app.get("/getKBox/:id", async (req, res) => {
//     try {
//         const id = req.params.id;
//         const connection = await new mssql.ConnectionPool(sqlConfig).connect();
//         const result = await connection.request().query(`
//             SELECT
//                 tkb.tampilan_kabo AS kBoxTampilan,
//                 tkb.sticker_standard AS kBoxStickerStandard,
//                 tkb.sticker_actual AS kBoxStickerActual,
//                 tkb.mark_brand_standard AS kBoxMarkBrandStandard,
//                 tkb.mark_brand_actual AS kBoxMarkBrandActual,
//                 tkb.mark_type_standard AS kBoxMarkTypeStandard,
//                 tkb.mark_type_actual AS kBoxMarkTypeActual,
//                 tkb.mark_spec_standard AS kBoxMarkSpecStandard,
//                 tkb.mark_spec_actual AS kBoxMarkSpecActual,
//                 tkb.intruction_manual AS kBoxInstructionManual,
//                 tkb.stamp AS kBoxStamp,
//                 tkb.isolasi AS kBoxIsolasi
//             FROM t_kbox AS tkb
//             INNER JOIN tlkp_transactionform AS tf ON tkb.id_kbox = tf.id_kbox
//             INNER JOIN t_checksheettransaction AS ct ON tf.id_checksheettransaction = ct.id_checksheettransaction
//             WHERE ct.id_checksheettransaction = '${id}';
//         `);
//         await connection.close();
//         res.json(result.recordset);
//     } catch (error) {
//         console.error("Error retrieving kBox data:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });



// ~~~~~~~~~~ POST ~~~~~~~~~~ //
app.post("/createChecksheetTransaction", async(req, res) => {
    try {
        const { id_form, no_wo, shift, checksheet_createBy, emp_id } = req.body;

        if (!id_form || !no_wo || !shift || !checksheet_createBy || !emp_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        const sql = `INSERT INTO t_checksheettransaction (id_form, tgl_check, tgl_delivery, no_wo, [shift], checksheet_createBy, checksheet_createDate, checksheet_modifDate, status, emp_id)
                     VALUES ('${id_form}', GETDATE(), GETDATE(), '${no_wo}', '${shift}', '${checksheet_createBy}', GETDATE(), GETDATE(), 0, '${emp_id}');
                     SELECT SCOPE_IDENTITY() AS LastInsertedID;`;

        // id yang paling baru dari checksheet atau hasil dari auto increment                     
        const result = await connection.query(sql);
        const lastInsertedID = result.recordset[0].LastInsertedID;

        // insert battery
        const sqlBattery = `INSERT INTO t_informasi_battery(brand_battery, type_battery, negara_tujuan, customer) 
                            VALUES (NULL, NULL, NULL, NULL);
                            SELECT SCOPE_IDENTITY() AS LastInsertedBatteryID;`;

        const resultBattery = await connection.query(sqlBattery);
        const lastInsertedBatteryID = resultBattery.recordset[0].LastInsertedBatteryID;

        // insert cover
        const sqlCover = `INSERT INTO t_cover ([warna_cover_standard], [warna_cover_actual], [tampilan_terminal], [brand_mark_standard], [brand_mark_actual], [tampilan_cover], [kode_finishing_actual], [sticker_standard], [sticker_actual], [type_vent_plug_standard], [type_vent_plug_actual], [warna_vent_plug_standard], [warna_vent_plug_actual], [tampilan_vent_plug], [indicator_electrolite]) VALUES (NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL); SELECT SCOPE_IDENTITY() AS LastInsertedCoverID;`;

        const resultCover = await connection.query(sqlCover);
        const lastInsertedCoverID = resultCover.recordset[0].LastInsertedCoverID;

        // insert packing
        const sqlPacking = `INSERT INTO t_packing ([jumlah_batterypalet_standard], [jumlah_batterypalet_actual], [kondisi_susunanbattery], [kondisi_ikatan], [type_palletno_standard], [type_palletno_actual], [tampilan_palet], [styrophore_karton_triplex_standard], [styrophore_karton_triplex_actual], [inspection_tag], [shiping_mark], [label_produksi], [plastik_shrink]) VALUES (NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL); SELECT SCOPE_IDENTITY() AS LastInsertedPackingID;`;

        const resultPacking = await connection.query(sqlPacking);
        const lastInsertedPackingID = resultPacking.recordset[0].LastInsertedPackingID;

        // insert container
        const sqlContainer = `INSERT INTO t_container ([warna_container_standard], [warna_container_actual], [mark_brand_standard], [mark_brand_actual], [mark_type_standard], [mark_type_actual], [upperlower_level], [tampilan_container], [sticker_standard], [sticker_actual]) VALUES (NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL); SELECT SCOPE_IDENTITY() AS LastInsertedContainerID;`;

        const resultContainer = await connection.query(sqlContainer);
        const lastInsertedContainerID = resultContainer.recordset[0].LastInsertedContainerID;

        // insert container
        const sqlKbox = `INSERT INTO t_kbox ([tampilan_kabo],[sticker_standard],[sticker_actual],[mark_brand_standard],[mark_brand_actual],[mark_type_standard],[mark_type_actual],[mark_spec_standard],[mark_spec_actual],[intruction_manual],[stamp],[isolasi]) VALUES (NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL); SELECT SCOPE_IDENTITY() AS lastInsertedKboxID;`;

        const resultKbox = await connection.query(sqlKbox);
        const lastInsertedKboxID = resultKbox.recordset[0].lastInsertedKboxID;

        // insert acc
        const sqlAccessories = `INSERT INTO t_accessories([warranty_card_standard],[warranty_card_actual],[instuction_manual_standard],[instuction_manual_actual],[elbow_standard],[elbow_actual]) VALUES (NULL,NULL,NULL,NULL,NULL,NULL); SELECT SCOPE_IDENTITY() AS lastInsertedAccID;`;

        const resultAccessories = await connection.query(sqlAccessories);
        const lastInsertedAccessoriesID = resultAccessories.recordset[0].lastInsertedAccID;

        //insert notif
        const sqlNotif = `INSERT INTO t_notif(id_checksheettransaction, emp_id, baca, notif_date)
                     VALUES ('${lastInsertedID}', '${emp_id}', 0, GETDATE());`;

        const resultNotif = await connection.query(sqlNotif);

        //insert tlkp_transactionform
        const sqlTransactionform = `INSERT INTO tlkp_transactionform(id_checksheettransaction, id_informasi_battery, id_packing, id_cover, id_container, id_kbox, id_accessories)
                             VALUES (${lastInsertedID}, ${lastInsertedBatteryID}, ${lastInsertedPackingID}, ${lastInsertedCoverID}, ${lastInsertedContainerID}, ${lastInsertedKboxID}, ${lastInsertedAccessoriesID});`;

        const resultTransactionform = await connection.query(sqlTransactionform);

        await connection.close();

        res.status(200).json({
            message: "Checksheet transaction created successfully",
            lastInsertedID,
            lastInsertedBatteryID,
            lastInsertedCoverID,
            lastInsertedPackingID,
            lastInsertedContainerID,
            lastInsertedKboxID,
            lastInsertedAccessoriesID,
            resultNotif,
            resultTransactionform
        });
    } catch (error) {
        console.error("Error creating checksheet transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// ~~~~~~~~~~ PUT ~~~~~~~~~~ //
app.put("/updateInformasiBattery/:id", async(req, res) => {
    try {
        const id_informasi_battery = req.params.id;
        const updatedFields = req.body;

        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        // Helper function to format values
        const formatValue = (value) => {
            if (value === null || value === true || value === '' || (Array.isArray(value) && value.length === 0)) {
                return 'NULL';
            } else if (Array.isArray(value)) {
                return `'${value.join(',')}'`;
            } else {
                return `'${value}'`;
            }
        };

        // Build the SET clause dynamically
        const setClause = Object.keys(updatedFields)
            .map(field => `${field} = ${formatValue(updatedFields[field])}`)
            .join(", ");

        const query = `
            UPDATE [db_qc].[dbo].[t_informasi_battery]
            SET ${setClause}
            WHERE id_informasi_battery = '${id_informasi_battery}';
        `;

        const request = connection.request();
        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Informasi Battery updated successfully" });
    } catch (error) {
        console.error("Error updating informasi battery:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.put("/updatePacking/:id", async(req, res) => {
    try {
        const id_packing = req.params.id;
        const updatedFields = req.body;

        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        // Helper function to format values
        const formatValue = (value) => {
            if (value === null || value === true || value === '' || (Array.isArray(value) && value.length === 0)) {
                return 'NULL';
            } else if (Array.isArray(value)) {
                return `'${value.join(',')}'`;
            } else {
                return `'${value}'`;
            }
        };

        // Build the SET clause dynamically
        const setClause = Object.keys(updatedFields)
            .map(field => `${field} = ${formatValue(updatedFields[field])}`)
            .join(", ");

        const query = `
            UPDATE [db_qc].[dbo].[t_packing]
            SET ${setClause}
            WHERE id_packing = '${id_packing}';
        `;

        const request = connection.request();
        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Packing updated successfully" });
    } catch (error) {
        console.error("Error updating packing:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.put("/updateCover/:id", async(req, res) => {
    try {
        const id_cover = req.params.id;
        const updatedFields = req.body;

        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        // Helper function to format values
        const formatValue = (value) => {
            if (value === null || value === true || value === '' || (Array.isArray(value) && value.length === 0)) {
                return 'NULL';
            } else if (Array.isArray(value)) {
                return `'${value.join(',')}'`;
            } else {
                return `'${value}'`;
            }
        };

        // Build the SET clause dynamically
        const setClause = Object.keys(updatedFields)
            .map(field => `${field} = ${formatValue(updatedFields[field])}`)
            .join(", ");

        const query = `
            UPDATE [db_qc].[dbo].[t_cover]
            SET ${setClause}
            WHERE id_cover = '${id_cover}';
        `;

        const request = connection.request();
        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Cover updated successfully" });
    } catch (error) {
        console.error("Error updating cover:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.put("/updateContainer/:id", async(req, res) => {
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
app.put("/updateContainerOld/:id", async(req, res) => {
    const id_container = req.params.id;

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

    try {
        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        const query = `
            UPDATE t_container
            SET 
                warna_container_standard = ${formatValue(req.body.warna_container_standard)},
                warna_container_actual = ${formatValue(req.body.warna_container_actual)},
                mark_brand_standard = ${formatValue(req.body.mark_brand_standard)},
                mark_brand_actual = ${formatValue(req.body.mark_brand_actual)},
                mark_type_standard = ${formatValue(req.body.mark_type_standard)},
                mark_type_actual = ${formatValue(req.body.mark_type_actual)},
                upperlower_level = ${formatValue(req.body.upperlower_level)},
                tampilan_container = ${formatValue(req.body.tampilan_container)},
                mark_spec_standard = ${formatValue(req.body.mark_spec_standard)},
                mark_spec_actual = ${formatValue(req.body.mark_spec_actual)},
                stamp_standard = ${formatValue(req.body.stamp_standard)},
                stamp_actual = ${formatValue(req.body.stamp_actual)},
                sticker_standard = ${formatValue(req.body.sticker_standard)},
                sticker_actual = ${formatValue(req.body.sticker_actual)}
            WHERE id_container = @id_container;
        `;

        const request = connection.request();
        request.input('id_container', mssql.VarChar, id_container);
        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Container updated successfully" });
    } catch (error) {
        console.error("Error updating container:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.put("/updateKbox/:id", async(req, res) => {
    try {
        const id_kbox = req.params.id;
        const updatedFields = req.body;

        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        // Helper function to format values
        const formatValue = (value) => {
            if (value === null || value === true || value === '' || (Array.isArray(value) && value.length === 0)) {
                return 'NULL';
            } else if (Array.isArray(value)) {
                return `'${value.join(',')}'`;
            } else {
                return `'${value}'`;
            }
        };

        // Build the SET clause dynamically
        const setClause = Object.keys(updatedFields)
            .map(field => `${field} = ${formatValue(updatedFields[field])}`)
            .join(", ");

        const query = `
            UPDATE [db_qc].[dbo].[t_kbox]
            SET ${setClause}
            WHERE id_kbox = '${id_kbox}';
        `;

        const request = connection.request();
        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Kbox updated successfully" });
    } catch (error) {
        console.error("Error updating kbox:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.put("/updateAccessories/:id", async(req, res) => {
    try {
        const id_accessories = req.params.id;
        const updatedFields = req.body;

        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        // Helper function to format values
        const formatValue = (value) => {
            if (value === null || value === true || value === '' || (Array.isArray(value) && value.length === 0)) {
                return 'NULL';
            } else if (Array.isArray(value)) {
                return `'${value.join(',')}'`;
            } else {
                return `'${value}'`;
            }
        };

        // Build the SET clause dynamically
        const setClause = Object.keys(updatedFields)
            .map(field => `${field} = ${formatValue(updatedFields[field])}`)
            .join(", ");

        const query = `
            UPDATE [db_qc].[dbo].[t_accessories]
            SET ${setClause}
            WHERE id_accessories = '${id_accessories}';
        `;

        const request = connection.request();
        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Accessories updated successfully" });
    } catch (error) {
        console.error("Error updating Accessories:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/cancelChecksheet/:id", async(req, res) => {
    try {
        const id_checksheettransaction = req.params.id;
        const { canceled_message, canceled_photo } = req.body;

        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        const query = `
            UPDATE [db_qc].[dbo].[t_checksheettransaction]
            SET 
                canceled_message = '${canceled_message}',
                canceled_photo = '${canceled_photo}',
                checksheet_modifDate = GETDATE(),
                [status] = 5
            WHERE 
                id_checksheettransaction = '${id_checksheettransaction}';
        `;

        const request = connection.request();

        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Checksheet has been canceled" });
    } catch (error) {
        console.error("Error Canceling Checksheet :", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/sendSignature/:id", async(req, res) => {
    try {
        const id_checksheettransaction = req.params.id;
        const { ttd_operator } = req.body;

        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        const query = `
            UPDATE [db_qc].[dbo].[t_checksheettransaction]
            SET 
                ttd_operator = '${ttd_operator}',
                tgl_ttdoperator = GETDATE(),
                checksheet_modifDate = GETDATE(),
                [status] = 1
            WHERE 
                id_checksheettransaction = '${id_checksheettransaction}';
        `;

        const request = connection.request();

        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Signtaure has been sent" });
    } catch (error) {
        console.error("Error Sending Signature :", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/changeModifiedDate/:id", async(req, res) => {
    try {
        const id_checksheettransaction = req.params.id;

        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        const query = `
            UPDATE [db_qc].[dbo].[t_checksheettransaction]
            SET 
                checksheet_modifDate = GETDATE()
            WHERE 
                id_checksheettransaction = '${id_checksheettransaction}';
        `;

        const request = connection.request();

        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Modified date has been updated" });
    } catch (error) {
        console.error("Error Update Modified date :", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/changeCatatan/:id", async(req, res) => {
    try {
        const id_checksheettransaction = req.params.id;
        const { catatan } = req.body;

        let catatanValue;
        if (catatan === null || catatan === true || catatan === '') {
            catatanValue = 'NULL';
        } else {
            catatanValue = `'${catatan}'`;
        }

        const query = `
            UPDATE [dbo].[t_checksheettransaction]
            SET 
                catatan = ${catatanValue}
            WHERE 
                id_checksheettransaction = '${id_checksheettransaction}';
        `;

        const connection = await new mssql.ConnectionPool(sqlConfig).connect();
        const request = connection.request();

        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Catatan has been updated" });
    } catch (error) {
        console.error("Error Update Catatan:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/changeStatusNotif/:id", async(req, res) => {
    try {
        const id_checksheettransaction = req.params.id;

        const connection = new mssql.ConnectionPool(sqlConfig);
        await connection.connect();

        const query = `
            UPDATE [db_qc].[dbo].[t_notif]
            SET
                [baca] = 1
            WHERE
                id_checksheettransaction = '${id_checksheettransaction}';
        `;

        const request = connection.request();

        await request.query(query);

        await connection.close();

        res.status(200).json({ message: "Notif has been clicked" });
    } catch (error) {
        console.error("Error Notification clicked :", error);
        res.status(500).json({ error: "Internal server error" });
    }
});






// Usage of getUserData function
// getUserData()
//     .then(records => {
//         // Handle the retrieved records here
//         console.log("Retrieved records:", records);
//     })
//     .catch(error => {
//         // Handle any errors that occurred during the retrieval
//         console.error("Error:", error);
//     });