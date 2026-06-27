require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/error.middleware');
const User = require('./modules/users/user.model');
const { ROLES } = require('./constants/roles');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const clientRoutes = require('./modules/clients/client.routes');
const billRoutes = require('./modules/bills/bill.routes');
const pdfRoutes = require('./modules/pdf/pdf.routes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/pdf', pdfRoutes);

app.use(errorHandler);

const createDefaultSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({ role: ROLES.SUPERADMIN });
    if (!existingSuperAdmin) {
      const superAdmin = new User({
        name: 'Super Admin',
        email: 'admin@cloudedata.com',
        password: 'Admin@123',
        role: ROLES.SUPERADMIN,
      });
      await superAdmin.save();
      console.log('Default superadmin created: admin@cloudedata.com / Admin@123');
    }
  } catch (error) {
    console.error('Error creating default superadmin:', error.message);
  }
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await createDefaultSuperAdmin();
});
