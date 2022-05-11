const RTB_HOLIDAYS_CONFIG = {
  2021: [
      'Jan 01 2021', // new years
      'Feb 15 2021', // family day
      'Apr 02 2021', // good friday
      'Apr 05 2021', // good friday
      'May 24 2021', // victoria day
      'Jul 01 2021', // canada day
      'Aug 02 2021', // bc day
      'Sep 06 2021', // labour day
      'Oct 11 2021', // thanksgiving day
      'Nov 11 2021', // thanksgiving day
      'Dec 27 2021', // boxing day
  ],
  2022: [
      'Jan 03 2022', // new years
      'Feb 21 2022', // family day
      'Apr 15 2022', // good friday
      'Apr 18 2022', // good friday
      'May 23 2022', // victoria day
      'Jul 01 2022', // canada day
      'Aug 01 2022', // bc day
      'Sep 05 2022', // labour day
      'Oct 10 2022', // thanksgiving day
      'Nov 11 2022', // thanksgiving day
      'Dec 26 2022', // christmas day
  ],
  2023: [
      'Jan 02 2023', // new years
      'Feb 20 2023', // family day
      'Apr 07 2023', // good friday
      'Apr 10 2023', // good friday
      'May 22 2023', // victoria day
      'Jul 03 2023', // canada day
      'Aug 07 2023', // bc day
      'Sep 04 2023', // labour day
      'Oct 09 2023', // thanksgiving day
      'Nov 11 2023', // thanksgiving day
      'Dec 25 2023', // christmas day
      'Dec 26 2023', // boxing day
  ],
  2024: [
      'Jan 01 2024', // new years
      'Feb 19 2024', // family day
      'Mar 29 2024', // good friday
      'Apr 01 2024', // good friday
      'May 20 2024', // victoria day
      'Jul 01 2024', // canada day
      'Aug 05 2024', // bc day
      'Sep 02 2024', // labour day
      'Oct 14 2024', // thanksgiving day
      'Nov 11 2024', // thanksgiving day
      'Dec 25 2024', // christmas day
      'Dec 26 2024', // boxing day
  ],
  2025: [
      'Jan 01 2025', // new years
      'Feb 17 2025', // family day
      'Apr 18 2025', // good friday
      'Apr 21 2025', // good friday
      'May 19 2025', // victoria day
      'Jul 01 2025', // canada day
      'Aug 04 2025', // bc day
      'Sep 01 2025', // labour day
      'Oct 13 2025', // thanksgiving day
      'Nov 11 2025', // thanksgiving day
      'Dec 25 2025', // christmas day
      'Dec 26 2025', // boxing day
  ]
};
const _DATE_FORMAT = 'MMM DD YYYY';

const isHoliday = (momentDate) => {
  if (!momentDate || !Moment(momentDate).isValid()) return false;
  const year = momentDate.year();
  return (year in RTB_HOLIDAYS_CONFIG)
    && (RTB_HOLIDAYS_CONFIG[year].find(dateStr => Moment(dateStr, _DATE_FORMAT).isSame(momentDate, 'day')));
};

export { RTB_HOLIDAYS_CONFIG, isHoliday };
