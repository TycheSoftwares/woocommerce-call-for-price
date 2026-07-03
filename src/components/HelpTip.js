/**
 * src/components/HelpTip.js
 *
 * Standalone help-tip icon — Dashicons question-mark wrapped in WP Tooltip.
 * Matches the PGBF plugin HelpTip pattern.
 */
import { Tooltip } from '@wordpress/components';

export default function HelpTip( { message, text, position = 'bottom', className = '' } ) {
	const tip = message || text;
	if ( ! tip ) return null;

	return (
		<Tooltip text={ tip } position={ position }>
			<span
				className={ `dashicons dashicons-editor-help cfp-pro-help-tip ${ className }` }
				style={ {
					cursor    : 'help',
					color     : '#787c82',
					fontSize  : '1.2em',
					width     : '18px',
					height    : '18px',
					marginRight: '8px',
				} }
			/>
		</Tooltip>
	);
}
