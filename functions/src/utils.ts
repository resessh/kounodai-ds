import { TLessonPeriodsByDate, TLessonPeriods } from './types';

export const waitFor = async (milliseconds: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
};

export const getDiffOfIncreasedLessonPeriods = (
  newer: TLessonPeriodsByDate,
  older: TLessonPeriodsByDate,
) => {
  return Object.entries(newer)
    .map(([date, lessonPeriods]) => {
      const increasedLessonPeriods = lessonPeriods.filter(lessonPeriod => {
        const olderPeriods = older[date];
        return olderPeriods ? !olderPeriods.includes(lessonPeriod) : true;
      });

      return [date, increasedLessonPeriods];
    })
    .filter(([date, lessonPeriods]) => {
      return (lessonPeriods as TLessonPeriods).length > 0;
    })
    .reduce(
      (accumulator, [date, lessonPeriods]) => ({
        ...accumulator,
        [date as string]: lessonPeriods as TLessonPeriods,
      }),
      {},
    );
};
