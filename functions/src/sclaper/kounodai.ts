import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

import { waitFor } from '../utils';
import { TLessonPeriodsByDate, TLessonPeriod } from '../types';

const NAVIGAION_TIMEOUT = 12000;
let page: puppeteer.Page | undefined;

const getPage = async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
  return browser.newPage();
};

export const getReservablePeriodsByDate = async (
  loginUrl: string,
  loginId: string,
  loginPass: string,
): Promise<TLessonPeriodsByDate> => {
  if (!page) {
    page = await getPage();
  }

  // 1. access the landing page to get generated login page url.
  await page.goto(loginUrl, {
    timeout: NAVIGAION_TIMEOUT,
    waitUntil: 'networkidle0',
  });
  await waitFor(800);
  await Promise.all([
    page.waitForNavigation({
      timeout: NAVIGAION_TIMEOUT,
      waitUntil: 'networkidle0',
    }),
    page.click('#lnkToLogin'),
  ]);

  // 2. login.
  const frame = await page
    .frames()
    .find(frame => /ZAD00YI200_Login.aspx/.test(frame.url()));
  if (!frame) throw new Error('no frame to sclape');
  await frame.type('#txtKyoushuuseiNO', loginId);
  await frame.type('#txtPassword', loginPass);
  await waitFor(1000);
  await Promise.all([
    frame.waitForNavigation({
      timeout: NAVIGAION_TIMEOUT,
      waitUntil: 'networkidle0',
    }),
    frame.click('#btnAuthentication'),
  ]);

  // 3. access the reservation page.
  await waitFor(500);
  await Promise.all([
    frame.waitForNavigation({
      timeout: NAVIGAION_TIMEOUT,
      waitUntil: 'networkidle0',
    }),
    frame.click('#btnMenu_Kyoushuuyoyaku'),
  ]);

  ////////////////////
  // FOR DEVELOPING
  ////////////////////
  // await waitFor(1000);
  // await Promise.all([
  //   frame.select('#ddlWeeks', '2019/04/17 0:00:00'),
  //   frame.waitForNavigation(),
  // ]);

  // 4. get dates.
  const dates = await frame.$$eval(
    '#lst_lc div > .blocks > .shrink',
    iconElements => {
      const dateRegExp = /\d{4}\/\d{2}\/\d{2}/;

      return iconElements.map(
        icon => icon.parentElement!.textContent!.match(dateRegExp)![0],
      );
    },
  );

  // 5. get reservables.
  const reservables = await frame.$$eval(
    '#lst_lc .list-container',
    reservableListElements => {
      const periodRegExp = /\d{2}時限/g;
      return Array.from(reservableListElements).map(reservableListElement => {
        const vacantPeriods = (reservableListElement as HTMLElement).innerText.match(
          periodRegExp,
        );
        return Array.isArray(vacantPeriods)
          ? vacantPeriods.map(
              periodName => parseInt(periodName, 10) as TLessonPeriod,
            )
          : [];
      });
    },
  );

  return dates.reduce(
    (accumulator, date, index) => ({
      ...accumulator,
      [date]: reservables[index],
    }),
    {},
  );
};
