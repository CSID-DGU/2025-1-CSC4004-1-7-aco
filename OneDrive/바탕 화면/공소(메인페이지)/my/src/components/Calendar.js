import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // 기본 스타일

function MyCalendar({ onChange, value, tileClassName }) {
    return (
        <div className="calendar-container">
            <Calendar
                onChange={onChange}
                value={value}
                tileClassName={tileClassName}
                calendarType="gregory"
                formatDay={(locale, date) => date.getDate()} // "일" 없이 숫자만
            />
        </div>
    );
}

export default MyCalendar;