export default function param(uri, header, props) { // C# : methodXYZ(string search, int top, int skip, string orderBy, string orderdir)
	const url = new URL(uri);
	//
	// Paging //
	if (props.pageSize) {
		url.searchParams.append('skip', props.pageSize * (props.currentPage - 1));
		url.searchParams.append('top', props.pageSize);
	}

	// Filter //
	if (props.search)
		url.searchParams.append('search', props.search);

	// Order //
	if (props.order.length > 0) {
		url.searchParams.append('orderby', props.order.map(m => { return props.cols[m.index].name }).join(','));
		url.searchParams.append('orderdir', props.order.map(m => { return m.type ? m.type : 'asc' }).join(','));
	}

	return new Request(url, header);
}
