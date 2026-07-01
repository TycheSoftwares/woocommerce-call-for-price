// src/api/updateProductSettings.js
import apiFetch from '@wordpress/api-fetch';

const updateProductSettings = async ( productId, data ) => {
	const r = await apiFetch( {
		path  : `/cfp-pro/v1/products/${ productId }`,
		method: 'POST',
		data,
	} );
	return r.data ?? r;
};

export default updateProductSettings;
