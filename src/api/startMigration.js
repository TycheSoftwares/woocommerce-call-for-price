// src/api/startMigration.js
import apiFetch from '@wordpress/api-fetch';

const startMigration = async () => {
	const r = await apiFetch( {
		path  : '/cfp-pro/v1/migration/start',
		method: 'POST',
	} );
	return r.data ?? r;
};

export default startMigration;
