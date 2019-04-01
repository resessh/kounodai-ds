import { db } from '../firebase';
import { TLessonPeriodsByDate } from '../types';

const TABLE_NAME = 'reservable_snapshots';

export const fetchLastReservables = async (): Promise<TLessonPeriodsByDate> => {
  const lastSnapshot = await db
    .collection(TABLE_NAME)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  return lastSnapshot.docs[0].data().reservables || {};
};

export const saveReservables = async (reservables: TLessonPeriodsByDate) => {
  await db.collection(TABLE_NAME).add({
    createdAt: new Date(),
    reservables,
  });
};
