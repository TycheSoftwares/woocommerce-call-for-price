/**
 * src/index.js
 *
 * Settings SPA entry point.
 * Mounts the React app into #cfp-pro-settings-root.
 */
import { createRoot }       from 'react-dom/client';
import { HashRouter }       from 'react-router-dom';
import App                  from './App';
import { SettingsProvider } from './context/SettingsContext';
import './app.scss';

window.addEventListener( 'load', () => {
	const root = document.getElementById( 'cfp-pro-settings-root' );
	if ( ! root ) {
		console.error( '[CfP Pro] #cfp-pro-settings-root not found.' );
		return;
	}
	createRoot( root ).render(
		<SettingsProvider>
			<HashRouter>
				<App />
			</HashRouter>
		</SettingsProvider>
	);
} );
