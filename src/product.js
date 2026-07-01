/**
 * src/product.js
 *
 * Per-product metabox entry point.
 * Mounted into #cfp-pro-product-root on the product edit page.
 * PHP outputs: <div id="cfp-pro-product-root" data-product-id="{{ $product_id }}"></div>
 */
import { createRoot }   from 'react-dom/client';
import ProductMetabox   from './ProductMetabox';
import './app.scss';

window.addEventListener( 'load', () => {
	const container = document.getElementById( 'cfp-pro-product-root' );
	if ( ! container ) return;

	const productId = container.dataset.productId;
	if ( productId === undefined ) {
		console.error( '[CfP Pro] #cfp-pro-product-root is missing data-product-id.' );
		return;
	}

	const productIdNum = parseInt( productId, 10 );

	createRoot( container ).render( <ProductMetabox productId={ productIdNum } /> );
} );
