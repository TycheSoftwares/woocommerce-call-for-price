/**
 * src/ProductMetabox.js
 *
 * Per-product Call for Price metabox.
 *
 * Fixes applied:
 *  1. `enabled` uses CheckboxControl; converts 'yes'/'no' string from API to boolean.
 *  2. Custom Value field renamed from call_type_value → custom_value to match PHP schema.
 *  3. 'Inherit from global settings' removed from call type options.
 *  4. Request Forms and Shortcode only visible when call type is 'text'.
 */

import { useState, useEffect } from '@wordpress/element';
import { useForm, Controller }  from 'react-hook-form';
import {
	Card,
	CardBody,
	Button,
	CheckboxControl,
	SelectControl,
	TextareaControl,
	TextControl,
	__experimentalInputControl   as InputControl,
	__experimentalVStack         as VStack,
	__experimentalHeading        as Heading,
	__experimentalText           as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getProductSettings, updateProductSettings } from './api';
import HelpTip from './components/HelpTip';

// ── Default values (restored from old PHP metabox) ──
const DEFAULT_VALUES = {
	enabled          : false,
	call_type        : 'text',
	custom_value     : '',
	whatsapp_template: __( 'Hi, I’m interested in this product: {product_name} from {store_name}. Could you please share the price and more details?', 'woocommerce-call-for-price' ),
	email_subject    : __( 'Price inquiry for {product_name} on {store_name}', 'woocommerce-call-for-price' ),
	email_content    : __( "Hello,\n\nI’m interested in the following product listed on {store_name}:\n Product: {product_name}\n Link: {product_url}\n\nCould you please provide the price and any additional details?\nThank you!", 'woocommerce-call-for-price' ),
	text_all_views   : '<strong>' + __( 'Call for Price', 'woocommerce-call-for-price' ) + '</strong>',
	request_forms    : 'none',
	shortcode        : '',
};

