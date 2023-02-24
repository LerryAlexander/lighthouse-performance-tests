/**
* @fileoverview Common actions to be called when tests start running
*/
'use strict';
 
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const {URL} = require('url');
const fs = require('fs');
const {production, development} = require('../config/environment.js');
const { paymentInformation } = require('../helpers/constants');
const faker = require('faker');
const StudentCheckoutPage = require('../page-objects/student-experience/student-checkout-page');
const path = require('path')

const environment = process.env.TESTENV === 'development' ? development : production;

const domain = environment.DOMAIN;
const protocol = environment.PROTOCOL
const port = environment.PORT;

//If DEBUG=false (default) means that tests will run headless and faster.
//If DEBGUG=true means that tests will run headed and slow motion actions will be slower for better debugging. 
const debug = process.env.DEBUG || false; //DEBUG env variable can be set when running tests through command line, e.g: npm run test --DEBUG=true

/**
 * @param {int} remoteDebugPort (optional) Only if you want puppeteer to open chromium on a specific port number
 * @return {object} Returns both puppeteer.Browser and puppeteer.Page from puppeteer launch() and newPage() respectively.
 */
async function startBrowser(remoteDebugPort) {
    let argments = remoteDebugPort ? `--shm-size=1gb,--remote-debugging-port=${remoteDebugPort},--ash-host-window-bounds` : '--ash-host-window-bounds';
    const browser = await puppeteer.launch({
        args: [argments],
        headless: !debug, 
        defaultViewport: null,
        slowMo: debug ? 15 : 5
    });
    const page = await browser.newPage();
    return {browser, page};
}

/**
 * @param {object} driver Provided by function startBrowser()
 */
 async function closeBrowser(driver) {
    await driver.browser.close();
    await driver.browser.disconnect();
}

/**
 * @param {import('puppeteer').Page} page
 * @param {string} tenant
 * @param {string} course
 */
async function gotoCourse(page, tenant, course) {
    let tenantData = await getTenant(tenant);
    const coursePath = `${protocol}${tenantData.subdomain}${domain}${port}/courses/`;
    await Promise.all([
        page.goto(coursePath + course),
        page.waitForNavigation({waitUntil: ['networkidle0']})
      ])
}

/**
 * @param {import('puppeteer').Page} page
 * @param {string} tenant
 * @param {string} endpoint
 */
 async function gotoUrl(page, tenant, endpoint) {
  let tenantData = await getTenant(tenant);
  const coursePath = `${protocol}${tenantData.subdomain}${domain}${port}`;
  await Promise.all([
      page.goto(coursePath + endpoint),
      page.waitForNavigation({waitUntil: ['networkidle0']})
    ])
}

async function getTenant(tenant) {
    const tenants = require('../fixtures/tenants.json');
    return tenants[tenant];
};

/**
 * Lighthouse opens url and tests it.
 * @param {object} driver (required) Provided by function startBrowser()
 * @param {string} url (optional) Url to be audit, if not provided, lighthouse will open the current url.
 * @param {int} remoteDebugPort (optional) Only if you want lighthouse to open browser on a specific port number, 
 *                               otherwise it will use the same port opened by puppeter.launch() from startBrowser() function.
 * @return {Promise<LH.Result>} Lighthouse audit results.
 */
async function lighthouseTest(driver, url, remoteDebugPort) {
    let portNumber = remoteDebugPort ? remoteDebugPort : (new URL(driver.browser.wsEndpoint())).port;
    url = url ? url : driver.page.url();;
    await driver.page.cookies(url);
    let cookies = await driver.page.cookies();
    const runnerResult = await lighthouse(url, {
        extends: 'lighthouse:default',
        formFactor: 'desktop',
        screenEmulation: { disabled: true },
        port: portNumber,
        output: 'html',
        logLevel: 'error',
        disableStorageReset: true,
        extraCookies: cookies
    });
    // Save html report.
    const workingDir = path.dirname(module.parent.filename)
    var dir = workingDir.split('/tests/')[1];
    dir = './results/'+dir;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    var filename = runnerResult.lhr.fetchTime
    fs.writeFileSync(dir+'/'+filename+'.html', runnerResult.report);
    return runnerResult.lhr;
}

