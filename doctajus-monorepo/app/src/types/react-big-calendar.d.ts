declare module 'react-big-calendar' {
  import { ComponentType, CSSProperties, ReactNode, SyntheticEvent } from 'react';

  export interface Event {
    id?: string | number;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
    tipo?: string;
    descripcion?: string;
    expedienteId?: string | number;
    [key: string]: any;
  }

  export type View = string;

  export interface ViewStatic {
    name: string;
    displayName: string;
    [key: string]: any;
  }

  export const Views: {
    MONTH: string;
    WEEK: string;
    WORK_WEEK: string;
    DAY: string;
    AGENDA: string;
    [key: string]: string;
  };

  export interface EventProps {
    event: Event;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource?: any;
    style?: CSSProperties;
    className?: string;
    [key: string]: any;
  }

  export interface CalendarProps {
    localizer: any;
    events: Event[];
    view?: string;
    onView?: (view: string) => void;
    date?: Date;
    onNavigate?: (date: Date, view: string, action: string) => void;
    length?: number;
    toolbar?: boolean;
    popup?: boolean;
    onSelectEvent?: (event: Event, e: SyntheticEvent) => void;
    onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[]; action: string }) => void;
    selectable?: boolean;
    components?: {
      event?: ComponentType<any>;
      agenda?: {
        event?: ComponentType<any>;
        date?: ComponentType<any>;
        time?: ComponentType<any>;
      };
      day?: {
        event?: ComponentType<any>;
        header?: ComponentType<any>;
      };
      month?: {
        event?: ComponentType<any>;
        dateHeader?: ComponentType<any>;
        header?: ComponentType<any>;
      };
      week?: {
        event?: ComponentType<any>;
        header?: ComponentType<any>;
      };
      [key: string]: any;
    };
    messages?: {
      allDay?: string;
      previous?: string;
      next?: string;
      today?: string;
      month?: string;
      week?: string;
      day?: string;
      agenda?: string;
      date?: string;
      time?: string;
      event?: string;
      showMore?: (total: number) => string;
      [key: string]: string | undefined | ((total: number) => string);
    };
    formats?: {
      dateFormat?: string | ((date: Date, culture?: string, localizer?: any) => string);
      dayFormat?: string | ((date: Date, culture?: string, localizer?: any) => string);
      weekdayFormat?: string | ((date: Date, culture?: string, localizer?: any) => string);
      timeGutterFormat?: string | ((date: Date, culture?: string, localizer?: any) => string);
      monthHeaderFormat?: string | ((date: Date, culture?: string, localizer?: any) => string);
      dayRangeHeaderFormat?: string | ((range: { start: Date; end: Date }, culture?: string, localizer?: any) => string);
      dayHeaderFormat?: string | ((date: Date, culture?: string, localizer?: any) => string);
      agendaDateFormat?: string | ((date: Date, culture?: string, localizer?: any) => string);
      agendaTimeFormat?: string | ((date: Date, culture?: string, localizer?: any) => string);
      agendaTimeRangeFormat?: string | ((range: { start: Date; end: Date }, culture?: string, localizer?: any) => string);
      selectRangeFormat?: string | ((range: { start: Date; end: Date }, culture?: string, localizer?: any) => string);
      [key: string]: any;
    };
    style?: CSSProperties;
    className?: string;
    elementProps?: React.HTMLAttributes<HTMLElement>;
    [key: string]: any;
  }

  export const Calendar: ComponentType<CalendarProps>;
  export function momentLocalizer(moment: any): any;
  export function dateFnsLocalizer(dateFns: any): any;
  export function globalizeLocalizer(globalize: any): any;
}
