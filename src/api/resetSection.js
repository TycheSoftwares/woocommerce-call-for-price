// src/api/resetSection.js
import apiFetch from '@wordpress/api-fetch';
import { clearSettingsCache } from './getSettings';

const resetSection = async ( section ) => {
	const r = await apiFetch( {
		path  : '/cfp-pro/v1/settings/reset',
		method: 'POST',
		data  : { section },
	} );
	clearSettingsCache();
	return r.data ?? r;
};

export default resetSection;
