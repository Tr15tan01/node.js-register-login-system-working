const bcrypt = require('bcryptjs');

const User = require('../models/usermodel');

exports.getBackgrounds = (req, res, next) => {
	res.render('backgrounds');
};

exports.getRegister = (req, res, next) => {
	res.render('register', { pageTitle: 'register00000', errorMessageName: '', errorMessageEmail: '', errorMessagePassword: '', errorMessageAge: '' });
};

exports.getLogin = (req, res, next) => {
	res.render('login', { pageTitle: 'login', errorMessageEmail: '', inputValue: '' });
};

exports.getIndex = (req, res, next) => {
	res.render('', { pageTitle: 'main' });
};

exports.postRegister = (req, res, next) => {
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const passCheck = req.body.password.length;
	const age = req.body.age;
	User.findOne({ email: email })
		.then((userDoc) => {
			if (userDoc) {
				console.log('user exists');
				return res.render('register', { pageTitle: 'reguster', errorMessageName: '', errorMessageEmail: 'user exists', errorMessagePassword: '', errorMessageAge: '' });
			} 
			return bcrypt.hash(password, 10).then((hashedPassword) => {
				console.log(password)
				const user = new User({
					name     : name,
					email    : email,
					password : hashedPassword,
					age      : age
				});
				user.save(function(error) {
					if (error) {
						error.errors['name'] ? errorMessageName = error.errors['name'].message : errorMessageName = '';
						error.errors['email'] ? errorMessageEmail = error.errors['email'].message : errorMessageEmail = '';
						passCheck < 6 ? errorMessagePassword = 'password must be minimm 6' : errorMessagePassword = '';
						error.errors['age'] ? errorMessageAge = error.errors['age'].message : errorMessageAge = '';
							//console.log(error.errors['password'].message)
						// console.log('fuckin error', error.errors['age'].message);
						console.log('fuckin error', error);
						return res.render('register', {
							pageTitle: 'regeester',
							errorMessageName: errorMessageName,
							errorMessageEmail: errorMessageEmail, 
							errorMessagePassword: errorMessagePassword,
							errorMessageAge: errorMessageAge
						});
					}
					else {
						console.log('else');
						return res.redirect('/login');
					}
				});
			});
		})
		.catch((err) => {
			console.log('fuckin error', err);
			//return res.render('register', { pageTitle: 'regeester', errorMessage: error.errors['age'].message })
		});
};

exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;
	req.session.isLoggedIn = true;
	//console.log(req.session);
	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				// req.flash('error', 'Invalid email or password.');
				console.log('user or pass problem');
				return res.render('login', { errorMessageEmail: 'user or pass prob', pageTitle: 'login', inputValue: '' });
			}
			bcrypt
				.compare(password, user.password)
				.then((doMatch) => {
					if (doMatch) {
						console.log(req.session, 'sesione');
						req.session.isLoggedIn = true;
						req.session.user = user;
						return req.session.save((err) => {
							console.log(err);
							console.log('logged');
							return res.redirect('/');
						});
					}
					res.render('login', { errorMessageEmail: 'pass prob', pageTitle: 'login', inputValue: email });
					console.log('password problem');
				})
				.catch((err) => {
					console.log(err);
					res.redirect('/login');
				});
		})
		.catch((err) => console.log(err));
};
