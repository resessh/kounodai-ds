import puppeteer from 'puppeteer';

import { waitFor } from '../utils';
import { TLessonPeriodsByDate } from '../types';

export const getReservablePeriodsByDate = async (
  loginUrl: string,
  loginId: string,
  loginPass: string,
): Promise<TLessonPeriodsByDate> => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // 1. access the landing page to get generated login page url.
  await page.goto(loginUrl);
  await waitFor(800);
  await Promise.all([page.click('#lnkToLogin'), page.waitForNavigation()]);

  // 2. login.
  const frame = await page
    .frames()
    .find(frame => /ZAD00YI200_Login.aspx/.test(frame.url()));
  if (!frame) return;
  await frame.type('#txtKyoushuuseiNO', loginId);
  await frame.type('#txtPassword', loginPass);
  await waitFor(1000);
  await Promise.all([
    frame.click('#btnAuthentication'),
    frame.waitForNavigation(),
  ]);

  // 3. access the reservation page.
  await waitFor(500);
  await Promise.all([
    frame.click('#btnMenu_Kyoushuuyoyaku'),
    frame.waitForNavigation(),
  ]);

  ////////////////////
  // FOR DEVELOPING
  ////////////////////
  await waitFor(1000);
  await Promise.all([
    frame.select('#ddlWeeks', '2019/04/17 0:00:00'),
    frame.waitForNavigation(),
  ]);

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
