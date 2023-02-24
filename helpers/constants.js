const paymentInformation = {
    creditCardNumber: '4242424242424242',
    creditCardExpDate: '0930',
    creditCardCvc: '488',
  };
  
  const expiredCreditcard = {
    creditCardNumber: '4242424242424242',
    creditCardExpDate: '0921',
    creditCardCvc: '488',
  };
  
  const e2eUserData = {
    givenName: 'E2E',
    familyName: 'User',
    email: 'e2e-partner@thinkific.com',
    password: 'P4ssword',
  };
  
  const wrongCreditcard = {
    creditCardNumber: '55555545542424242',
    creditCardExpDate: '0725',
    creditCardCvc: '488',
  };
  
  module.exports = {
    paymentInformation,
    expiredCreditcard,
    e2eUserData,
    wrongCreditcard
  };
  