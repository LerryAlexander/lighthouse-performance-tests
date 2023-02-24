'use strict'; 
/**
* @fileoverview Example Jest tests for demonstrating how to run Lighthouse on thinkific web pages 
* as part of performance ui tests using specific user journeys. 
* More info at https://github.com/GoogleChrome/lighthouse/blob/master/docs/recipes/integration-test/example-lh-auth.test.js
*/

const {production, development} = require('../../../../config/environment');
const environment = process.env.TESTENV === 'development' ? development : production;
const domain = environment.DOMAIN;
const protocol = environment.PROTOCOL;
const port = environment.PORT;
const tenant = 'lerry-s-school-4d7b';

const thresholdsConfig = require('../../../../config/lighthouse/thresholds');
const thresholds = process.env.THRESHOLDS === 'custom' ? thresholdsConfig.studentCheckoutThresholds : thresholdsConfig.defaultThresholds;
const {startBrowser, gotoCourse, gotoUrl, lighthouseTest, closeBrowser, newStudentSignUp, enrollCourseWithCoupon} = require('./../../../../helpers/common');
const CourseInformation = {
  monthPaymentCourse: 'performance-testing-with-lighthouse',
};
const coursesPageUrl = `${protocol}${tenant}${domain}${port}/courses/${CourseInformation.monthPaymentCourse}`;
const signUpPageUrl = `${protocol}${tenant}${domain}${port}/users/sign_up`;

describe('Student buys a course with coupon 100% off discount', () => {

  let driver;
  let page;
  
  beforeAll(async () => {
    driver = await startBrowser(); 
    page = driver.page;
    await gotoCourse(page, tenant, CourseInformation.monthPaymentCourse);
    await page.waitForSelector('.button.button-primary.button-purchase', {visible: true});
  });

  describe('using coupon code', () => {
    it('should be able to audit web page: courses', async () => {
      const lhr = await lighthouseTest(driver, coursesPageUrl); //perform lighthouse test with the specified page url
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('seo', thresholds.seo);
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('accessibility', thresholds.accessibility);
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('performance', thresholds.performance);
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('best-practices', thresholds['best-practices']);
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('pwa', thresholds.pwa);
    });

    it('should be able to audit web page: create a new account', async () => {
      await gotoUrl(page, tenant, '/users/sign_up')
      const lhr = await lighthouseTest(driver, signUpPageUrl); //perform lighthouse test with the specified page url
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('seo', 0.8);
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('performance', 0.6);
      await newStudentSignUp(page);
      await gotoCourse(page, tenant, CourseInformation.monthPaymentCourse);
      await Promise.all([
        await page.waitForSelector('.button.button-primary.button-purchase', {visible: true}),
        await page.click('.button.button-primary.button-purchase', {visible: true}),
      ]);
    });

    it('should be able to audit web page: complete purchase to start learning', async () => {
      const lhr = await lighthouseTest(driver); //perform lighthouse test with the current page running on the test
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('seo', thresholds.seo);
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('accessibility', thresholds.accessibility);
      await enrollCourseWithCoupon(page, "firstcoursecoupon100");
    });

    it('should be able to audit web page: thank you page', async () => {
      const lhr = await lighthouseTest(driver); //perform lighthouse test with the current page running on the test
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('seo', thresholds.seo);
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('accessibility', thresholds.accessibility);
      expect(lhr).toHaveLighthouseScoreGreaterThanOrEqual('performance', thresholds.performance);
    });
  });

  afterAll(async () => {
    await closeBrowser(driver);
  })

});