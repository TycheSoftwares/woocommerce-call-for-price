// src/api/getSettings.js
import apiFetch from '@wordpress/api-fetch';

let cache = null;

const getSettings = async () => {
	if ( cache ) return cache;
	try {
		const r = await apiFetch( { path: '/cfp-pro/v1/settings' } );
		cache = r.data ?? r;
		return cache;
	} catch ( err ) {
		throw err;
	}
};

export const clearSettingsCache = () => { cache = null; };
export default getSettings;
