// src/api/getOptions.js
import apiFetch from '@wordpress/api-fetch';

const getOptions = async () => {
	try {
		const r = await apiFetch( { path: '/cfp-pro/v1/options' } );
		return r.data ?? r;
	} catch ( err ) {
		throw err;
	}
};

export default getOptions;