function SettingRow( { label, helpTip, description, children, noBorder = false } ) {
	return (
		<div style={ {
			display            : 'grid',
			gridTemplateColumns: '220px 1fr',
			gap                : '24px',
			padding            : '16px 0',
			borderBottom       : noBorder ? 'none' : '1px solid #f0f0f0',
			alignItems         : 'start',
		} }>
			<div>
				<Text weight={ 600 } style={ { display: 'block', marginBottom: '4px' } }>
					{ label }
				</Text>
				{ description && (
					<Text variant="muted" style={ { fontSize: '12px', marginTop: '4px' } }>
						{ description }
					</Text>
				) }
			</div>
			<div style={ { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }>
				{ helpTip && <HelpTip message={ helpTip } /> }
				<div style={ { flex: 1, minWidth: '200px', maxWidth: '400px' } }>
					{ children }
				</div>
			</div>
		</div>
	);
}

// ── Constants ─────────────────────────────────────────────────────────────────

// 'inherit' removed — product-level must always pick an explicit call type.
const CALL_TYPES = [
	{ value: 'text',        label: __( 'Text message',        'woocommerce-call-for-price' ) }, // was 'Text (HTML supported)'
	{ value: 'phone',       label: __( 'Phone call',          'woocommerce-call-for-price' ) }, // was 'Phone Call'
	{ value: 'whatsapp',    label: __( 'WhatsApp',            'woocommerce-call-for-price' ) },
	{ value: 'email',       label: __( 'Email',               'woocommerce-call-for-price' ) },
	{ value: 'custom_link', label: __( 'Custom link',         'woocommerce-call-for-price' ) }, // was 'Custom Link'
];

const REQUEST_FORMS = [
	{ value: 'none',          label: __( 'None',           'woocommerce-call-for-price' ) },
	{ value: 'contact-form7', label: __( 'Contact Form 7', 'woocommerce-call-for-price' ) },
	{ value: 'gravity-form',  label: __( 'Gravity Forms',  'woocommerce-call-for-price' ) }, // fixed plural
	{ value: 'other-form',    label: __( 'Other',          'woocommerce-call-for-price' ) }, // was 'Other Forms'
];

// Helper to get dynamic label + description for contact details
const getContactDetailsConfig = ( callType ) => {
	switch ( callType ) {
		case 'phone':
			return {
				label: __( 'Phone number', 'woocommerce-call-for-price' ),
				type: 'tel',
				placeholder: __( '+44 20 1234 5678', 'woocommerce-call-for-price' ),
				help: __( 'Include the country code in international format (e.g. +44 20 1234 5678).', 'woocommerce-call-for-price' ),
			};
		case 'whatsapp':
			return {
				label: __( 'WhatsApp number', 'woocommerce-call-for-price' ),
				type: 'tel',
				placeholder: __( '+44 7700 900123', 'woocommerce-call-for-price' ),
				help: __( 'Include the country code in international format (e.g. +44 7700 900123). WhatsApp links require this exact format.', 'woocommerce-call-for-price' ),
			};
		case 'email':
			return {
				label: __( 'Email address', 'woocommerce-call-for-price' ),
				type: 'email',
				placeholder: __( 'enquiries@example.com', 'woocommerce-call-for-price' ),
				help: __( 'Where customer enquiries are sent.', 'woocommerce-call-for-price' ),
			};
		case 'custom_link':
			return {
				label: __( 'Destination URL', 'woocommerce-call-for-price' ),
				type: 'url',
				placeholder: __( 'https://example.com/contact', 'woocommerce-call-for-price' ),
				help: __( 'Where customers go when they tap the Call for Price button. Must start with https://', 'woocommerce-call-for-price' ),
			};
		default:
			return {
				label: __( 'Contact details', 'woocommerce-call-for-price' ),
				type: 'text',
				placeholder: '',
				help: __( 'Phone number, WhatsApp number, email address, or URL — depending on the contact channel selected above.', 'woocommerce-call-for-price' ),
			};
	}
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductMetabox( { productId } ) {
	const [ loading, setLoading ] = useState( true );
	const [ saving,  setSaving  ] = useState( false );
	const [ notice,  setNotice  ] = useState( null );

	const { control, getValues, reset, watch, setValue } = useForm( {
		defaultValues: DEFAULT_VALUES,
	} );

	// Remembers the unsaved value typed for each contact channel, so switching
	// the channel selector back and forth (without saving) restores whatever
	// was there per-channel instead of leaking one channel's value into another.
	const [ valuesByType, setValuesByType ] = useState( {} );

	const callType    = watch( 'call_type' );
	const customValue = watch( 'custom_value' );
	const reqForm     = watch( 'request_forms' );
	const contactConfig = getContactDetailsConfig( callType );

	const handleCallTypeChange = ( newCallType ) => {
		setValuesByType( ( prev ) => ( { ...prev, [ callType ]: customValue } ) );
		setValue( 'call_type', newCallType, { shouldDirty: true } );
		setValue( 'custom_value', valuesByType[ newCallType ] ?? '', { shouldDirty: true } );
	};

	// ── Load settings from REST API ───────────────────────────────────────────

	useEffect( () => {
		if ( ! productId ) {
			reset( DEFAULT_VALUES );
			setValuesByType( { [ DEFAULT_VALUES.call_type ]: DEFAULT_VALUES.custom_value } );
			setLoading( false );
			return;
		}
		getProductSettings( productId )
			.then( ( data ) => {
				if ( data && Object.keys( data ).length ) {
					const merged = {
						enabled          : data.enabled === 'yes' || data.enabled === true,
						call_type        : ( ! data.call_type || data.call_type === 'inherit' ) ? 'text' : data.call_type,
						custom_value     : data.custom_value || DEFAULT_VALUES.custom_value,
						whatsapp_template: data.whatsapp_template || DEFAULT_VALUES.whatsapp_template,
						email_subject    : data.email_subject || DEFAULT_VALUES.email_subject,
						email_content    : data.email_content || DEFAULT_VALUES.email_content,
						text_all_views   : data.text_all_views || DEFAULT_VALUES.text_all_views,
						request_forms    : data.request_forms || DEFAULT_VALUES.request_forms,
						shortcode        : data.shortcode || DEFAULT_VALUES.shortcode,
					};
					reset( merged );
					setValuesByType( { [ merged.call_type ]: merged.custom_value } );
				} else {
					reset( DEFAULT_VALUES );
					setValuesByType( { [ DEFAULT_VALUES.call_type ]: DEFAULT_VALUES.custom_value } );
				}
			} )
			.catch( ( error ) => {
				console.error( 'Failed to load product settings:', error );
				setNotice( {
					type: 'error',
					message: __( 'Failed to load settings. Please refresh the page.', 'woocommerce-call-for-price' ),
				} );
				reset( DEFAULT_VALUES );
				setValuesByType( { [ DEFAULT_VALUES.call_type ]: DEFAULT_VALUES.custom_value } );
			} )
			.finally( () => setLoading( false ) );
	}, [ productId, reset ] );

	// ── Save ──────────────────────────────────────────────────────────────────

	const onSave = async () => {
		const data = getValues();
		setSaving( true );
		setNotice( null );
		try {
			// PHP sanitizer accepts true/false for enabled and stores 'yes'/'no'.
			await updateProductSettings( productId, data );
			reset( data );
			setValuesByType( { [ data.call_type ]: data.custom_value } );
			setNotice( { type: 'success', message: __( 'Settings saved.', 'woocommerce-call-for-price' ) } );
		} catch ( err ) {
			setNotice( {
				type   : 'error',
				message: err?.message ?? __( 'Failed to save settings.', 'woocommerce-call-for-price' ),
			} );
		} finally {
			setSaving( false );
		}
	};

	// ── Loading state ─────────────────────────────────────────────────────────

	if ( loading ) {
		return (
			<Card>
				<CardBody>
					<Text>{ __( 'Loading…', 'woocommerce-call-for-price' ) }</Text>
				</CardBody>
			</Card>
		);
	}

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<Card>
			<CardBody>
				<Heading level={ 5 } style={ { marginTop: 0, marginBottom: '8px' } }>
					{ __( 'Override for this product', 'woocommerce-call-for-price' ) }
				</Heading>
				<Text variant="muted" style={ { display: 'block', marginBottom: '16px', fontSize: '13px' } }>
					{ __( 'Configure how Call for Price behaves for this product only.', 'woocommerce-call-for-price' ) }
				</Text>

				<VStack spacing={ 2 }>
					{ /* Enable override */ }
					<SettingRow
						label={ __( 'Override global settings', 'woocommerce-call-for-price' ) }
						helpTip={ __( 'Use the settings below instead of the global / product-type settings for this product.', 'woocommerce-call-for-price' ) }
					>
						<Controller
							name="enabled"
							control={ control }
							render={ ( { field } ) => (
								<CheckboxControl
									checked={ !! field.value }
									onChange={ field.onChange }
								/>
							) }
						/>
					</SettingRow>

					{ /* Call type — no 'inherit' option (fix #5) */ }
					<SettingRow
						label={ __( 'Contact channel', 'woocommerce-call-for-price' ) }
						helpTip={ __( 'Override the global contact channel for this product.', 'woocommerce-call-for-price' ) }
					>
						<Controller
							name="call_type"
							control={ control }
							render={ ( { field } ) => (
								<SelectControl
									value={ field.value }
									onChange={ handleCallTypeChange }
									options={ CALL_TYPES }
									style={ { maxWidth: '280px' } }
								/>
							) }
						/>
					</SettingRow>

					{ /* Custom Value — field key is now custom_value (fix #4) */ }
					{ callType !== 'text' && (
						<SettingRow
							label={ contactConfig.label }
							helpTip={ contactConfig.help }
						>
							<Controller
								name="custom_value"
								control={ control }
								render={ ( { field } ) => (
									<InputControl
										type={ contactConfig.type }
										value={ field.value ?? '' }
										onChange={ field.onChange }
										placeholder={ contactConfig.placeholder }
									/>
								) }
							/>
						</SettingRow>
					) }

					{ /* WhatsApp template */ }
					{ callType === 'whatsapp' && (
						<SettingRow
							label={ __( 'WhatsApp message template', 'woocommerce-call-for-price' ) }
							helpTip={ __( 'Supports {product_name}, {store_name}, {product_url}.', 'woocommerce-call-for-price' ) }
						>
							<Controller
								name="whatsapp_template"
								control={ control }
								render={ ( { field } ) => (
									<VStack spacing={ 1 }>
										<TextareaControl
											value={ field.value ?? '' }
											onChange={ field.onChange }
											rows={ 3 }
											style={ { maxWidth: '480px' } }
											placeholder={ __( 'Hi, I\'m interested in {product_name} from {store_name}. Could you please share the price?', 'woocommerce-call-for-price' ) }
										/>
										<Text variant="muted" style={ { fontSize: '12px' } }>
											{ __( 'Placeholders: {product_name}, {store_name}, {product_url}', 'woocommerce-call-for-price' ) }
										</Text>
									</VStack>
								) }
							/>
						</SettingRow>
					) }

					{ /* Email fields */ }
					{ callType === 'email' && (
						<>
							<SettingRow
								label={ __( 'Email subject', 'woocommerce-call-for-price' ) }
								helpTip={ __( 'Supports {product_name}, {store_name}, {product_url}.', 'woocommerce-call-for-price' ) }
							>
								<Controller
									name="email_subject"
									control={ control }
									render={ ( { field } ) => (
										<VStack spacing={ 1 }>
											<InputControl
												value={ field.value ?? '' }
												onChange={ field.onChange }
												style={ { maxWidth: '480px' } }
												placeholder={ __( 'Price enquiry for {product_name}', 'woocommerce-call-for-price' ) }
											/>
											<Text variant="muted" style={ { fontSize: '12px' } }>
												{ __( 'Placeholders: {product_name}, {store_name}, {product_url}', 'woocommerce-call-for-price' ) }
											</Text>
										</VStack>
									) }
								/>
							</SettingRow>

							<SettingRow
								label={ __( 'Email body', 'woocommerce-call-for-price' ) }
								helpTip={ __( 'Supports {product_name}, {store_name}, {product_url}.', 'woocommerce-call-for-price' ) }
							>
								<Controller
									name="email_content"
									control={ control }
									render={ ( { field } ) => (
										<VStack spacing={ 1 }>
											<TextareaControl
												value={ field.value ?? '' }
												onChange={ field.onChange }
												rows={ 5 }
												style={ { maxWidth: '480px' } }
												placeholder={ __( 'Hi,\n\nI\'m interested in {product_name} ({product_url}) from {store_name}. Please send me the price.\n\nThanks', 'woocommerce-call-for-price' ) }
											/>
											<Text variant="muted" style={ { fontSize: '12px' } }>
												{ __( 'Placeholders: {product_name}, {store_name}, {product_url}', 'woocommerce-call-for-price' ) }
											</Text>
										</VStack>
									) }
								/>
							</SettingRow>
						</>
					) }

					{ /* Label text — always shown */ }
					<SettingRow
						label={ __( 'Display label', 'woocommerce-call-for-price' ) }
						helpTip={ __( 'The HTML label shown wherever this product\'s price would normally appear.', 'woocommerce-call-for-price' ) }
					>
						<Controller
							name="text_all_views"
							control={ control }
							render={ ( { field } ) => (
								<TextareaControl
									value={ field.value ?? '' }
									onChange={ field.onChange }
									rows={ 2 }
									style={ { maxWidth: '480px' } }
									placeholder={ '<strong>Call for Price</strong>' }
									help={ __( 'HTML supported. Keep tags simple — <strong>, <em>, <a> work best.', 'woocommerce-call-for-price' ) }
								/>
							) }
						/>
					</SettingRow>

					{ /* Request Forms — only for 'text' call type (fix #6) */ }
					{ callType === 'text' && (
						<SettingRow
							label={ __( 'Enquiry form', 'woocommerce-call-for-price' ) }
							helpTip={ __( 'Display an enquiry form on the product page. Choose Contact Form 7, Gravity Forms, or supply your own shortcode.', 'woocommerce-call-for-price' ) }
						>
							<Controller
								name="request_forms"
								control={ control }
								render={ ( { field } ) => (
									<SelectControl
										value={ field.value }
										onChange={ field.onChange }
										options={ REQUEST_FORMS }
										style={ { maxWidth: '280px' } }
									/>
								) }
							/>
						</SettingRow>
					) }

					{ /* Shortcode — only for 'text' call type when a form is selected (fix #6) */ }
					{ callType === 'text' && reqForm !== 'none' && (
						<SettingRow
							label={ __( 'Custom form shortcode', 'woocommerce-call-for-price' ) }
							helpTip={ __( 'Paste the shortcode for any other form plugin. Only used when Enquiry form is set to \'Other\'.', 'woocommerce-call-for-price' ) }
							noBorder
						>
							<Controller
								name="shortcode"
								control={ control }
								render={ ( { field } ) => (
									<TextareaControl
										value={ field.value ?? '' }
										onChange={ field.onChange }
										rows={ 2 }
										style={ { maxWidth: '480px' } }
										placeholder={ '[contact-form-7 id="123" title="Enquiry"]' }
										help={ __( 'Example: [contact-form-7 id="123" title="Enquiry"]', 'woocommerce-call-for-price' ) }
									/>
								) }
							/>
						</SettingRow>
					) }

				</VStack>

				{ /* Save button */ }
				<div style={ { marginTop: '24px', display: 'flex', justifyContent: 'flex-start' } }>
					<Button
						variant="primary"
						onClick={ onSave }
						isBusy={ saving }
						disabled={ saving }
					>
						{ saving
							? __( 'Saving…',       'woocommerce-call-for-price' )
							: __( 'Save changes',  'woocommerce-call-for-price' )
						}
					</Button>
				</div>

				{ notice && (
					<div
						role="alert"
						style={ {
							display        : 'flex',
							alignItems     : 'center',
							justifyContent : 'space-between',
							padding        : '10px 16px',
							borderRadius   : '4px',
							marginTop      : '16px',
							background     : notice.type === 'success' ? '#f0fdf4' : '#fef2f2',
							borderLeft     : `4px solid ${ notice.type === 'success' ? '#1a8d34' : '#d63638' }`,
							color          : notice.type === 'success' ? '#166534' : '#991b1b',
						} }
					>
						<span>{ notice.message }</span>
						<Button variant="tertiary" onClick={ () => setNotice( null ) } style={ { minWidth: 'auto', padding: '0 4px' } }>
							✕
						</Button>
					</div>
				) }
			</CardBody>
		</Card>
	);
}