// This provide a nice way to assert a score for a category.
// Note, you could just use `expect(lhr.categories.seo.score).toBeGreaterThanOrEqual(0.9)`,
// but by using a custom matcher a better error report is generated.
expect.extend({
    toHaveLighthouseScoreGreaterThanOrEqual(lhr, category, threshold) {
      const score = lhr.categories[category].score;
      const auditsRefsByWeight = [...lhr.categories[category].auditRefs]
        .filter((auditRef) => auditRef.weight > 0)
        .sort((a, b) => b.weight - a.weight);
      const report = auditsRefsByWeight.map((auditRef) => {
        const audit = lhr.audits[auditRef.id];
        const status = audit.score === 1 ?
          this.utils.EXPECTED_COLOR('○') :
          this.utils.RECEIVED_COLOR('✕');
        const attrs = this.utils.DIM_COLOR(`[weight: ${auditRef.weight}, score: ${audit.score}]`);
        const error = audit.errorMessage ? ` ${audit.errorMessage}` : '';
        return `\t${status} ${attrs} ${audit.id}${error}`;
      }).join('\n');
  
      if (score >= threshold) {
        return {
          pass: true,
          message: () =>
            `expected category ${category} to be < ${threshold}, but got ${score}\n${report}`,
        };
      } else {
        return {
          pass: false,
          message: () =>
            `expected category ${category} to be >= ${threshold}, but got ${score}\n${report}`,
        };
      }
    },
  });

async function dataGenerator(){
    const firstName = faker.name.findName();
    const lastName = faker.name.findName();
    const email = faker.internet.email();
    return { firstName, lastName, email };
}

async function newStudentSignUp(page){
    const user = await dataGenerator();
    var studentCheckoutPage = new StudentCheckoutPage();
    await studentCheckoutPage.typestudentFirstName(page, user.firstName)
    await studentCheckoutPage.typeStudentLastName(page, user.lastName)
    await studentCheckoutPage.typeStudentEmail(page, user.email)
    await studentCheckoutPage.typeStudentPassword(page, 'Password!1')
    await Promise.all([
        studentCheckoutPage.clickSignUpButton(page),
        page.waitForNavigation(),
    ]);
}

async function enrollCourseWithCoupon(page, couponText){
  const haveCouponButton = await page.waitForXPath('//*[text()[contains(.,"Have a coupon?")]]');
  await haveCouponButton.click();
  const couponInput = await page.waitForSelector('#coupon-code', {visible: true});
  await couponInput.type(couponText);
  const applyButton = await page.waitForXPath('//button[text()[contains(.,"Apply")] and @type="submit"]');
  await applyButton.click();
  const purchaseButton = await page.waitForXPath('//button[text()[contains(.,"Complete purchase")] and @type="submit" and not(@aria-disabled)]');
  purchaseButton.click();
  await page.waitForNavigation();
}

async function enrollCourseWithCreditCard(page, {withCreditCardNumber, withCreditCardExpDate, withCreditCardCvc}) {
  const numb = withCreditCardNumber || paymentInformation.creditCardNumber;
  const date = withCreditCardExpDate || paymentInformation.creditCardExpDate;
  const cvc = withCreditCardCvc || paymentInformation.creditCardCvc;
    
  const frametHandle = await page.waitForSelector('iframe');
  const iframe = await frametHandle.contentFrame();
  await iframe.type('[name="cardnumber"', numb);
  await iframe.type('[name="exp-date"]', date);
  await iframe.type('[name="cvc"]', cvc);
  await iframe.$eval('[type="submit"]', button => button.click());
  await Promise.all([
    page.waitForNavigation({waitUntil: ['networkidle0']})
  ]);
}

module.exports = {
    startBrowser,
    gotoCourse,
    gotoUrl,
    lighthouseTest,
    closeBrowser, 
    newStudentSignUp,
    enrollCourseWithCoupon,
    enrollCourseWithCreditCard
};