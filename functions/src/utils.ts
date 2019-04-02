import * as functions from 'firebase-functions';
import { format } from 'date-fns';
import { TLessonPeriodsByDate, TLessonPeriods, TLessonPeriod } from './types';

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

const getDurationTextFromPeriod = (period: TLessonPeriod): string => {
  const durationOfPeriodMap = [
    '',
    '8:10〜9:00',
    '9:10～10:00',
    '10:10～11:00',
    '11:10～12:00',
    '13:00～13:50',
    '14:00～14:50',
    '15:00～15:50',
    '16:00～16:50',
    '17:00～17:50',
    '18:00～18:50',
  ];

  return durationOfPeriodMap[period];
};

const SLACK_USER_ID = functions.config().slack.user_id;
export const createSlackMessage = (diff: TLessonPeriodsByDate) => {
  const textContent = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `<@${SLACK_USER_ID}> *教習期限5/21のお前* が予約できる新しい空き枠を見つけました。`,
    },
  };

  const reservables = Object.entries(diff)
    .map(([date, periods]) => {
      const periodsText = periods
        .map(
          period => `${period}時限　( ${getDurationTextFromPeriod(period)} )`,
        )
        .join('\n');

      return {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*日付:*\n${format(date, 'YYYY/M/D')}`,
          },
          {
            type: 'mrkdwn',
            text: `*時限:*\n${periodsText}`,
          },
        ],
      };
    })
    .map(section => [section, { type: 'divider' }])
    .flat();

  return {
    blocks: [textContent, ...reservables],
  };
};
