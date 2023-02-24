class StudentCheckoutPage {
  
    async typestudentFirstName(page,text) {
        const firstNameInput = await page.waitForSelector('#user\\[first_name\\]', {visible: true});
        await firstNameInput.type(text);
    }
  
    async typeStudentLastName(page,text) {
        const lasttNameInput = await page.waitForSelector('#user\\[last_name\\]', {visible: true});
        await lasttNameInput.type(text);
    }
    async typeStudentEmail(page,text) {
        const emailInput = await page.waitForSelector('#user\\[email\\]', {visible: true});
        await emailInput.type(text);
    }
  
    async typeStudentPassword(page,text) {
        const passwordInput = await page.waitForSelector('#user\\[password\\]', {visible: true});
        await passwordInput.type(text);
    }
  
    async clickSignUpButton(page) {
        const signUpButton = await page.waitForSelector('#sign-up', {visible: true});
        await signUpButton.click();
    }

  }
  module.exports = StudentCheckoutPage  