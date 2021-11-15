/*
	Props: {
		url: '',

		pageSize
		currPage
		select
		expand
		filter
		search

	}
*/
function filter(q) {

	function fuval(q) {
		if (q === null) {
			return 'null'
		} else if (typeof(q) === 'string') {
			return '\'' + q + '\'';
		} else {
			if (typeof(q) === 'number')
				return q;
			else {
				debugger;
				if (q.getMonth && typeof q.getMonth === "function")
					return q.toISOString()
				else
					return q.func + '(' + q.params.join(',') + ')';
			}
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

function odata(options, props) {
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

	if (options.filter && Object.prototype.hasOwnProperty.call(options.filter, 'filters')) {
		let l = filter(options.filter);
		f.push(l);
	}

	if (props.filter) {
		let l = filter(props.filter);
		f.push(l);
	}

	// Search //
	if (props.search) {
		let l = props.cols.filter(q => q.searchable == undefined || q.searchable == true).map(q => "contains(" + q.name.replaceAll('.', '/') + ",'" + props.search + "')").join(" or ");

		if (l)
			f.push('(' + l + ')');
	}

	if (f && f.length > 0)
		url.searchParams.append('$filter', f.join(' and '));

	// Sort //
	if (props.sort && props.sort.length > 0)
		url.searchParams.append('$orderby', props.sort.map(m => { let n = { index: -1, name: '', dir: null }; if (Object.prototype.hasOwnProperty.call(m, 'index')) { n.index = m.index } else { n.name = m.name }; n.dir = m.dir; return n; }).map(m => { return (m.index > -1 ? props.cols[m.index].name : m.name) + (m.dir ? (' ' + m.dir): '') }).join(','));

	return new Request(url, options.header);
}

export default odata;
