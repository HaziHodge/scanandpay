const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.argv[2] });

async function resetPassword() {
  const hash = await bcrypt.hash('password123', 12);
  await pool.query(
    'UPDATE venues SET password_hash = $1 WHERE owner_email = $2',
    [hash, 'admin@elliguria.cl']
  );
  console.log('Password reset successfully');
  await pool.end();
}

resetPassword().catch(console.error);
