// src/api/updateSettings.js
import apiFetch from '@wordpress/api-fetch';
import { clearSettingsCache } from './getSettings';

const updateSettings = async ( section, data ) => {
	const r = await apiFetch( {
		path  : '/cfp-pro/v1/settings',
		method: 'POST',
		data  : { [ section ]: data },
	} );
	clearSettingsCache();
	return r.data ?? r;
};

export default updateSettings;
