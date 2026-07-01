/**
 * src/components/ProductTypeScreen.js
 *
 * Reusable screen for Simple | Variable | Grouped | External tabs.
 * PGBF-style layout: WP CheckboxControl, SelectControl, InputControl,
 * TextareaControl, VStack, and ConfirmDialog.
 * All strings are translatable.
 */
import { useState, useEffect }      from '@wordpress/element';
import {
	CheckboxControl,
	SelectControl,
	TextareaControl,
	__experimentalInputControl   as InputControl,
	__experimentalVStack         as VStack,
	__experimentalConfirmDialog  as ConfirmDialog,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useForm, Controller }       from 'react-hook-form';
import { useSettings }               from '../context/SettingsContext';
import { SettingsCard, SettingsRow, SaveBar, NoticeBar } from './SettingsCard';
import { ProInlineNotice }           from './ProNotice';

const getViews = () => ( {
	single   : __( 'Single product page', 'woocommerce-call-for-price' ),
	related  : __( 'Related products', 'woocommerce-call-for-price' ),
	home     : __( 'Homepage', 'woocommerce-call-for-price' ),
	page     : __( 'Other pages (shortcodes)', 'woocommerce-call-for-price' ),
	archive  : __( 'Shop & category archives', 'woocommerce-call-for-price' ),
	variation: __( 'Product variations', 'woocommerce-call-for-price' ),
} );

const getCallTypes = () => [
	{ value: 'text',        label: __( 'Text message', 'woocommerce-call-for-price' ) },
	{ value: 'phone',       label: __( 'Phone call', 'woocommerce-call-for-price' ) },
	{ value: 'whatsapp',    label: __( 'WhatsApp', 'woocommerce-call-for-price' ) },
	{ value: 'email',       label: __( 'Email', 'woocommerce-call-for-price' ) },
	{ value: 'custom_link', label: __( 'Custom link', 'woocommerce-call-for-price' ) },
];

const getContactConfig = () => ( {
	phone      : { label: __( 'Phone number', 'woocommerce-call-for-price' ),    type: 'tel',   placeholder: '+44 20 1234 5678', tooltip: __( 'Include the country code in international format (e.g. +44 20 1234 5678).', 'woocommerce-call-for-price' ) },
	whatsapp   : { label: __( 'WhatsApp number', 'woocommerce-call-for-price' ), type: 'tel',   placeholder: '+44 7700 900123', tooltip: __( 'Include the country code in international format (e.g. +44 7700 900123). WhatsApp links require this exact format.', 'woocommerce-call-for-price' ) },
	email      : { label: __( 'Email address', 'woocommerce-call-for-price' ),   type: 'email', placeholder: 'enquiries@example.com', tooltip: __( 'Where customer enquiries are sent.', 'woocommerce-call-for-price' ) },
	custom_link: { label: __( 'Destination URL', 'woocommerce-call-for-price' ),   type: 'url',   placeholder: 'https://example.com/contact', tooltip: __( 'Where customers go when they tap the Call for Price button. Must start with https://', 'woocommerce-call-for-price' ) },
} );

