import * as functions from 'firebase-functions';
import 'firebase-functions';

import { getReservablePeriodsByDate } from './sclaper/kounodai';
import { fetchLastReservables, saveReservables } from './store/reservables';
import { getDiffOfIncreasedLessonPeriods } from './utils';

const configs = functions.config();
const REGION = configs.functions.region;
const API_KEY = configs.functions.api_key;
const LOGIN_URL = configs.kounodai.login_url;
const LOGIN_ID = configs.kounodai.login_id;
const LOGIN_PASS = configs.kounodai.login_pass;

exports.check = functions.region(REGION).https.onRequest(async (req, res) => {
  if (req.headers['x-api-key'] !== API_KEY) {
    res.status(401).send('not authorized');
    return;
  }

  const latestReservables = await getReservablePeriodsByDate(
    LOGIN_URL,
    LOGIN_ID,
    LOGIN_PASS,
  );
  const order = await fetchLastReservables();
  const diff = getDiffOfIncreasedLessonPeriods(latestReservables, order);
  await saveReservables(latestReservables);
  res.status(200).send(diff);

  return;
});
