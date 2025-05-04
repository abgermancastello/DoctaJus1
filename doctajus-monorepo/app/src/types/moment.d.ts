declare module 'moment' {
  import { Moment } from 'moment';
  export = moment;

  function moment(): moment.Moment;
  function moment(date: any): moment.Moment;
  function moment(date: number): moment.Moment;
  function moment(date: string, format?: string, strict?: boolean): moment.Moment;
  function moment(date: string, format?: string, language?: string, strict?: boolean): moment.Moment;
  function moment(date: Date): moment.Moment;
  function moment(date: moment.Moment): moment.Moment;
  function moment(date: any, formats: string[], strict?: boolean): moment.Moment;

  namespace moment {
    interface Moment {
      format(format?: string): string;
      startOf(unitOfTime: string): Moment;
      endOf(unitOfTime: string): Moment;
      add(value: number, unit: string): Moment;
      subtract(value: number, unit: string): Moment;
      toDate(): Date;
      locale(locale: string): Moment;
      isValid(): boolean;
      isSame(date: Moment | string | Date, granularity?: string): boolean;
      isBefore(date: Moment | string | Date, granularity?: string): boolean;
      isAfter(date: Moment | string | Date, granularity?: string): boolean;
      [key: string]: any;
    }

    function locale(locale: string): string;
    function utc(date?: any): Moment;
    function duration(value: number, unit: string): Duration;
    function duration(time: any): Duration;

    interface Duration {
      asMilliseconds(): number;
      asSeconds(): number;
      asMinutes(): number;
      asHours(): number;
      asDays(): number;
      asWeeks(): number;
      asMonths(): number;
      asYears(): number;
      [key: string]: any;
    }
  }
}

declare module 'moment/locale/es' {}