export default function ProductTypeScreen( { typeKey, label, isVariable = false } ) {
	const { settings, saving, saveSection, resetSection, notice, dismissNotice } = useSettings();
	const [ isResetOpen, setIsResetOpen ] = useState( false );

	const views = getViews();
	const callTypes = getCallTypes();
	const contactConfig = getContactConfig();

	const typeSettings = settings?.[ typeKey ] ?? {};
	const viewList     = isVariable
		? Object.keys( views )
		: Object.keys( views ).filter( ( v ) => v !== 'variation' );

	const { control, handleSubmit, watch, reset, setValue, formState: { isDirty } } = useForm( {
		defaultValues: typeSettings,
	} );

	// Remembers the unsaved value typed for each contact channel, so switching
	// the channel selector back and forth (without saving) restores whatever
	// was there per-channel instead of leaking one channel's value into another.
	const [ valuesByType, setValuesByType ] = useState( {} );

	useEffect( () => {
		if ( typeSettings && Object.keys( typeSettings ).length ) {
			reset( typeSettings );
			setValuesByType( { [ typeSettings.call_type ]: typeSettings.call_type_value ?? '' } );
		}
	}, [ settings, typeKey, reset ] );

	const callType      = 'text'; // Lite: contact channel is Pro-only, locked to text
	const callTypeValue = watch( 'call_type_value' );
	const contact        = contactConfig[ callType ];

	const handleCallTypeChange = ( newCallType ) => {
		setValuesByType( ( prev ) => ( { ...prev, [ callType ]: callTypeValue } ) );
		setValue( 'call_type', newCallType, { shouldDirty: true } );
		setValue( 'call_type_value', valuesByType[ newCallType ] ?? '', { shouldDirty: true } );
	};

	const onSave = handleSubmit( async ( data ) => {
		data.call_type = 'text'; // Lite: strip Pro contact channel selection
		await saveSection( typeKey, data );
		reset( data );
	} );

	const onReset = async () => {
		setIsResetOpen( false );
		await resetSection( typeKey );
	};

	return (
		<VStack spacing={ 4 }>

			{ /* ── Enable / Disable ── */ }
			<SettingsCard title={ label }>
				<SettingsRow
					label={ __( 'Enable/Disable', 'woocommerce-call-for-price' ) }
					tooltip={ sprintf( __( 'Apply Call for Price to %s.', 'woocommerce-call-for-price' ), label.toLowerCase() ) }
					noBorder
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
				</SettingsRow>
			</SettingsCard>

			{ /* ── Contact method ── */ }
			<SettingsCard
				title={ __( 'Contact Method', 'woocommerce-call-for-price' ) }
				description={ __( 'Choose how customers can reach you when the price is hidden.', 'woocommerce-call-for-price' ) }
			>
				<SettingsRow
					label={ __( 'Contact channel', 'woocommerce-call-for-price' ) }
					htmlFor={ `${ typeKey }-call-type` }
					tooltip={ __( 'How customers can request the price: phone call, WhatsApp, email, web form, or custom link.', 'woocommerce-call-for-price' ) }
					notice={ <ProInlineNotice /> }
				>
					<Controller
						name="call_type"
						control={ control }
						render={ ( { field } ) => (
							<SelectControl
								id={ `${ typeKey }-call-type` }
								value="text"
								onChange={ () => {} }
								options={ callTypes }
								style={ { maxWidth: '340px' } }
								disabled
							/>
						) }
					/>
				</SettingsRow>

				{ callType !== 'text' && contact && (
					<SettingsRow
						label={ contact.label }
						htmlFor={ `${ typeKey }-call-value` }
						tooltip={ contact.tooltip }
					>
						<Controller
							name="call_type_value"
							control={ control }
							render={ ( { field } ) => (
								<InputControl
									id={ `${ typeKey }-call-value` }
									type={ contact.type }
									value={ field.value ?? '' }
									onChange={ field.onChange }
									placeholder={ contact.placeholder }
									style={ { maxWidth: '340px' } }
								/>
							) }
						/>
					</SettingsRow>
				) }

				{ callType === 'whatsapp' && (
					<SettingsRow
						label={ __( 'WhatsApp message template', 'woocommerce-call-for-price' ) }
						htmlFor={ `${ typeKey }-wa-template` }
						tooltip={ __( 'Default message pre-filled when a customer taps the WhatsApp button. Use the placeholders to insert dynamic values.', 'woocommerce-call-for-price' ) }
					>
						<Controller
							name="whatsapp_template"
							control={ control }
							render={ ( { field } ) => (
								<VStack spacing={ 1 }>
									<TextareaControl
										id={ `${ typeKey }-wa-template` }
										rows={ 3 }
										value={ field.value ?? '' }
										onChange={ field.onChange }
										style={ { maxWidth: '480px' } }
									/>
									<p className="description" style={ { margin: 0, fontSize: '12px', color: '#646970' } }>
										{ __( 'Insert placeholder:', 'woocommerce-call-for-price' ) } <code>{ '{product_name}' }</code>, <code>{ '{store_name}' }</code>, <code>{ '{product_url}' }</code>
									</p>
								</VStack>
							) }
						/>
					</SettingsRow>
				) }

				{ callType === 'email' && (
					<>
						<SettingsRow
							label={ __( 'Email subject', 'woocommerce-call-for-price' ) }
							htmlFor={ `${ typeKey }-email-subject` }
							tooltip={ __( 'Pre-filled subject for the enquiry email. Use the placeholders below to insert dynamic values.', 'woocommerce-call-for-price' ) }
						>
							<Controller
								name="email_subject"
								control={ control }
								render={ ( { field } ) => (
									<VStack spacing={ 1 }>
										<InputControl
											id={ `${ typeKey }-email-subject` }
											value={ field.value ?? '' }
											onChange={ field.onChange }
											style={ { maxWidth: '340px' } }
										/>
										<p className="description" style={ { margin: 0, fontSize: '12px', color: '#646970' } }>
											{ __( 'Insert placeholder:', 'woocommerce-call-for-price' ) } <code>{ '{product_name}' }</code>, <code>{ '{store_name}' }</code>, <code>{ '{product_url}' }</code>
										</p>
									</VStack>
								) }
							/>
						</SettingsRow>

						<SettingsRow
							label={ __( 'Email body', 'woocommerce-call-for-price' ) }
							htmlFor={ `${ typeKey }-email-content` }
							tooltip={ __( 'Pre-filled body for the enquiry email. Customers can edit this before sending.', 'woocommerce-call-for-price' ) }
						>
							<Controller
								name="email_content"
								control={ control }
								render={ ( { field } ) => (
									<VStack spacing={ 1 }>
										<TextareaControl
											id={ `${ typeKey }-email-content` }
											rows={ 5 }
											value={ field.value ?? '' }
											onChange={ field.onChange }
											style={ { maxWidth: '480px' } }
										/>
										<p className="description" style={ { margin: 0, fontSize: '12px', color: '#646970' } }>
											{ __( 'Insert placeholder:', 'woocommerce-call-for-price' ) } <code>{ '{product_name}' }</code>, <code>{ '{store_name}' }</code>, <code>{ '{product_url}' }</code>
										</p>
									</VStack>
								) }
							/>
						</SettingsRow>
					</>
				) }
			</SettingsCard>

			{ /* ── Label text per view ── */ }
			<SettingsCard
				title={ __( 'Label Text per View', 'woocommerce-call-for-price' ) }
				description={ __( 'Enable or disable Call for Price per display context and customise the label HTML.', 'woocommerce-call-for-price' ) }
			>
				{ viewList.map( ( view, idx ) => {
					const isProView = view !== 'single';
					return (
						<SettingsRow
							key={ view }
							label={ views[ view ] }
							tooltip={ __( 'This sets the HTML to output when the price is empty. Leave blank to disable.', 'woocommerce-call-for-price' ) }
							noBorder={ idx === viewList.length - 1 }
							notice={ isProView ? <ProInlineNotice /> : undefined }
						>
							<div className="cfp-pro-view-row">
								<div className="cfp-pro-view-row__toggle">
									<Controller
										name={ `views.${ view }.enabled` }
										control={ control }
										render={ ( { field } ) => (
											<CheckboxControl
												label={ __( 'Enable', 'woocommerce-call-for-price' ) }
												checked={ !! field.value }
												onChange={ field.onChange }
											/>
										) }
									/>
								</div>
								<div className="cfp-pro-view-row__text">
									<Controller
										name={ `views.${ view }.text` }
										control={ control }
										render={ ( { field } ) => (
											<TextareaControl
												rows={ 2 }
												cols={ 40 }
												value={ field.value ?? '' }
												onChange={ isProView ? () => {} : field.onChange }
												placeholder={ __( '<strong>Call for Price</strong>', 'woocommerce-call-for-price' ) }
												disabled={ isProView }
											/>
										) }
									/>
								</div>
							</div>
						</SettingsRow>
					);
				} ) }
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
					{ sprintf( __( 'Reset %s settings to defaults? This cannot be undone.', 'woocommerce-call-for-price' ), label ) }
				</ConfirmDialog>
			) }
		</VStack>
	);
}
