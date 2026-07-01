// src/api/getDashboardStats.js
import apiFetch from '@wordpress/api-fetch';

const getDashboardStats = async () => {
	try {
		const r = await apiFetch( { path: '/cfp-pro/v1/dashboard' } );
		return r.data ?? r;
	} catch ( err ) {
		console.error( '[CfP Pro] getDashboardStats:', err );
		throw err;
	}
};

export default getDashboardStats;
