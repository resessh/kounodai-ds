export type TLessonPeriod = 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9 | 10 | 11;
export type TLessonPeriods = TLessonPeriod[];
export type TLessonPeriodsByDate = {
  [date: string]: TLessonPeriods;
};
