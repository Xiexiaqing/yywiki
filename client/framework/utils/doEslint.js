try {
	var cli = require("../../node_modules/eslint/lib/cli");
	
	cli.execute(process.argv);
	process.exit(0);
} catch (e) {
	console.log('');
	console.log('You Must Run "npm install" First, And run "npm run mv" !');
	console.log('Then You Can Do the Test!');
	console.log('=========================================================');
	process.exit(1);
}
