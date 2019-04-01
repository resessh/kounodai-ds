import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import 'firebase-functions';
admin.initializeApp(functions.config().firebase);

const firestore = admin.firestore();
firestore.settings({
  timestampsInSnapshots: true,
});

export default admin;
export const db = firestore;
