/*
 *  tablevu
 *  A small, fast, easy-to-use table component.
 *  Copyright (c) 2020 Ender Boz <ender.boz@gmail.com>
 *  https://github.com/endb/tablevu/LICENCE
 */

import { h, reactive, watch } from 'vue';

const tablevuStatuses = { Error: -1, Ready: 0, Loading: 1 };

const tablevu = {
	props: {
		data: { type: [Array, Object] },
		search: { type: String },
		filter: { type: [Array, Object] },
		command: { type: Array, default: [] },
		rowid: { type: String },
		onRowClick: { type: Function },
		onRowDblClick: { type: Function },
		class: { type: String, default: 'table' },
		buttonclass: { type: String, default: 'btn' }
	},

	setup(props) {
		let rows = [];

		const spec = reactive({
			pageSize: props.data.pageSize || 20,
			pageCount: 0,
			currPage: 0,
			sort: props.data.sort || [],
			status: tablevuStatuses.Ready,
			timer: null,
			time: null,
			cols: [],
			filter: null,
			search: null
		});

		// Setup Search Input //
		watch(() => props.search, (n,o) => {
			if (spec.timer)
				clearTimeout(spec.timer);

			if ((o && o.length > (props.data.searchMinChar || 3) && (n == undefined || n == null || n.length <= (props.data.searchMinChar || 3))) || (n && n.length > (props.data.searchMinChar || 3))) {
				spec.timer = setTimeout(() => { if (props.search && props.search.length > (props.data.searchMinChar || 3)) spec.search = props.search; else spec.search = null; refresh(); }, 444);
			}
		});

		// Setup dynamic filter //
		watch(() => props.filter, () => {
			if (props.filter)
				spec.filter = props.filter;
			else
				spec.filter = null;

			refresh();
		}, { deep: true });

		// Setup commands //
		watch(() => props.command, (n,o) => {
			if (n && n.length > 0) {
				const c = props.command[n.length-1];

				if (c && c.name) {
					if (c.name.toLowerCase() == 'refresh') refresh()
					else if (c.name.toLowerCase() == 'first') first()
					else if (c.name.toLowerCase() == 'prior') prior()
					else if (c.name.toLowerCase() == 'next') next()
					else if (c.name.toLowerCase() == 'last') last()
					else console.log('Unknown command');
				}

				props.command.length = 0;
			}
		}, { deep: true });
		/*****************************************************************

		*****************************************************************/
		function first() { // Go First Page //
			page(1);
		}

		function prior() { // Go Previus Page //
			if (spec.currPage > 1) {
				page(spec.currPage - 1);
			} else {
				page(spec.currPage);
			}
		}

		function next() { // Go Next Page //
			page(spec.currPage + 1);
		}

		function last() { // Go Last Page //
			page(spec.pageCount);
		}

		function refresh() { // Refresh active page //
			page(spec.currPage);
		}

		function orderby(ind) { // Sort data //
			if (spec.sort && spec.sort.length > 0) {
				let l = spec.sort.findIndex(f => f.index == ind);

				if (l == 0) {
					spec.sort[l].dir = spec.sort[0].dir ? null : 'desc';
				} else if (l > 0) {
					spec.sort.splice(l, 1);
				}

				if (l != 0) {
					spec.sort.unshift({ index: ind, dir: null });
				}

				if (spec.sort.length > 2) {
					spec.sort.pop();
				}
			} else  {
				spec.sort.push({ index: ind, dir: null });
			}

			page(spec.currPage);
		}
	
		// Go Custom Page number //
		function page(currentPage) {
			if (!props.data) {
				return;
			}

			//const tm = Date.now();

			spec.status = tablevuStatuses.Loading;
			//spec.currPage = currentPage;

			if (Array.isArray(props.data)) {
				rows = props.data;

				spec.pageCount = (rows.length > 0 && spec.pageSize > 0) ? (rows.length / spec.pageSize) : 0;
				spec.status = tablevuStatuses.Ready;
				spec.currPage = currentPage;
				spec.time = Date.now();
			}
			
			if (props.data.adapter) {
				const r = props.data.adapter({ pageSize: spec.pageSize, pageCount: spec.pageCount, currPage: currentPage, sort: spec.sort, cols: spec.cols, filter: spec.filter, search: spec.search });

				fetch(r).then(res => res.json()).then(res => {
					let cnt = 0;
					if (res && Object.hasOwnProperty.call(res, '@count')) {
						cnt = BigInt.parse(res['@count']);
					}

					if (res && res.value) {
						rows = res.value;
						
						spec.pageCount = (cnt > 0 && spec.pageSize > 0) ? (cnt / spec.pageSize) : 0;
						spec.status = tablevuStatuses.Ready;
						spec.currPage = currentPage;
						spec.time = Date.now();
					}
				}).catch(err => {
					console.error(err);
					// debugger;
					spec.status = tablevuStatuses.Error;
					alert(err.message);
				});
			}
		}
		/*****************************************************************
		 Render Functions
		*****************************************************************/
		function renderCell(col, val) {
			let v;
			const o = { style: {} };

			if (col.align) {
				o.style['text-align'] = col.align;
			}

			if (col.width) {
				o.style['max-width'] = col.width;
			}

			if (val) {
				if (col.type == 'datetime' || col.type == 'date' || col.type == 'time') {
					let t = new Date(val);

					if (col.type == 'date')
						v = t.toLocaleDateString();
					else
					if (col.type == 'time')
						v = t.toLocaleTimeString();
					else
						v = t.toLocaleString();
				} else {
					if (col.type == 'numeric') {
						v = Number.parse(val);
					} else {
						v = val;
					}
				}
			} else {
				v = '';
			}

			return h('td', o, v);
		}

		function renderCustomCell(col, row) {
			const o = { style: {} };

			if (col.align) {
				o.style['text-align'] = col.align;
			}

			if (col.width) {
				o.style['max-width'] = col.width;
			}

			let f = col.render(row);

			return h('td', o, f);
		}

		function renderRow(index, row) {
			const o = {};
			const r = [];

			o.key = index;

			if (props.rowid) {
				o.rowid = row[props.rowid];
			}

			for (let i = 0; i < spec.cols.length; i += 1) {
				let v;
				const c = spec.cols[i];

				if (c.render) {
					v = renderCustomCell(c, row);
					r.push(v);
				} else {
					if (c.depth) {
						v = row;
						for (let j = 0; j < c.depth.length; j += 1) {
							if (v)
								v = v[c.depth[j]];
						}
					} else {
						v = row[c.name];
					}

					r.push(renderCell(c, v));
				}
			}

			if (props.data.onRowDblClick) {
				o.ondblclick = (event) => {
					const r = rows[event.currentTarget.rowIndex-1];
					props.data.onRowDblClick(event, r); 
				};
			} else if (props.onRowDblClick) {
				o.ondblclick = (event) => {
					const r = rows[event.currentTarget.rowIndex-1];
					props.onRowDblClick(event, r); 
				};
			}

			if (props.onRowClick) {
				o.onClick = (event) => {
					const r = rows[event.currentTarget.rowIndex-1];
					props.onRowClick(event, r);
				};
			}

			return h('tr', o, r);
		}

		function renderHeader() {
			const th = [];

			for (let i = 0; i < spec.cols.length; i += 1) {
				const s = [];

				if (spec.cols[i].label) {
					s.push(h('span', spec.cols[i].label));
				} else {
					s.push(h('span', spec.cols[i].name));
				}

				if (spec.sort && spec.sort.length > 0 && spec.sort[0].index == i) {
					if (spec.sort[0].dir == 'desc')
						s.push(h('span', { style: { float: 'right' } }, '⯆'))
					else
						s.push(h('span', { style: { float: 'right' } }, '⯅'))
				}

				const a = h('a', { href: '#', onClick(event) { orderby(i); event.preventDefault(); }, style: { display: 'block', 'font-weight': 500, 'text-decoration': 'none', color: 'black' } }, s);

				th.push(h('th', { style: { width: spec.cols[i].width ? spec.cols[i].width : 'auto', 'max-width': spec.cols[i].width ? spec.cols[i].width : 'auto' } }, [a]));
			}

			const tr = h('tr', {}, th);

			return [tr];
		}

		function renderBody() {
			const dr = [];

			if (rows && rows.length > 0) {
				for (let i = 0; i < rows.length; i += 1) {
					dr.push(renderRow(i, rows[i]));
				}
			}

			return dr;
		}

		function renderFooter() {
			const fr = h('button', { class: props.buttonclass, style: 'margin-right: .5rem', onClick: first, disabled: spec.currPage == 1 }, '\u2bc5');
			const ls = h('button', { class: props.buttonclass, style: 'margin-right: .5rem', onClick: last, disabled: spec.pageCount > 0 }, '\u2bc6');
			const pg = h('button', { class: props.buttonclass, style: 'margin-right: .5rem' }, spec.currPage);
			const pr = h('button', { class: props.buttonclass, style: 'margin-right: .5rem', onClick: prior, disabled: spec.currPage == 1 }, '\u2bc7');
			const nx = h('button', { class: props.buttonclass, style: 'margin-right: .5rem', onClick: next }, '\u2bc8');
			const td = h('td', { colspan: spec.cols.length, align: 'center' }, [fr, pr, pg, nx, ls]);
			const tr = h('tr', {}, [td]);

			return [tr];
		}
		/*****************************************************************
		 Columns
		*****************************************************************/
		let cls = [];

		if (props.data.columns) {
			cls = props.data.columns;
		} else {
			alert('not ready !')
			//cls = slots.default().map(m => m.props);
		}

		for (let i = 0; i < cls.length; i += 1) {
			let s = cls[i];

			if (s.name.indexOf('.') > -1) {
				s.depth = s.name.split('.');
			}

			spec.cols.push(s);
		}

		page(1);

		return {
			spec, rows,
			first, prior, next, last, refresh, orderby,
			renderHeader, renderCell, renderCustomCell, renderRow, renderBody, renderFooter
		};
	},

	render(props) {
		const header = h('thead', {}, this.renderHeader());
		const body = h('tbody', { 'data-time': this.spec.time}, this.renderBody());
		const footer = h('tfoot', {}, this.renderFooter());

		return h('table', {
			class: props.class,
		}, [
			header,
			body,
			footer
		]);
	}
};

export default tablevu;
