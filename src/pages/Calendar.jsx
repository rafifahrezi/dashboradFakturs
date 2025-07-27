import React, { useEffect, useState } from 'react';
import {
  ScheduleComponent,
  ViewsDirective,
  ViewDirective,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  Resize,
  DragAndDrop,
} from '@syncfusion/ej2-react-schedule';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Header } from '../components';

const PropertyPane = ({ children }) => <div className="mt-5">{children}</div>;

const Scheduler = () => {
  const [scheduleObj, setScheduleObj] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const querySnapshot = await getDocs(collection(db, 'fakturs'));
      const eventData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          Id: doc.id,
          Subject: `${data.nama_outlet} - ${data.no_invoice}`,
          StartTime: data.hari_pergantian?.toDate?.() || new Date(),
          EndTime: data.jatuh_tempo_pergantian?.toDate?.() || new Date(),
          IsAllDay: true,
          Location: data.kode_outlet || '',
        };
      });
      setEvents(eventData);
    };

    fetchInvoices();
  }, []);

  const handleDateChange = (args) => {
    if (scheduleObj) {
      scheduleObj.selectedDate = args.value;
      scheduleObj.dataBind();
    }
  };

  const handleDragStart = (arg) => {
    arg.navigation.enable = true;
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Kalender Faktur" />
      <ScheduleComponent
        height="650px"
        ref={(schedule) => setScheduleObj(schedule)}
        selectedDate={new Date()}
        eventSettings={{ dataSource: events }}
        dragStart={handleDragStart}
      >
        <ViewsDirective>
          {["Day", "Week", "WorkWeek", "Month", "Agenda"].map((view) => (
            <ViewDirective key={view} option={view} />
          ))}
        </ViewsDirective>
        <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]} />
      </ScheduleComponent>

      <PropertyPane>
        <table style={{ width: '100%', background: 'white' }}>
          <tbody>
            <tr style={{ height: '50px' }}>
              <td style={{ width: '100%' }}>
                <DatePickerComponent
                  value={new Date()}
                  showClearButton={false}
                  placeholder="Pilih Tanggal"
                  floatLabelType="Always"
                  change={handleDateChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </PropertyPane>
    </div>
  );
};

export default Scheduler;
