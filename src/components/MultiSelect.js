/**
 * src/components/MultiSelect.js
 *
 * Reusable react-select multi-select wrapper styled to match the WP admin input
 * appearance. Used for product categories, tags, and product ID selectors.
 *
 * Props:
 *   options     – [{ value: number|string, label: string }]
 *   value       – number[]   current selected IDs (from react-hook-form field)
 *   onChange    – function   receives number[] of selected IDs
 *   placeholder – string
 *   isLoading   – bool       shows loading indicator while options are fetching
 *   isDisabled  – bool       disables the control and hides options
 *   menuIsOpen  – bool       controlled open state (pass false to keep closed)
 *   style       – object     applied to the container (e.g. { maxWidth: '340px' })
 */
import Select from 'react-select';
import { __ } from '@wordpress/i18n';

export default function MultiSelect( {
	options     = [],
	value       = [],
	onChange,
	placeholder,
	isLoading   = false,
	isDisabled  = false,
	menuIsOpen,
	style,
} ) {
	// Use string comparison so the component handles both numeric IDs (categories,
	// products) and string slugs (user roles) without type-coercion issues.
	const strVals  = ( value ?? [] ).map( String );
	const selected = isDisabled ? [] : options.filter( ( o ) => strVals.includes( String( o.value ) ) );

	const handleChange = ( selectedItems ) => {
		onChange( selectedItems ? selectedItems.map( ( s ) => s.value ) : [] );
	};

	const selectStyles = {
		control: ( base, state ) => ( {
			...base,
			borderColor    : state.isFocused ? '#2271b1' : '#8c8f94',
			boxShadow      : state.isFocused ? '0 0 0 1px #2271b1' : 'none',
			minHeight      : '38px',
			borderRadius   : '4px',
			'&:hover'      : { borderColor: '#2271b1' },
			background     : state.isDisabled ? '#f6f7f7' : '#fff',
			cursor         : state.isDisabled ? 'not-allowed' : 'default',
		} ),
		multiValue: ( base ) => ( {
			...base,
			background  : '#e0e8f5',
			borderRadius: '3px',
		} ),
		multiValueLabel: ( base ) => ( {
			...base,
			color    : '#1d2327',
			fontSize : '12px',
			padding  : '2px 4px',
		} ),
		multiValueRemove: ( base ) => ( {
			...base,
			color   : '#787c82',
			'&:hover': { background: '#c7d2e7', color: '#1d2327' },
		} ),
		menu: ( base ) => ( {
			...base,
			zIndex: 9999,
		} ),
		option: ( base, state ) => ( {
			...base,
			background: state.isSelected
				? '#2271b1'
				: state.isFocused
					? '#f0f6fc'
					: '#fff',
			color    : state.isSelected ? '#fff' : '#1d2327',
			fontSize : '13px',
		} ),
		placeholder: ( base ) => ( { ...base, fontSize: '13px', color: '#787c82' } ),
		noOptionsMessage: ( base ) => ( { ...base, fontSize: '13px' } ),
		loadingMessage: ( base ) => ( { ...base, fontSize: '13px' } ),
		container: ( base ) => ( { ...base, maxWidth: '340px', ...style } ),
	};

	return (
		<Select
			isMulti
			options={ isDisabled ? [] : options }
			value={ selected }
			onChange={ isDisabled ? () => {} : handleChange }
			placeholder={ placeholder ?? __( 'Select…', 'woocommerce-call-for-price' ) }
			isLoading={ isLoading && ! isDisabled }
			isDisabled={ isDisabled }
			menuIsOpen={ isDisabled ? false : menuIsOpen }
			styles={ selectStyles }
			classNamePrefix="cfp-select"
			noOptionsMessage={ () => __( 'No results found', 'woocommerce-call-for-price' ) }
		/>
	);
}
