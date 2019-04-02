import * as functions from 'firebase-functions';
import axios from 'axios';

const WEBHOOK_URL = functions.config().slack.webhook;

export const postMessage = (message: any) => axios.post(WEBHOOK_URL, message);
