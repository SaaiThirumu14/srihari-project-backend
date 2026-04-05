const { sequelize } = require('./config/db');

async function cleanup() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const [results] = await sequelize.query('SHOW INDEX FROM Users');
        
        // Group indexes by column
        const duplicateIndexes = results.filter(idx => 
            idx.Key_name !== 'PRIMARY' && 
            (idx.Key_name.includes('_') || results.some(other => other.Key_name !== idx.Key_name && other.Column_name === idx.Column_name && other.Key_name.length < idx.Key_name.length))
        );

        console.log(`Found ${duplicateIndexes.length} potential duplicate indexes.`);

        for (const idx of duplicateIndexes) {
            console.log(`Dropping index: ${idx.Key_name}`);
            try {
                await sequelize.query(`ALTER TABLE Users DROP INDEX \`${idx.Key_name}\``);
            } catch (err) {
                console.error(`Failed to drop ${idx.Key_name}:`, err.message);
            }
        }

        console.log('Cleanup complete.');
    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        process.exit();
    }
}

cleanup();
