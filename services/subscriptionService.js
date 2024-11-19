// subscriptionService.js
const sql = require('mssql');
const config = {
    subscription: process.env.DB_subscription,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

class SubscriptionService {
    // Get all subscriptions for a subscription
    async getsubscriptionSubscriptions(subscriptionId) {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .input('subscriptionId', sql.Int, subscriptionId)
                .query(`
                    SELECT 
                        s.ServiceID,
                        sp.ProviderName,
                        s.Service_Type,
                        usr.Service_startdate as issueDate,
                        usr.Service_enddate as expiry,
                        p.PlanName as plan,
                        p.PlanPrice as price,
                        sub.Auto_renewal_frequency as renewalFrequency,
                        CASE 
                            WHEN pay.PaymentID IS NOT NULL THEN 1 
                            ELSE 0 
                        END as isPaid
                    FROM Services s
                    JOIN Service_Provider sp ON s.ProviderID = sp.ProviderID
                    JOIN subscription_service_record usr ON s.ServiceID = usr.ServiceID
                    JOIN [Plan] p ON s.ServiceID = p.ServiceID
                    JOIN Subscription sub ON s.ServiceID = sub.ServiceID
                    LEFT JOIN Payment pay ON usr.RecordID = pay.RecordID
                    WHERE usr.subscriptionID = @subscriptionId
                `);
            
            return result.recordset.map(record => ({
                id: record.ServiceID,
                plan: record.plan,
                price: `${record.price} USD/${record.renewalFrequency === 1 ? 'Month' : 'Year'}`,
                issueDate: new Date(record.issueDate).toLocaleDateString(),
                expiry: new Date(record.expiry).toLocaleDateString(),
                isPaid: Boolean(record.isPaid)
            }));
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            throw error;
        }
    }

    // Add new subscription
    async addSubscription(subscriptionId, subscriptionData) {
        try {
            const pool = await sql.connect(config);
            const transaction = new sql.Transaction(pool);
            
            await transaction.begin();
            
            try {
                // Insert into subscription_service_record
                const recordResult = await transaction.request()
                    .input('startDate', sql.Date, new Date(subscriptionData.issueDate))
                    .input('endDate', sql.Date, new Date(subscriptionData.expiry))
                    .input('charge', sql.Decimal(10,2), parseFloat(subscriptionData.price))
                    .input('serviceId', sql.Int, subscriptionData.serviceId)
                    .input('subscriptionId', sql.Int, subscriptionId)
                    .query(`
                        INSERT INTO subscription_service_record 
                        (Service_startdate, Service_enddate, Service_charge, ServiceID, subscriptionID)
                        OUTPUT INSERTED.RecordID
                        VALUES (@startDate, @endDate, @charge, @serviceId, @subscriptionId)
                    `);

                const recordId = recordResult.recordset[0].RecordID;

                // Create subscription entry
                await transaction.request()
                    .input('frequency', sql.Int, subscriptionData.renewalFrequency || 1)
                    .input('serviceId', sql.Int, subscriptionData.serviceId)
                    .query(`
                        INSERT INTO Subscription (Auto_renewal_frequency, ServiceID)
                        VALUES (@frequency, @serviceId)
                    `);

                await transaction.commit();
                return { success: true, recordId };
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (error) {
            console.error('Error adding subscription:', error);
            throw error;
        }
    }

    // Update subscription
    async updateSubscription(subscriptionId, subscriptionId, updateData) {
        try {
            const pool = await sql.connect(config);
            await pool.request()
                .input('endDate', sql.Date, new Date(updateData.expiry))
                .input('charge', sql.Decimal(10,2), parseFloat(updateData.price))
                .input('subscriptionId', sql.Int, subscriptionId)
                .input('subscriptionId', sql.Int, subscriptionId)
                .query(`
                    UPDATE usr
                    SET 
                        Service_enddate = @endDate,
                        Service_charge = @charge
                    FROM subscription_service_record usr
                    WHERE usr.ServiceID = @subscriptionId
                    AND usr.subscriptionID = @subscriptionId
                `);
            
            return { success: true };
        } catch (error) {
            console.error('Error updating subscription:', error);
            throw error;
        }
    }

    // Delete subscription
    async deleteSubscription(subscriptionId, subscriptionId) {
        try {
            const pool = await sql.connect(config);
            const transaction = new sql.Transaction(pool);
            
            await transaction.begin();
            
            try {
                // Delete related records first
                await transaction.request()
                    .input('subscriptionId', sql.Int, subscriptionId)
                    .input('subscriptionId', sql.Int, subscriptionId)
                    .query(`
                        DELETE FROM Payment 
                        WHERE RecordID IN (
                            SELECT RecordID 
                            FROM subscription_service_record 
                            WHERE ServiceID = @subscriptionId 
                            AND subscriptionID = @subscriptionId
                        );

                        DELETE FROM subscription_service_record 
                        WHERE ServiceID = @subscriptionId 
                        AND subscriptionID = @subscriptionId;
                    `);

                await transaction.commit();
                return { success: true };
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (error) {
            console.error('Error deleting subscription:', error);
            throw error;
        }
    }

    // Process payment for subscription
    async processPayment(subscriptionId, subscriptionId, paymentData) {
        try {
            const pool = await sql.connect(config);
            const transaction = new sql.Transaction(pool);
            
            await transaction.begin();
            
            try {
                // Get the record ID
                const recordResult = await transaction.request()
                    .input('subscriptionId', sql.Int, subscriptionId)
                    .input('subscriptionId', sql.Int, subscriptionId)
                    .query(`
                        SELECT RecordID 
                        FROM subscription_service_record 
                        WHERE ServiceID = @subscriptionId 
                        AND subscriptionID = @subscriptionId
                    `);

                const recordId = recordResult.recordset[0].RecordID;

                // Insert payment record
                const paymentResult = await transaction.request()
                    .input('method', sql.VarChar(50), paymentData.paymentMethod)
                    .input('date', sql.Date, new Date())
                    .input('address', sql.VarChar(255), paymentData.paymentAddress)
                    .input('recordId', sql.Int, recordId)
                    .query(`
                        INSERT INTO Payment (PaymentMethod, PaymentDate, PaymentAddress, RecordID)
                        OUTPUT INSERTED.PaymentID
                        VALUES (@method, @date, @address, @recordId)
                    `);

                const paymentId = paymentResult.recordset[0].PaymentID;

                await transaction.commit();
                return { success: true, paymentId };
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            throw error;
        }
    }
}

module.exports = new SubscriptionService();