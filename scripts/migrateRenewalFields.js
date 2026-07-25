const mongoose = require("mongoose");
const Bill = require("../modules/bills/bill.model");
require("dotenv").config();

const migrate = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://datacloude8_db_user:5LcoVI6iqGHKsozW@ac-3jkv1xm-shard-00-00.g7kib4z.mongodb.net:27017,ac-3jkv1xm-shard-00-01.g7kib4z.mongodb.net:27017,ac-3jkv1xm-shard-00-02.g7kib4z.mongodb.net:27017/?ssl=true&replicaSet=atlas-6ppv9n-shard-0&authSource=admin&appName=Cluster0",
    );
    console.log("Connected to MongoDB");

    const result = await Bill.updateMany(
      { reminderSent: { $exists: false } },
      {
        $set: {
          reminderSent: [],
          renewalAlertsStopped: false,
          clientRenewed: false,
        },
      },
    );

    console.log(` Migration complete. Updated ${result.modifiedCount} bills`);
    process.exit(0);
  } catch (error) {
    console.error(" Migration failed:", error);
    process.exit(1);
  }
};

migrate();
