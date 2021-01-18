function filter(q) {

	function fuval(q) {
		if (typeof(q) === 'string') {
			return '\'' + q + '\'';
		} else {
			if (typeof(q) === 'number')
				return q;
			else
				return q.func + '(' + q.params.join(',') + ')';
		}
	}

	let s = '';

	if (q && q.filters)
		for (let i = 0; i < q.filters.length; i++) {
			if (i > 0)
				s = s + ` ${q.type || 'and'} `;

			if (q.filters[i].column) {
				if (q.filters[i].operator == 'in')
					s = s + fuval(q.filters[i].value) + ' ' + q.filters[i].operator + ' ' + q.filters[i].column;
				else
					s = s + q.filters[i].column + ' ' + q.filters[i].operator + ' ' + fuval(q.filters[i].value);
			} else {
				if (q.filters[i].func)
					s = s + q.filters[i].func + '(' + q.filters[i].params.map(m => fuval(m)).join(',') + ')';
				else
				if (q.filters[i])
					s = s + '(' + filter(q.filters[i]) + ')';
			}
		}

	return s;
}

export default function odata(options, props) {
	const url = new URL(options.url);

	// Paging //
	if (props.pageSize) {
		url.searchParams.append('$skip', props.pageSize * (props.currPage - 1));
		url.searchParams.append('$top', props.pageSize);
	}

	// Select //
	if (options.select && options.select.length > 0)
		url.searchParams.append('$select', options.select.join(','));

	// Expand //
	if (options.expand && options.expand.length > 0)
		url.searchParams.append('$expand', options.expand.map(m => m.name + ((m.select && m.select.length > 0) ? '($select=' + m.select.join(',') + ')' : '')).join(','));

	// Filter //
	let f = [];

	if (options.filter && options.filter.hasOwnProperty('filters')) {
		let l = filter(options.filter);
		f.push(l);
	}

	// Search //
	if (props.search) {
		let l = props.cols.filter(q => q.searchable == undefined || q.searchable == true).map(q => "contains(" + q.name + ",'" + props.search + "')").join(" or ");

		if (l)
			f.push('(' + l + ')');
	}

	if (f && f.length > 0)
		url.searchParams.append('$filter', f.join(' and '));

	// Sort //
	if (props.sort && props.sort.length > 0)
		url.searchParams.append('$orderby', props.sort.filter(f => f.index || f.name).map(m => { return (m.index ? props.cols[m.index].name : m.name) + (m.dir ? (' ' + m.dir): '') }).join(','));
	
	return new Request(url, options.header);
}
