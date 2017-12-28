
module.exports = () => {
    return function *(next) {
        try {
			yield next;
			if (404 == this.response.status && !this.response.body) this.throw(404);
		} catch (err) {
			this.status = err.status || 500;
			this.app.emit('error', err, this);
			this.type = 'application/json';

			this.body = {
				code: this.status,
				msg: err.message,
				data: ''
			};
		}
    }
}