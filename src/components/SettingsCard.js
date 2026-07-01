/**
 * src/components/SettingsCard.js
 *
 * Shared UI primitives — PGBF-style layout with @wordpress/components.
 *
 * Exports:
 *   SettingsCard  — white card with optional heading + description
 *   SettingsRow   — 280px / 1fr grid row with label, description, and field
 *   HelpTip       — Dashicons question-mark wrapped in WP Tooltip
 *   SaveBar       — WP Button Save / Reset action row
 *   NoticeBar     — Inline dismissible success / error notice
 */
import {
	Button,
	Tooltip,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText   as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import HelpTip from './HelpTip';

export function SettingsCard( { title, description, children } ) {
	return (
		<div style={ {
			background  : '#fff',
			border      : '1px solid #e0e0e0',
			borderRadius: '8px',
			padding     : '24px',
			marginBottom: '16px',
		} }>
			{ title && (
				<Heading level={ 4 } style={ { margin: '0 0 4px' } }>{ title }</Heading>
			) }
			{ description && (
				<Text style={ { color: '#646970', fontSize: '13px', display: 'block', marginBottom: '16px' } }>
					{ description }
				</Text>
			) }
			{ children }
		</div>
	);
}

export function SettingsRow( { label, description, tooltip, htmlFor, children, noBorder = false, notice } ) {
	// If description exists, we hide tooltip entirely (avoids duplicate help text)
	const showTooltip = tooltip && !description;

	return (
		<div style={ {
			display            : 'grid',
			gridTemplateColumns: '280px 1fr',
			gap                : '24px',
			padding            : '20px 0',
			borderBottom       : noBorder ? 'none' : '1px solid #f0f0f0',
			alignItems         : 'start',
		} }>
			<div>
				<div style={ { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: description ? '4px' : 0 } }>
					{ htmlFor ? (
						<label
							htmlFor={ htmlFor }
							style={ { fontWeight: 600, fontSize: '14px', color: '#1d2327', cursor: 'default' } }
						>
							{ label }
						</label>
					) : (
						<span style={ { fontWeight: 600, fontSize: '14px', color: '#1d2327' } }>
							{ label }
						</span>
					) }
					{ /* Tooltip removed from label side – moved to right column */ }
				</div>
				{ description && (
					<span style={ { fontSize: '13px', color: '#646970', lineHeight: 1.5 } }>
						{ description }
					</span>
				) }
			</div>
			<div style={ { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }>
                { showTooltip && <HelpTip text={ tooltip } /> }
                <div style={ { flex: 1, minWidth: '200px', maxWidth: '340px' } }>
                    { children }
                </div>
                { notice }
            </div>
		</div>
	);
}

export function SaveBar( { onSave, onReset, saving, dirty } ) {
	return (
		<HStack
			spacing={ 3 }
			style={ { paddingTop: '4px', justifyContent: 'left', flexWrap: 'wrap' } }
		>
			<Button
				variant="primary"
				type="button"
				onClick={ onSave }
				isBusy={ saving }
				disabled={ saving || ! dirty }
				style={ { width: 'fit-content' } }
			>
				{ saving ? __( 'Saving…', 'woocommerce-call-for-price' ) : __( 'Save changes', 'woocommerce-call-for-price' ) }
			</Button>
			<Button
				variant="secondary"
				type="button"
				onClick={ onReset }
				disabled={ saving }
				style={ { width: 'fit-content' } }
			>
				{ __( 'Reset to defaults', 'woocommerce-call-for-price' ) }
			</Button>
		</HStack>
	);
}

export function NoticeBar( { notice, onDismiss } ) {
	if ( ! notice ) return null;
	const isSuccess = notice.type === 'success';
	return (
		<div
			role="alert"
			style={ {
				display     : 'flex',
				alignItems  : 'center',
				gap         : '10px',
				padding     : '10px 16px',
				borderRadius: '4px',
				marginBottom: '16px',
				fontSize    : '13px',
				borderLeft  : `4px solid ${ isSuccess ? '#1a8d34' : '#d63638' }`,
				background  : isSuccess ? '#f0fdf4' : '#fef2f2',
				color       : isSuccess ? '#166534' : '#991b1b',
			} }
		>
			{ notice.raw
				? <span style={ { flex: 1 } } dangerouslySetInnerHTML={ { __html: notice.message } } />
				: <span style={ { flex: 1 } }>{ notice.message }</span>
			}
			<button
				type="button"
				onClick={ onDismiss }
				aria-label={ __( 'Dismiss', 'woocommerce-call-for-price' ) }
				style={ {
					background: 'none',
					border    : 'none',
					cursor    : 'pointer',
					fontSize  : '14px',
					color     : 'currentColor',
					opacity   : 0.7,
					padding   : 0,
					lineHeight: 1,
				} }
			>
				✕
			</button>
		</div>
	);
}