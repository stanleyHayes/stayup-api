// id	integer	Unique identifier for the resource.read-only
// date_created	date-time	The date the order refund was created, in the site's timezone.read-only
// date_created_gmt	date-time	The date the order refund was created, as GMT.read-only
// amount	string	Total refund amount. Optional. If this parameter is provided, it will take precedence over line item totals, even when total of line items does not matches with this amount.
//     reason	string	Reason for refund.
//                                        refunded_by	integer	User ID of user who created the refund.
//     refunded_payment	boolean	If the payment was refunded via the API. See api_refund.read-only
// meta_data	array	Meta data. See Order refund - Meta data properties
// line_items	array	Line items data. See Order refund - Line items properties
// tax_lines	array	Tax lines data. See Order refund - Tax lines propertiesread-only
// shipping_lines	array	Shipping lines data. See Order refund - Shipping lines properties
// fee_lines	array	Fee lines data. See Order refund - Fee lines properties
// api_refund	boolean	When true, the payment gateway API is used to generate the refund. Default is true.write-only
// api_restock	boolean	When true, the selected line items are restocked Default is true.write-only
// Order refund - Meta data properties
// Attribute	Type	Description
// id	integer	Meta ID.read-only
// key	string	Meta key.
//     value	string	Meta value.
//     Order refund - Line items properties
// Attribute	Type	Description
// id	integer	Item ID.read-only
// name	string	Product name.
//     product_id	integer	Product ID.
//     variation_id	integer	Variation ID, if applicable.
//     quantity	integer	Quantity ordered.
//     tax_class	string	Tax class of product.
//     subtotal	string	Line subtotal (before discounts).
// subtotal_tax	string	Line subtotal tax (before discounts).read-only
// total	string	Line total (after discounts).
// total_tax	string	Line total tax (after discounts).read-only
// taxes	array	Line taxes. See Order refund line item - Taxes propertiesread-only
// meta_data	array	Meta data. See Order refund - Meta data properties
// sku	string	Product SKU.read-only
// price	string	Product price.read-only
// Order refund line item - Taxes properties
// Attribute	Type	Description
// id	integer	Tax rate ID.read-only
// total	string	Tax total.read-only
// subtotal	string	Tax subtotal.read-only
// Order refund - Tax lines properties
// Attribute	Type	Description
// id	integer	Item ID.read-only
// rate_code	string	Tax rate code.read-only
// rate_id	integer	Tax rate ID.read-only
// label	string	Tax rate label.read-only
// compound	boolean	Whether or not this is a compound tax rate.read-only
// tax_total	string	Tax total (not including shipping taxes).read-only
// shipping_tax_total	string	Shipping tax total.read-only
// meta_data	array	Meta data. See Order refund - Meta data properties
// Order refund - Shipping lines properties
// Attribute	Type	Description
// id	integer	Item ID.read-only
// method_title	string	Shipping method name.
//     method_id	string	Shipping method ID.
//     total	string	Line total (after discounts).
// total_tax	string	Line total tax (after discounts).read-only
// taxes	array	Line taxes. See Order refund - Tax lines propertiesread-only
// meta_data	array	Meta data. See Order refund - Meta data properties
// Order refund - Fee lines properties
// Attribute	Type	Description
// id	integer	Item ID.read-only
// name	string	Fee name.
//     tax_class	string	Tax class of fee.
//     tax_status	string	Tax status of fee. Options: taxable and none.
//     total	string	Line total (after discounts).
// total_tax	string	Line total tax (after discounts).read-only
// taxes	array	Line taxes. See Order refund - Tax lines propertiesread-only
// meta_data	array	Meta data. See Order refund - Meta data properties