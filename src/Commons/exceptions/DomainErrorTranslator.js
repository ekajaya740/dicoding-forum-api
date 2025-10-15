const InvariantError = require('./InvariantError');
const NotFoundError = require('./NotFoundError');
const AuthorizationError = require('./AuthorizationError');

const createTranslation = (message, ErrorConstructor = InvariantError) => Object.freeze({
  message,
  ErrorConstructor,
});

const ERROR_TRANSLATIONS = Object.freeze({
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': createTranslation('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': createTranslation('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': createTranslation('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': createTranslation('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': createTranslation('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': createTranslation('username dan password harus string'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': createTranslation('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': createTranslation('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': createTranslation('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': createTranslation('refresh token harus string'),
  'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': createTranslation('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada'),
  'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': createTranslation('tidak dapat membuat thread baru karena tipe data tidak sesuai'),
  'NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': createTranslation('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada'),
  'NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': createTranslation('tidak dapat membuat komentar baru karena tipe data tidak sesuai'),
  'NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY': createTranslation('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada'),
  'NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': createTranslation('tidak dapat membuat balasan baru karena tipe data tidak sesuai'),
  'GET_COMMENT.COMMENT_NOT_FOUND': createTranslation('komentar tidak ditemukan', NotFoundError),
  'AUTHORIZATION_ERROR.UNAUTHORIZED': createTranslation('anda tidak berhak mengakses resource ini', AuthorizationError),
});

const ERROR_MESSAGES = Object.freeze(Object.fromEntries(
  Object.entries(ERROR_TRANSLATIONS).map(([key, value]) => [key, value.message]),
));

const DomainErrorTranslator = {
  translate(error) {
    const translation = ERROR_TRANSLATIONS[error.message];

    if (!translation) {
      return error;
    }

    const { ErrorConstructor, message } = translation;

    return new ErrorConstructor(message);
  },
  getMessage(key) {
    return ERROR_MESSAGES[key];
  },
  messages: ERROR_MESSAGES,
};

module.exports = DomainErrorTranslator;
