import { h, reactive, watch } from 'vue';

const tablevueStatuses = { Error: -1, Ready: 0, Loading: 1 };

const tablevue = {
	props: {
		data: { type: [Array, Object] },
		search: { type: String },
		rowid: { type: String }
	},

	setup(props) {
		let cols = [];
		let rows = [];

		return { cols, rows };
	},

	render(props) {
		return h('table', {
			class: props.class,
		}, [
			//caption,
			//header,
			//body,
			//footer
		]);
	}
};

export default tablevue;
