const { User } = require('../db/models');
const bcrypt = require('bcrypt');

exports.isValid = (req, res, next) => {
  const { name, password, email } = req.body;
  if(name && password && email) next();
  else res.status(401).end();
};

exports.createUserAndSession = async (req, res, next) => {
  const { name, password, email } = req.body;
  console.log('req.body: ', req.body);
  try {
    // Мы не храним пароль в БД, только его хэш
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);


    const user = await User.create({
      name,
      password: hashedPassword,
      email,
    });
// console.log(user);
    // записываем в req.session.user данные (id & name) (создаем сессию)
  req.session.user = {id: user.id, name: name}; // req.session.user -> id, name
 
  } catch (err) {
    console.error('Err message:', err.message);
    console.error('Err code', err.code);
    return failAuth(res, err.message);
  }
  res.redirect('/entries') // ответ 200 + автоматическое создание и отправка cookies в заголовке клиенту
};

exports.checkUserAndCreateSession = async (req, res, next) => {
  const { name, password } = req.body;
  try {
    // Пытаемся сначала найти пользователя в БД
    const user = await User.findOne({ where: { name: name }, raw: true });
    if (!user) return failAuth(res, ' Неправильное имя/пароль');

    // Сравниваем хэш в БД с хэшем введённого пароля
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return failAuth(res, ' Неправильное имя\\пароль');

    req.session.user = {id: user.id, name: user.name}; // записываем в req.session.user данные (id & name) (создаем сессию)

  } catch (err) {
    console.error('Err message:', err.message);
    console.error('Err code', err.code);
    return failAuth(res, err.message);
  }
  res.redirect('/entries') // ответ 200 + автоматическое создание и отправка cookies в заголовке клиенту
};

exports.destroySession = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('sid');
    res.redirect('/');
  });
}

exports.renderSignInForm = (req, res) => res.render('entries/signin', { isSignin: true });

exports.renderSignUpForm = (req, res) => res.render('entries/signup', { isSignup: true });

exports.renderProfile = (req, res) => res.render('entries/profile', { isSignin: true });

/**
 * Завершает запрос с ошибкой аутентификации
 * @param {object} res Ответ express
 * @param err  сообщение об ошибке
 */
function failAuth(res, err) {
  return res.status(401).json({err: err});
}