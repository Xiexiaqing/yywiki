module.exports = {
	'/': {
		controller: 'app'
	},

	'/api/get/feed/list': {
		controller: 'list/list',
		model: ['Feed']
	},

	'/api/do/create': {
		controller: 'create/create',
		model: ['Feed'],
		method: 'post'
	}
};