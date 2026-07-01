/**
 * src/context/SettingsContext.js
 *
 * Global state for the settings SPA.
 * Fetches all settings once on mount via the api/ layer.
 * Exposes saveSection / resetSection helpers used by every screen.
 */
import { createContext, useContext, useState, useEffect, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getSettings, updateSettings, resetSection as apiResetSection } from '../api';

const SettingsContext = createContext( null );

export function SettingsProvider( { children } ) {
	const [ settings, setSettings ] = useState( null );
	const [ loading,  setLoading  ] = useState( true );
	const [ saving,   setSaving   ] = useState( false );
	const [ error,    setError    ] = useState( null );
	const [ notice,   setNotice   ] = useState( null ); // { type: 'success'|'error', message }

	// ── Bootstrap ─────────────────────────────────────────────────────────────

	useEffect( () => {
		getSettings()
			.then( ( data ) => {
				setSettings( data );
				setLoading( false );
			} )
			.catch( ( err ) => {
				setError( err?.message ?? __( 'Failed to load settings.', 'woocommerce-call-for-price' ) );
				setLoading( false );
			} );
	}, [] );

	// ── Save a section ────────────────────────────────────────────────────────

	const saveSection = useCallback( async ( section, data ) => {
		setSaving( true );
		setNotice( null );
		try {
			const updated = await updateSettings( section, data );
			setSettings( updated );
			setNotice( { type: 'success', message: __( 'Settings saved.', 'woocommerce-call-for-price' ) } );
			return updated;
		} catch ( err ) {
			setNotice( { type: 'error', message: err?.message ?? __( 'Failed to save settings.', 'woocommerce-call-for-price' ) } );
			throw err;
		} finally {
			setSaving( false );
		}
	}, [] );

	// ── Reset a section to defaults ───────────────────────────────────────────

	const resetSection = useCallback( async ( section ) => {
		setSaving( true );
		setNotice( null );
		try {
			const updated = await apiResetSection( section );
			setSettings( updated );
			setNotice( { type: 'success', message: __( 'Section reset to defaults.', 'woocommerce-call-for-price' ) } );
			return updated;
		} catch ( err ) {
			setNotice( { type: 'error', message: err?.message ?? __( 'Failed to reset section.', 'woocommerce-call-for-price' ) } );
			throw err;
		} finally {
			setSaving( false );
		}
	}, [] );

	const dismissNotice = useCallback( () => setNotice( null ), [] );

	return (
		<SettingsContext.Provider value={ {
			settings,
			loading,
			saving,
			error,
			notice,
			saveSection,
			resetSection,
			dismissNotice,
		} }>
			{ children }
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	const ctx = useContext( SettingsContext );
	if ( ! ctx ) throw new Error( 'useSettings must be used inside <SettingsProvider>' );
	return ctx;
}
