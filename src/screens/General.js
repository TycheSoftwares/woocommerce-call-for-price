/**
 * src/screens/General.js
 *
 * General settings screen — Lite version.
 * Pro-only options are disabled with inline notices.
 */
import { useState, useEffect }       from '@wordpress/element';
import {
	CheckboxControl,
	SelectControl,
	Button,
	__experimentalInputControl   as InputControl,
	__experimentalVStack         as VStack,
	__experimentalConfirmDialog  as ConfirmDialog,
} from '@wordpress/components';
import { __ }                         from '@wordpress/i18n';
import apiFetch                       from '@wordpress/api-fetch';
import { useForm, Controller }        from 'react-hook-form';
import { useSettings }                from '../context/SettingsContext';
import { SettingsCard, SettingsRow, SaveBar, NoticeBar } from '../components/SettingsCard';
import MultiSelect                 from '../components/MultiSelect';
import { ProInlineNotice }         from '../components/ProNotice';
import { getOptions }                 from '../api';

const CONTROL_WIDTH = { maxWidth: '340px' };

export default function General() {
	const { settings, saving, saveSection, resetSection, notice, dismissNotice } = useSettings();
	const [ isResetOpen,          setIsResetOpen          ] = useState( false );
	const [ isTrackingDialogOpen, setIsTrackingDialogOpen ] = useState( false );
	const [ optionsLoading,       setOptionsLoading       ] = useState( true );
	const [ optionsError,         setOptionsError         ] = useState( false );
	const [ productCats,          setProductCats          ] = useState( [] );
	const [ productTags,          setProductTags          ] = useState( [] );
	const [ products,             setProducts             ] = useState( [] );
	const [ userRoles,            setUserRoles            ] = useState( [] );

	useEffect( () => {
		getOptions()
			.then( ( data ) => {
				if ( ! data || Object.keys( data ).length === 0 ) {
					setOptionsError( true );
				} else {
					setOptionsError( false );
				}
				setProductCats( data?.product_categories ?? [] );
				setProductTags( data?.product_tags       ?? [] );
				setProducts(    data?.products           ?? [] );
				setUserRoles(   data?.user_roles         ?? [] );
			} )
			.catch( () => {
				setOptionsError( true );
			} )
			.finally( () => setOptionsLoading( false ) );
	}, [] );

	const general = settings?.general ?? {};

	const { control, handleSubmit, watch, reset, formState: { isDirty } } = useForm( {
		defaultValues: general,
	} );

	useEffect( () => {
		if ( general && Object.keys( general ).length ) reset( general );
	}, [ settings, reset ] );

	const onSave = handleSubmit( async ( data ) => {
		// Force Pro fields to false/empty to prevent saving them.
		data.per_product_enabled = false;
		data.logged_in_only = [];
		data.button_url = '';
		data.force.for_zero_price_variation = false;
		data.exclude.products = [];
		data.exclude.categories = [];

		await saveSection( 'general', data );
		reset( data );
	} );

	const onReset = async () => {
		setIsResetOpen( false );
		await resetSection( 'general' );
	};

	const resetTracking = async () => {
		try {
			await apiFetch( {
				path   : '/cfp-pro/v1/tracking/reset',
				method : 'POST',
			} );
			dismissNotice();
		} catch ( error ) {
			console.error( 'Failed to reset tracking:', error );
		} finally {
			setIsTrackingDialogOpen( false );
		}
	};

	const byTaxEnabled    = watch( 'force.by_taxonomy.enabled' );
	const byPriceEnabled  = watch( 'force.by_price.enabled' );
	const changeButtonText = watch( 'change_button_text' );

	return (
		<VStack spacing={ 4 }>

			{ /* Options error notice */ }
			{ optionsError && (
				<NoticeBar
					notice={ {
						type: 'error',
						message: __( 'Unable to load product categories, tags, and user roles. Please refresh the page or contact support.', 'woocommerce-call-for-price' ),
					} }
					onDismiss={ () => setOptionsError( false ) }
				/>
			) }

			<NoticeBar notice={ notice } onDismiss={ dismissNotice } />

			{ /* ── Plugin status ── */ }
			<SettingsCard title={ __( 'Plugin Status', 'woocommerce-call-for-price' ) }>
				{ /* Enable Plugin – Present */ }
				<SettingsRow
					label={ __( 'Enable Plugin', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Turn Call for Price Pro on or off for your entire store.', 'woocommerce-call-for-price' ) }
				>
					<Controller name="enabled" control={ control } render={ ( { field } ) => (
						<CheckboxControl
							checked={ !! field.value }
							onChange={ field.onChange }
						/>
					) } />
				</SettingsRow>

				{ /* Per-product overrides – PRO only */ }
				<SettingsRow
					label={ __( 'Per-product overrides', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Allow Call for Price to be overridden on individual products.', 'woocommerce-call-for-price' ) }
				>
					<div style={ { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }>
						<Controller name="per_product_enabled" control={ control } render={ ( { field } ) => (
							<CheckboxControl
								checked={ false }
								onChange={ () => {} }
								disabled
							/>
						) } />
						<ProInlineNotice />
					</div>
				</SettingsRow>

				{ /* Limit Call for Price to user roles – PRO only */ }
				<SettingsRow
					label={ __( 'Limit Call for Price to user roles', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Only the selected roles will see Call for Price. Leave empty to show it to everyone, including guests.', 'woocommerce-call-for-price' ) }
					noBorder
					notice={ <ProInlineNotice /> }
				>
					<Controller name="logged_in_only" control={ control } render={ ( { field } ) => (
						<MultiSelect
							options={ userRoles }
							value={ [] }
							onChange={ () => {} }
							placeholder={ __( 'All users — leave empty for everyone…', 'woocommerce-call-for-price' ) }
							isLoading={ optionsLoading }
							isDisabled
						/>
					) } />
				</SettingsRow>
			</SettingsCard>

			{ /* ── Display options ── */ }
			<SettingsCard title={ __( 'Display Options', 'woocommerce-call-for-price' ) }>
				{ /* Sale badge – Present */ }
				<SettingsRow
					label={ __( 'Hide the WooCommerce sale badge', 'woocommerce-call-for-price' ) }
					tooltip={ __( "Hide the 'Sale' badge on products that show Call for Price.", 'woocommerce-call-for-price' ) }
				>
					<Controller name="hide_sale_tag" control={ control } render={ ( { field } ) => (
						<CheckboxControl
							checked={ !! field.value }
							onChange={ field.onChange }
						/>
					) } />
				</SettingsRow>

				{ /* Variable product price range – Present */ }
				<SettingsRow
					label={ __( 'Variable product price range', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Choose how the price range is shown on variable products: Hide range / Show range / Hide range with CSS.', 'woocommerce-call-for-price' ) }
				>
					<Controller name="hide_main_variable_price" control={ control } render={ ( { field } ) => (
						<SelectControl
							value={ field.value }
							onChange={ field.onChange }
							options={ [
								{ value: 'no',           label: __( 'Show range',          'woocommerce-call-for-price' ) },
								{ value: 'yes',          label: __( 'Hide range',          'woocommerce-call-for-price' ) },
								{ value: 'yes_with_css', label: __( 'Hide range with CSS', 'woocommerce-call-for-price' ) },
							] }
							style={ CONTROL_WIDTH }
						/>
					) } />
				</SettingsRow>

				{ /* Force variation price – Present */ }
				<SettingsRow
					label={ __( 'Force variation price', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Always show the variation price on the single product page.', 'woocommerce-call-for-price' ) }
				>
					<Controller name="force_variation_price" control={ control } render={ ( { field } ) => (
						<CheckboxControl
							checked={ !! field.value }
							onChange={ field.onChange }
						/>
					) } />
				</SettingsRow>

				{ /* Hide 'Add to Cart' on variations – Present */ }
				<SettingsRow
					label={ __( "Hide 'Add to Cart' on variations", 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Hide the disabled Add to Cart button on variations with no price.', 'woocommerce-call-for-price' ) }
				>
					<Controller name="hide_variations_atc_button" control={ control } render={ ( { field } ) => (
						<CheckboxControl
							checked={ !! field.value }
							onChange={ field.onChange }
						/>
					) } />
				</SettingsRow>

				{ /* Show stock status – Present */ }
				<SettingsRow
					label={ __( 'Show stock status for empty priced products', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Display the stock availability (e.g. In stock / Out of stock) in place of the price for products showing Call for Price.', 'woocommerce-call-for-price' ) }
					noBorder
				>
					<Controller name="show_stock_for_empty_price" control={ control } render={ ( { field } ) => (
						<CheckboxControl
							checked={ !! field.value }
							onChange={ field.onChange }
						/>
					) } />
				</SettingsRow>
			</SettingsCard>

			{ /* ── Shop & category page button ── */ }
			<SettingsCard title={ __( 'Shop & category page button', 'woocommerce-call-for-price' ) }>
				{ /* Customise button text – Present */ }
				<SettingsRow
					label={ __( 'Customise button text', 'woocommerce-call-for-price' ) }
					tooltip={ __( "Replace the default 'Read more' button on shop/category pages with a custom label for Call for Price products.", 'woocommerce-call-for-price' ) }
				>
					<Controller name="change_button_text" control={ control } render={ ( { field } ) => (
						<CheckboxControl
							checked={ !! field.value }
							onChange={ field.onChange }
						/>
					) } />
				</SettingsRow>

				{ /* Button text – Present (only if change_button_text enabled) */ }
				{ changeButtonText && (
					<SettingsRow
						label={ __( 'Button text', 'woocommerce-call-for-price' ) }
						htmlFor="general-btn-text"
						tooltip={ __( 'Set the text for button on shop/category pages for Call for Price products.', 'woocommerce-call-for-price' ) }
					>
						<Controller name="button_text" control={ control } render={ ( { field } ) => (
							<InputControl
								id="general-btn-text"
								value={ field.value ?? '' }
								onChange={ field.onChange }
								placeholder={ __( "e.g. 'Request Price' or 'Enquire Now'", 'woocommerce-call-for-price' ) }
								style={ CONTROL_WIDTH }
							/>
						) } />
					</SettingsRow>
				) }

				{ /* Button link – PRO only */ }
				<SettingsRow
					label={ __( 'Button link', 'woocommerce-call-for-price' ) }
					htmlFor="general-btn-url"
					tooltip={ __( 'Where the button takes customers when clicked. Use a contact page, enquiry form, or external URL.', 'woocommerce-call-for-price' ) }
					notice={ <ProInlineNotice /> }
				>
					<Controller name="button_url" control={ control } render={ ( { field } ) => (
						<InputControl
							id="general-btn-url"
							type="url"
							value={ field.value ?? '' }
							onChange={ field.onChange }
							placeholder="https://example.com"
							style={ CONTROL_WIDTH }
							disabled
						/>
					) } />
				</SettingsRow>

				{ /* Hide button – Present */ }
				<SettingsRow
					label={ __( 'Hide button', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Hides the Read More / Add to Cart button on shop and category listings for Call for Price products.', 'woocommerce-call-for-price' ) }
					noBorder
				>
					<Controller name="hide_button" control={ control } render={ ( { field } ) => (
						<CheckboxControl
							checked={ !! field.value }
							onChange={ field.onChange }
						/>
					) } />
				</SettingsRow>
			</SettingsCard>

			{ /* ── Auto-apply Call for Price ── */ }
			<SettingsCard
				title={ __( 'Auto-apply Call for Price', 'woocommerce-call-for-price' ) }
				description={ __( 'By default, the Call for Price label only appears on products with no price set. Use the options below to extend this behaviour and show the Call for Price label on additional products — even if they already have a price set.', 'woocommerce-call-for-price' ) }
			>
				{ /* Apply to All Products – Present */ }
				<SettingsRow
					label={ __( 'Apply to All Products', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Force every product in your store to display the Call for Price label, regardless of its price.', 'woocommerce-call-for-price' ) }
				>
					<Controller name="force.all_products" control={ control } render={ ( { field } ) => (
						<CheckboxControl checked={ !! field.value } onChange={ field.onChange } />
					) } />
				</SettingsRow>

				{ /* Apply to out-of-stock products – Present */ }
				<SettingsRow
					label={ __( 'Apply to out-of-stock products', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Show the Call for Price label on products that cannot be purchased due to Out of Stock or On Backorder status.', 'woocommerce-call-for-price' ) }
				>
					<Controller name="force.out_of_stock" control={ control } render={ ( { field } ) => (
						<CheckboxControl checked={ !! field.value } onChange={ field.onChange } />
					) } />
				</SettingsRow>

				{ /* Apply to products with a price of zero – Present */ }
				<SettingsRow
					label={ __( 'Apply to products with a price of zero', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Show Call for Price on products whose regular price is 0.', 'woocommerce-call-for-price' ) }
				>
					<Controller name="force.for_zero_price" control={ control } render={ ( { field } ) => (
						<CheckboxControl checked={ !! field.value } onChange={ field.onChange } />
					) } />
				</SettingsRow>

				{ /* Enable custom Call for Price text for variations – PRO only */ }
				<SettingsRow
					label={ __( 'Enable custom Call for Price text for variations', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Show Call for Price on variations whose price is 0.', 'woocommerce-call-for-price' ) }
				>
					<div style={ { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }>
						<Controller name="force.for_zero_price_variation" control={ control } render={ ( { field } ) => (
							<CheckboxControl
								checked={ false }
								onChange={ () => {} }
								disabled
							/>
						) } />
						<ProInlineNotice />
					</div>
				</SettingsRow>

				{ /* Show on Products With a Price Set – Present */ }
				<SettingsRow
					label={ __( 'Show on Products With a Price Set', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Display the Call for Price label even when a regular price exists on the product.', 'woocommerce-call-for-price' ) }
				>
					<Controller name="force.for_all_products_text" control={ control } render={ ( { field } ) => (
						<CheckboxControl checked={ !! field.value } onChange={ field.onChange } />
					) } />
				</SettingsRow>

				{ /* Restrict by category or tag – Present */ }
				<SettingsRow
					label={ __( 'Restrict by category or tag', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Only apply to products in the selected categories or tags below.', 'woocommerce-call-for-price' ) }
				>
					<Controller name="force.by_taxonomy.enabled" control={ control } render={ ( { field } ) => (
						<CheckboxControl checked={ !! field.value } onChange={ field.onChange } />
					) } />
				</SettingsRow>

				{ byTaxEnabled && (
					<>
						{ /* Product categories – Present */ }
						<SettingsRow
							label={ __( 'Product categories', 'woocommerce-call-for-price' ) }
							tooltip={ __( 'Select categories to force Call for Price.', 'woocommerce-call-for-price' ) }
						>
							<Controller name="force.by_taxonomy.product_cat" control={ control } render={ ( { field } ) => (
								<MultiSelect
									options={ productCats }
									value={ field.value ?? [] }
									onChange={ field.onChange }
									placeholder={ __( 'Select categories…', 'woocommerce-call-for-price' ) }
									isLoading={ optionsLoading }
									style={ CONTROL_WIDTH }
								/>
							) } />
						</SettingsRow>

						{ /* Product tags – Present */ }
						<SettingsRow
							label={ __( 'Product tags', 'woocommerce-call-for-price' ) }
							tooltip={ __( 'Select tags to force Call for Price.', 'woocommerce-call-for-price' ) }
						>
							<Controller name="force.by_taxonomy.product_tag" control={ control } render={ ( { field } ) => (
								<MultiSelect
									options={ productTags }
									value={ field.value ?? [] }
									onChange={ field.onChange }
									placeholder={ __( 'Select tags…', 'woocommerce-call-for-price' ) }
									isLoading={ optionsLoading }
									style={ CONTROL_WIDTH }
								/>
							) } />
						</SettingsRow>
					</>
				) }

				{ /* Restrict by price range – Present */ }
				<SettingsRow
					label={ __( 'Restrict by price range', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Only apply to products priced within the range below.', 'woocommerce-call-for-price' ) }
				>
					<Controller name="force.by_price.enabled" control={ control } render={ ( { field } ) => (
						<CheckboxControl checked={ !! field.value } onChange={ field.onChange } />
					) } />
				</SettingsRow>

				{ byPriceEnabled && (
					<>
						{ /* Min price – Present */ }
						<SettingsRow
							label={ __( 'Minimum price', 'woocommerce-call-for-price' ) }
							htmlFor="general-force-min"
							tooltip={ __( "Lowest regular price to include (in your store's currency, before tax).", 'woocommerce-call-for-price' ) }
						>
							<Controller name="force.by_price.min" control={ control } render={ ( { field } ) => (
								<InputControl
									id="general-force-min"
									type="number"
									min="0"
									step="0.01"
									value={ field.value ?? 0 }
									onChange={ ( val ) => field.onChange( parseFloat( val ) || 0 ) }
									style={ CONTROL_WIDTH }
								/>
							) } />
						</SettingsRow>

						{ /* Max price – Present */ }
						<SettingsRow
							label={ __( 'Maximum price', 'woocommerce-call-for-price' ) }
							htmlFor="general-force-max"
							tooltip={ __( "Highest regular price to include (in your store's currency, before tax).", 'woocommerce-call-for-price' ) }
							noBorder
						>
							<Controller name="force.by_price.max" control={ control } render={ ( { field } ) => (
								<InputControl
									id="general-force-max"
									type="number"
									min="0"
									step="0.01"
									value={ field.value ?? 0 }
									onChange={ ( val ) => field.onChange( parseFloat( val ) || 0 ) }
									style={ CONTROL_WIDTH }
								/>
							) } />
						</SettingsRow>
					</>
				) }
			</SettingsCard>

			{ /* ── Exclusions – PRO only ── */ }
			<SettingsCard
				title={ __( 'Exclusions', 'woocommerce-call-for-price' ) }
				description={ __( 'Products and categories listed here will never show Call for Price, even if they match a rule above.', 'woocommerce-call-for-price' ) }
			>
				{ /* Exclude products – PRO only */ }
				<SettingsRow
					label={ __( 'Exclude products', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Products excluded from Call for Price even when force rules are active.', 'woocommerce-call-for-price' ) }
					notice={ <ProInlineNotice /> }
				>
					<Controller name="exclude.products" control={ control } render={ ( { field } ) => (
						<MultiSelect
							options={ products }
							value={ [] }
							onChange={ () => {} }
							placeholder={ __( 'Select products to exclude…', 'woocommerce-call-for-price' ) }
							isLoading={ optionsLoading }
							isDisabled
						/>
					) } />
				</SettingsRow>

				{ /* Exclude categories – PRO only */ }
				<SettingsRow
					label={ __( 'Exclude categories', 'woocommerce-call-for-price' ) }
					tooltip={ __( 'Categories excluded from Call for Price even when force rules are active.', 'woocommerce-call-for-price' ) }
					noBorder
					notice={ <ProInlineNotice /> }
				>
					<Controller name="exclude.categories" control={ control } render={ ( { field } ) => (
						<MultiSelect
							options={ productCats }
							value={ [] }
							onChange={ () => {} }
							placeholder={ __( 'Select categories to exclude…', 'woocommerce-call-for-price' ) }
							isLoading={ optionsLoading }
							isDisabled
						/>
					) } />
				</SettingsRow>
			</SettingsCard>

			{ /* ── Reset Usage Tracking ── */ }
			<SettingsCard
				title={ __( 'Reset Usage Tracking', 'woocommerce-call-for-price' ) }
				description={ __( 'Clear all stored usage tracking data for this plugin.', 'woocommerce-call-for-price' ) }
			>
				<SettingsRow label={ __( 'Reset Tracking Data', 'woocommerce-call-for-price' ) } noBorder>
					<Button
						variant="secondary"
						type="button"
						disabled={ saving }
						onClick={ () => setIsTrackingDialogOpen( true ) }
						style={ { width: 'fit-content' } }
					>
						{ __( 'Reset Usage Tracking', 'woocommerce-call-for-price' ) }
					</Button>
				</SettingsRow>
			</SettingsCard>

			<SaveBar
				onSave={ onSave }
				onReset={ () => setIsResetOpen( true ) }
				saving={ saving }
				dirty={ isDirty }
			/>

			<NoticeBar notice={ notice } onDismiss={ dismissNotice } />

			{ isResetOpen && (
				<ConfirmDialog
					onConfirm={ onReset }
					onCancel={ () => setIsResetOpen( false ) }
				>
					{ __( 'Reset General settings to defaults? This cannot be undone.', 'woocommerce-call-for-price' ) }
				</ConfirmDialog>
			) }

			{ isTrackingDialogOpen && (
				<ConfirmDialog
					onConfirm={ resetTracking }
					onCancel={ () => setIsTrackingDialogOpen( false ) }
				>
					{ __( 'Are you sure you want to reset all usage tracking data?', 'woocommerce-call-for-price' ) }
				</ConfirmDialog>
			) }
		</VStack>
	);
}