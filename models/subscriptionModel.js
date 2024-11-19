const connectDB = require("../config/dbConfig");

exports.createSubscription = async (userId, planId, startDate, status) => {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("userId", userId)
    .input("planId", planId)
    .input("startDate", startDate)
    .input("status", status)
    .query(`
      INSERT INTO [Subscription] (userId, planId, startDate, status)
      OUTPUT INSERTED.*
      VALUES (@userId, @planId, @startDate, @status)
    `);
  return result.recordset[0];
};

exports.getSubscriptionByUserId = async (userId) => {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("userId", userId)
    .query(`
      SELECT s.*, p.name as planName, p.price, p.features
      FROM [Subscription] s
      JOIN [Plan] p ON s.planId = p.id
      WHERE s.userId = @userId
    `);
  return result.recordset[0];
};
