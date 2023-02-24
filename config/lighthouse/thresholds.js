/**
* @fileoverview This file provides different thresholds settings to be used during tests runs.
* You can choose to run tests audits on all webpages either with the default or custom thresholds 
* By setting environment variable `--THRESHOLDS=default` will run audits with defaultThresholds configuration.
* Setting environment variable `--THRESHOLDS=custom` will run audits with custom thresholds pre-defined for each critical user journey. 

********************************************************** Audit categories ***********************************************************************
** performance: "is judged on how quick it takes the webpage to load."
** accessibility: "is judged by how accessible the website is. Especially for users who might require technology 
**                 such as a screen reader or have difficulty with colors. 
** best-practices: "are judged by factors which will usually only be apparent to developers. This will be on code health, 
**                  for example, Using deprecated Libraries/APIs, Asking for permission if you want the users locations 
**                  and making sure that it is a secure connection of HTTPS."
** pwa: "(Progressive Web Apps) does not receive a score, it is either there or not. This is still a rather early technology but makes websites run 
**       faster on repeated views."
** seo: "(Search Engine Optimisation) is judged by making sure the page is optimised for search engine results. 
**       This is a large area of website design but some simple examples could be Header names and using keywords, Making sure images have 
**       descriptive names so a search engine can label them."
********************************************************** Audit categories ***********************************************************************/

  //default thresholds to apply across any webpage visited during tests runs
  const defaultThresholds = {
    performance: 0.60,
    accessibility: 0.90,
    seo: 0.70,
    'best-practices': 0.90,
    pwa: 0
  };

  //custom thresholds for webpages visited during critical journey: students checkout 
  const studentCheckoutThresholds = {
    performance: 0.70,
    accessibility: 0.95,
    seo: 0.75,
    'best-practices': 0.90,
    pwa: 0
  };
  
  module.exports = {
    defaultThresholds,
    studentCheckoutThresholds
  };
  