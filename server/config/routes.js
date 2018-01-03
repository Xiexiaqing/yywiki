module.exports = {
	'/': {
		controller: 'app'
	},

	'/api/get/feed/list': {
		controller: 'list/list',
		model: ['Feed', 'User']
	},

	'/api/do/create': {
		controller: 'create/create',
		model: ['Feed'],
		method: 'post'
	},
	
	'/api/do/signup': {
		controller: 'signup/signup',
		model: ['User'],
		method: 'post'
	},

	'/api/do/signin': {
		controller: 'signin/signin',
		model: ['User'],
		method: 'post'
	},

	'/api/do/check/token': {
		controller: 'token/check',
		model: [],
		method: 'get'
	},

	'/api/get/user/info': {
		controller: 'user/get_info',
		model: ['User', 'Feed'],
		method: 'get'
	}
};