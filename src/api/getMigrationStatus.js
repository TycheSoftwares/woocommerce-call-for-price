// src/api/getMigrationStatus.js
import apiFetch from '@wordpress/api-fetch';

const getMigrationStatus = async () => {
	try {
		const r = await apiFetch( { path: '/cfp-pro/v1/migration/status' } );
		return r.data ?? r;
	} catch ( err ) {
		return err;
	}
};

export default getMigrationStatus;
