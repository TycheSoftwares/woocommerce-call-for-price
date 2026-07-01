// src/api/getProductSettings.js
import apiFetch from '@wordpress/api-fetch';

const getProductSettings = async ( productId ) => {
    try {
        const r = await apiFetch( { path: `/cfp-pro/v1/products/${ productId }` } );
        return r.data ?? r;
    } catch ( err ) {
        throw err;
    }
};

export default getProductSettings;
