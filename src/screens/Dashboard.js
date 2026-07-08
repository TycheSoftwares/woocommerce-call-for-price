/**
 * src/screens/Dashboard.js
 *
 * Dashboard — mirrors the PGBF dashboard layout:
 *   • Migration notice (top, full-width)
 *   • Page heading + subtitle
 *   • Two-column: Getting Started checklist | Plugin Summary 2×2 stats
 *   • Quick Tip banner
 *   • Three quick-link cards
 */
import { useState, useEffect } from '@wordpress/element';
import {
	Spinner,
	__experimentalVStack  as VStack,
	__experimentalHeading as Heading,
	__experimentalText    as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSettings }       from '../context/SettingsContext';
import { getDashboardStats } from '../api';

// ── SVG helpers ───────────────────────────────────────────────────────────────

const ICON = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const IconPower  = () => <svg { ...ICON }><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg>;
const IconLayers = () => <svg { ...ICON }><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>;
const IconBox    = () => <svg { ...ICON }><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>;
const IconKey    = () => <svg { ...ICON }><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>;
const IconBook   = () => <svg { ...ICON }><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IconCheck  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconBulb   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const IconInfo   = () => <svg { ...ICON }><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;

// ── Checklist item ────────────────────────────────────────────────────────────

function ChecklistItem( { done, label } ) {
	const accent = 'var(--wp-components-color-accent, var(--wp-admin-theme-color, #2271b1))';
	return (
		<div style={ { display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0' } }>
			<div style={ {
				width          : '22px',
				height         : '22px',
				borderRadius   : '50%',
				flexShrink     : 0,
				display        : 'flex',
				alignItems     : 'center',
				justifyContent : 'center',
				background     : done ? accent : 'transparent',
				border         : `2px solid ${ done ? accent : '#c3c4c7' }`,
				transition     : 'background 0.2s, border-color 0.2s',
			} }>
				{ done && <IconCheck /> }
			</div>
			<span style={ { fontSize: '13px', color: '#1d2327' } }>{ label }</span>
		</div>
	);
}

// ── Plugin summary stat item ──────────────────────────────────────────────────

function StatItem( { Icon, label, value, valueColor = '#1d2327', iconBg = '#f0f6fc', iconColor = '#2271b1' } ) {
	return (
		<div style={ {
			padding     : '16px',
			border      : '1px solid #f0f0f0',
			borderRadius: '6px',
			background  : '#fafafa',
		} }>
			<div style={ { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' } }>
				<div style={ {
					background   : iconBg,
					borderRadius : '6px',
					padding      : '6px',
					display      : 'flex',
					alignItems   : 'center',
					justifyContent: 'center',
					color        : iconColor,
					flexShrink   : 0,
				} }>
					<Icon />
				</div>
				<span style={ { fontSize: '12px', color: '#646970', fontWeight: 500 } }>{ label }</span>
			</div>
			<div style={ { fontSize: '22px', fontWeight: 700, color: valueColor, lineHeight: 1.2 } }>
				{ value }
			</div>
		</div>
	);
}

// ── Quick-link card ───────────────────────────────────────────────────────────

function QuickLinkCard( { Icon, title, description, iconBg, iconColor, href, isExternal = false } ) {
	const linkProps = isExternal ? { target: '_blank', rel: 'noreferrer' } : {};
	return (
		<a
			href={ href }
			{ ...linkProps }
			style={ { textDecoration: 'none', flex: '1 1 180px', minWidth: '160px', display: 'flex' } }
		>
			<div
				className="cfp-pro-quicklink-card"
				style={ {
					display      : 'flex',
					flexDirection: 'column',
					gap          : '8px',
					padding      : '20px',
					border       : '1px solid #e0e0e0',
					borderRadius : '8px',
					background   : '#fff',
					width        : '100%',
					transition   : 'border-color 0.15s, box-shadow 0.15s',
					cursor       : 'pointer',
				} }
				onMouseEnter={ ( e ) => {
					e.currentTarget.style.borderColor = 'var(--wp-components-color-accent, #2271b1)';
					e.currentTarget.style.boxShadow   = '0 2px 8px rgba(34,113,177,.12)';
				} }
				onMouseLeave={ ( e ) => {
					e.currentTarget.style.borderColor = '#e0e0e0';
					e.currentTarget.style.boxShadow   = 'none';
				} }
			>
				<div style={ { display: 'flex', alignItems: 'center', gap: '10px' } }>
					<div style={ {
						background     : iconBg,
						width          : '36px',
						height         : '36px',
						borderRadius   : '8px',
						display        : 'flex',
						alignItems     : 'center',
						justifyContent : 'center',
						color          : iconColor,
						flexShrink     : 0,
					} }>
						<Icon />
					</div>
					<span style={ { fontWeight: 600, fontSize: '14px', color: '#1d2327' } }>{ title }</span>
				</div>
				<span style={ { fontSize: '13px', color: '#646970', lineHeight: 1.5 } }>{ description }</span>
			</div>
		</a>
	);
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function Dashboard() {
	const { settings }             = useSettings();
	const [ dash,        setDash        ] = useState( null );
	const [ dashLoading, setDashLoading ] = useState( true );

	useEffect( () => {
		getDashboardStats()
			.then( setDash )
			.finally( () => setDashLoading( false ) );
	}, [] );

	const general         = settings?.general ?? {};
	const isEnabled       = !! general.enabled;
	const activeTypes     = dash?.active_product_types ?? [];

	const checklistItems = [
		{ done: isEnabled,                      label: __( 'Enable the plugin',                        'woocommerce-call-for-price' ) },
		{ done: activeTypes.length > 0,         label: __( 'Configure at least one product type',      'woocommerce-call-for-price' ) },
	];

	const doneCount = checklistItems.filter( ( i ) => i.done ).length;
	const totalCount = checklistItems.length;
	const percent    = Math.round( ( doneCount / totalCount ) * 100 );
	const allDone    = doneCount === totalCount;

	const accent = 'var(--wp-components-color-accent, var(--wp-admin-theme-color, #2271b1))';

	if ( dashLoading ) {
		return (
			<div style={ { padding: '60px', textAlign: 'center' } }>
				<Spinner style={ { width: 28, height: 28 } } />
			</div>
		);
	}

	return (
		<VStack spacing={ 4 }>

			{ /* ── Two‑column: Getting Started | Plugin Summary ── */ }
			<div style={ { display: 'flex', gap: '20px', alignItems: 'stretch', flexWrap: 'wrap' } }>

				{ /* Getting Started — hidden when all steps complete */ }
				{ ! allDone && (
					<div style={ {
						flex        : '1 1 380px',
						background  : '#fff',
						border      : '1px solid #e0e0e0',
						borderRadius: '8px',
						padding     : '24px',
					} }>
						<span style={ { fontWeight: 700, fontSize: '16px', color: '#1d2327', display: 'block', marginBottom: '12px' } }>
							{ __( 'Getting Started', 'woocommerce-call-for-price' ) }
						</span>

						{ /* Progress label row */ }
						<div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } }>
							<span style={ { fontSize: '13px', color: '#646970' } }>{ doneCount } { __( 'of', 'woocommerce-call-for-price' ) } { totalCount } { __( 'completed', 'woocommerce-call-for-price' ) }</span>
							<span style={ { fontSize: '13px', fontWeight: 600, color: '#1d2327' } }>{ percent }%</span>
						</div>

						{ /* Progress bar */ }
						<div style={ { height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' } }>
							<div style={ {
								height    : '100%',
								width     : `${ percent }%`,
								background: accent,
								borderRadius: '4px',
								transition: 'width 0.4s ease',
							} } />
						</div>

						{ /* Checklist */ }
						<div>
							{ checklistItems.map( ( item, i ) => (
								<ChecklistItem key={ i } done={ item.done } label={ item.label } />
							) ) }
						</div>
					</div>
				) }

				{ /* Plugin Summary — always visible, shows success notice when all done */ }
				<div style={ {
					flex        : '1 1 260px',
					background  : '#fff',
					border      : '1px solid #e0e0e0',
					borderRadius: '8px',
					padding     : '24px',
				} }>
					<span style={ { fontWeight: 700, fontSize: '16px', color: '#1d2327', display: 'block', marginBottom: '16px' } }>
						{ __( 'Plugin Summary', 'woocommerce-call-for-price' ) }
					</span>
					<div style={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } }>
						<StatItem
							Icon={ IconPower }
							label={ __( 'Plugin Status', 'woocommerce-call-for-price' ) }
							value={ isEnabled ? __( 'Enabled', 'woocommerce-call-for-price' ) : __( 'Disabled', 'woocommerce-call-for-price' ) }
							valueColor={ isEnabled ? '#1a8d34' : '#d63638' }
							iconBg={ isEnabled ? '#f0fdf4' : '#fef2f2' }
							iconColor={ isEnabled ? '#1a8d34' : '#d63638' }
						/>
						<StatItem
							Icon={ IconLayers }
							label={ __( 'Active Product Types', 'woocommerce-call-for-price' ) }
							value={ activeTypes.length }
							iconBg="#f0f6fc"
							iconColor="#2271b1"
						/>
					</div>

					{ /* Success notice when all steps are complete */ }
					{ allDone && (
						<div className="cfp-pro-configure-success-border" style={ {
							marginTop: '16px',
							background: '#f0f6fc',
							borderRadius: '6px',
							padding: '12px 16px',
							borderLeft: `4px solid ${ accent }`,
						} }>
							<Text className="cfp-pro-configure-success-msg" style={ { fontWeight: 600, margin: 0, color: accent } }>
								🎉 { __( 'All steps complete! Your plugin is fully configured.', 'woocommerce-call-for-price' ) }
							</Text>
						</div>
					) }
				</div>
			</div>

			{ /* ── Quick Tip ── */ }
			<div style={ {
				display    : 'flex',
				gap        : '14px',
				alignItems : 'flex-start',
				background : '#f0f4ff',
				border     : '1px solid #c7d2f5',
				borderRadius: '8px',
				padding    : '16px 20px',
			} }>
				<div style={ {
					background     : accent,
					borderRadius   : '50%',
					width          : '34px',
					height         : '34px',
					display        : 'flex',
					alignItems     : 'center',
					justifyContent : 'center',
					flexShrink     : 0,
				} }>
					<IconBulb />
				</div>
				<span style={ { fontSize: '13px', color: '#1d2327', lineHeight: 1.7 } }>
					<strong style={ { color: accent } }>{ __( 'Quick Tip:', 'woocommerce-call-for-price' ) }</strong>
					{ __( 'Visit the', 'woocommerce-call-for-price' ) }{ ' ' }
					<a href="#/general" style={ { color: accent } }>{ __( 'General tab', 'woocommerce-call-for-price' ) }</a>
					{ ' ' }{ __( 'to configure global plugin settings. Set per-product-type labels under', 'woocommerce-call-for-price' ) }{ ' ' }
					<a href="#/product-types" style={ { color: accent } }>{ __( 'Product Types', 'woocommerce-call-for-price' ) }</a>.
				</span>
			</div>

			{ /* ── Quick-link cards ── */ }
			<div style={ { display: 'flex', gap: '16px', flexWrap: 'wrap' } }>
				<QuickLinkCard
					Icon={ IconBook }
					title={ __( 'Documentation', 'woocommerce-call-for-price' ) }
					description={ __( 'Learn how to configure Call for Price settings for your store', 'woocommerce-call-for-price' ) }
					iconBg="#f0f6fc"
					iconColor="#2271b1"
					href="https://www.tychesoftwares.com/docs/woocommerce-call-for-price/"
					isExternal
				/>
				<QuickLinkCard
					Icon={ IconLayers }
					title={ __( 'Product Types', 'woocommerce-call-for-price' ) }
					description={ __( 'Configure Call for Price labels for Simple, Variable, Grouped and External products', 'woocommerce-call-for-price' ) }
					iconBg="#f3f0ff"
					iconColor="#7c3aed"
					href="#/product-types"
				/>
				<QuickLinkCard
					Icon={ IconInfo }
					title={ __( 'Get Support', 'woocommerce-call-for-price' ) }
					description={ __( 'Need help? Contact our support team for assistance', 'woocommerce-call-for-price' ) }
					iconBg="#f0fdf4"
					iconColor="#1a8d34"
					href="https://support.tychesoftwares.com/help/2285384554/"
					isExternal
				/>
			</div>

		</VStack>
	);
}
