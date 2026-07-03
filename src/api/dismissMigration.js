// src/api/dismissMigration.js
import apiFetch from '@wordpress/api-fetch';

const dismissMigration = async () => {
	try {
		await apiFetch( { path: '/cfp-pro/v1/migration/dismiss', method: 'POST' } );
	} catch ( err ) {
		console.error( '[CfP Pro] dismissMigration:', err );
		throw err;
	}
};

export default dismissMigration;
