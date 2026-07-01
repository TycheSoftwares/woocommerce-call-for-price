/**
 * src/components/MigrationNotice.js
 *
 * Per-product data migration notice — PGBF-style layout.
 * Polls GET /cfp-pro/v1/migration/status every 3 s while running.
 *
 * States:
 *   none     — nothing to migrate (fresh install)   → renders null
 *   pending  — products detected, not yet started   → Start CTA
 *   running  — Action Scheduler batch in progress   → live progress bar
 *   complete — all migrated                         → success + dismiss
 *   partial  — completed with some failures         → warning + dismiss
 */
import { useState, useEffect, useCallback } from '@wordpress/element';
import {
	Button,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { getMigrationStatus, startMigration, dismissMigration } from '../api';

const POLL_MS = 3000;

function ProgressBar( { percent } ) {
	return (
		<div style={ {
			height      : '8px',
			background  : '#e0e0e0',
			borderRadius: '4px',
			overflow    : 'hidden',
			margin      : '8px 0',
		} }>
			<div style={ {
				height    : '100%',
				width     : `${ Math.min( percent, 100 ) }%`,
				background: 'var(--wp-components-color-accent, var(--wp-admin-theme-color, #2271b1))',
				transition: 'width 0.5s ease',
			} } />
		</div>
	);
}

export default function MigrationNotice() {
	const [ status,    setStatus    ] = useState( null );
	const [ starting,  setStarting  ] = useState( false );
	const [ dismissed, setDismissed ] = useState( false );

	const fetchStatus = useCallback( async () => {
		try {
       		const data = await getMigrationStatus();
        	if (data) setStatus(data);
		} catch (err) {
			console.error( 'Failed to fetch migration status:', err );
			setStatus(null);
		}
	}, [] );

	useEffect( () => { fetchStatus(); }, [ fetchStatus ] );

	useEffect( () => {
		if ( status?.status !== 'running' ) return;
		const id = setInterval( fetchStatus, POLL_MS );
		return () => clearInterval( id );
	}, [ status?.status, fetchStatus ] );

	const handleStart = async () => {
		setStarting( true );
		try {
			const data = await startMigration();
			if ( data ) setStatus( data );
		} finally {
			setStarting( false );
		}
	};

	const handleDismiss = async () => {
		setDismissed( true );
		await dismissMigration();
	};

	if ( dismissed )                                    return null;
	if ( status === null )                              return null;
	if ( status.dismissed )                             return null;
	if ( status.status === 'none' && ! status.total )   return null;

	const { status: mStatus, total = 0, done = 0, failed = 0, percent = 0 } = status;

	const isNone     = mStatus === 'none' || mStatus === 'pending';
	const isRunning  = mStatus === 'running';
	const isComplete = mStatus === 'complete';
	const isPartial  = mStatus === 'partial';

	return (
		<div className={ `cfp-pro-migration-notice${ isComplete ? ' is-complete' : '' }` }>
			<h3>{ __( 'Data Migration', 'woocommerce-call-for-price' ) }</h3>

			{ isNone && (
				<p>
					{ sprintf(
					/* translators: %d: number of products */
					_n(
						'%d product needs to be migrated to the new consolidated format. This runs in the background and does not affect your store. Original data is never deleted.',
						'%d products need to be migrated to the new consolidated format. This runs in the background and does not affect your store. Original data is never deleted.',
						total,
						'woocommerce-call-for-price'
					),
					total
				) }
				</p>
			) }

			{ isRunning && (
				<>
					<p>{ __( 'Migration in progress…', 'woocommerce-call-for-price' ) } { percent }% { __( 'complete', 'woocommerce-call-for-price' ) } ({ done } / { total })</p>
					<ProgressBar percent={ percent } />
					{ failed > 0 && (
						<Text style={ { color: '#d63638', fontSize: '12px', display: 'block', marginTop: '4px' } }>
							{ sprintf(
							/* translators: %d: number of products */
							_n(
								'%d product failed — check WooCommerce logs.',
								'%d products failed — check WooCommerce logs.',
								failed,
								'woocommerce-call-for-price'
							),
							failed
						) }
						</Text>
					) }
				</>
			) }

			{ isComplete && (
				<p>{ '✔ ' }{ sprintf(
					/* translators: %d: number of products */
					__( 'Migration complete. All %d products have been migrated successfully.', 'woocommerce-call-for-price' ),
					total
				) }</p>
			) }

			{ isPartial && (
				<p>
					{ '⚠ ' }{ sprintf(
						/* translators: 1: error count, 2: migrated count, 3: total count */
						__( 'Migration completed with %1$d error(s). %2$d of %3$d products migrated. Check', 'woocommerce-call-for-price' ),
						failed, done, total
					) }{ ' ' }
					<a
						href={ `${ window?.cfpProData?.adminUrl ?? '/wp-admin/' }admin.php?page=wc-status&tab=logs` }
						target="_blank"
						rel="noreferrer"
					>
						{ __( 'WooCommerce → Status → Logs (channel: cfp-migration)', 'woocommerce-call-for-price' ) }
					</a>{ ' ' }
					{ __( 'for details. Failed products retain their original meta and continue to work.', 'woocommerce-call-for-price' ) }
				</p>
			) }

			<div className="cfp-pro-migration-notice__actions">
				{ ( isNone || isPartial ) && (
					<Button
						variant="primary"
						type="button"
						onClick={ handleStart }
						isBusy={ starting }
						disabled={ starting }
						style={ { width: 'fit-content' } }
					>
						{ starting ? __( 'Starting…', 'woocommerce-call-for-price' ) : __( 'Start Background Migration', 'woocommerce-call-for-price' ) }
					</Button>
				) }
				{ ( isComplete || isPartial ) && (
					<Button
						variant="secondary"
						type="button"
						onClick={ handleDismiss }
						style={ { width: 'fit-content' } }
					>
						{ __( 'Dismiss', 'woocommerce-call-for-price' ) }
					</Button>
				) }
			</div>
		</div>
	);
}
