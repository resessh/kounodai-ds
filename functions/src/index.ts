import * as functions from 'firebase-functions';
import 'firebase-functions';

// @ts-ignore
import flat from 'array.prototype.flat';
flat.shim();

import { getReservablePeriodsByDate } from './sclaper/kounodai';
import { fetchLastReservables, saveReservables } from './store/reservables';
import { postMessage } from './apis/slack';
import { getDiffOfIncreasedLessonPeriods, createSlackMessage } from './utils';
import { TLessonPeriodsByDate } from './types';

const configs = functions.config();
const REGION = configs.functions.region;
const API_KEY = configs.functions.api_key;
const LOGIN_URL = configs.kounodai.login_url;
const LOGIN_ID = configs.kounodai.login_id;
const LOGIN_PASS = configs.kounodai.login_pass;

exports.check = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '512MB',
  })
  .region(REGION)
  .https.onRequest(async (req, res) => {
    if (req.headers['x-api-key'] !== API_KEY) {
      res.status(401).send({ message: 'not authorized' });
      return;
    }

    let latestReservables: TLessonPeriodsByDate;
    try {
      latestReservables = await getReservablePeriodsByDate(
        LOGIN_URL,
        LOGIN_ID,
        LOGIN_PASS,
      );
    } catch (error) {
      console.log('Fail to sclape system.', error);
      return;
    }

    let order;
    try {
      order = await fetchLastReservables();
    } catch (error) {
      console.log('Fail to fetch latest reservables.', error);
      return;
    }

    const diff = getDiffOfIncreasedLessonPeriods(latestReservables, order);

    const message = createSlackMessage(diff);
    if (Object.keys(diff).length > 0) {
      try {
        await postMessage(message);
      } catch (error) {
        console.log(error);
      }
    }
    await saveReservables(latestReservables);
    res.status(200).send({ message: 'succeed' });

    return;
  });
