const DomainErrorTranslator = require('../DomainErrorTranslator');
const ClientError = require('../ClientError');
const NotFoundError = require('../NotFoundError');
const AuthorizationError = require('../AuthorizationError');

describe('DomainErrorTranslator', () => {
  it('should translate error correctly', () => {
    const translatedEntries = Object.entries(DomainErrorTranslator.messages);

    translatedEntries.forEach(([errorKey, errorMessage]) => {
      const translatedError = DomainErrorTranslator.translate(new Error(errorKey));

      expect(translatedError).toBeInstanceOf(ClientError);
      expect(translatedError.message).toEqual(errorMessage);
    });
  });

  it('should translate specific error using correct error class', () => {
    const translatedError = DomainErrorTranslator.translate(new Error('GET_COMMENT.COMMENT_NOT_FOUND'));

    expect(translatedError).toBeInstanceOf(NotFoundError);
    expect(translatedError.message).toEqual(DomainErrorTranslator.getMessage('GET_COMMENT.COMMENT_NOT_FOUND'));
  });

  it('should translate authorization error using authorization error class', () => {
    const translatedError = DomainErrorTranslator.translate(new Error('AUTHORIZATION_ERROR.UNAUTHORIZED'));

    expect(translatedError).toBeInstanceOf(AuthorizationError);
    expect(translatedError.message).toEqual(DomainErrorTranslator.getMessage('AUTHORIZATION_ERROR.UNAUTHORIZED'));
  });

  it('should return original error when error message is not needed to translate', () => {
    // Arrange
    const error = new Error('some_error_message');

    // Action
    const translatedError = DomainErrorTranslator.translate(error);

    // Assert
    expect(translatedError).toStrictEqual(error);
  });
});
