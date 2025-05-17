import React from 'react';
import styled from 'styled-components';

const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const Calendar = ({ selectedDate, onSelectDate, emotionMap, currentMonth, onChangeMonth }) => {
    const today = new Date();
    const currentDate = currentMonth || new Date(today.getFullYear(), today.getMonth(), 1);

    // 월 변경 함수
    const handlePrevMonth = () => {
        if (onChangeMonth) {
            onChangeMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        }
    };
    const handleNextMonth = () => {
        if (onChangeMonth) {
            onChangeMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        }
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // 월요일 시작
    const lastDate = new Date(year, month + 1, 0).getDate();

    // 날짜 배열 생성
    const dates = [];
    let week = [];
    // 앞쪽 빈칸
    for (let i = 0; i < firstDay; i++) {
        week.push(null);
    }
    for (let d = 1; d <= lastDate; d++) {
        week.push(d);
        if (week.length === 7) {
            dates.push(week);
            week = [];
        }
    }
    // 마지막 주 빈칸
    if (week.length > 0) {
        while (week.length < 7) week.push(null);
        dates.push(week);
    }

    // 오늘 날짜 판별 함수
    function isTodayCell(year, month, date) {
        return (
            date &&
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === date
        );
    }

    // 선택된 날짜 판별 함수
    function isSelectedCell(date) {
        if (!selectedDate || !date) return false;
        return (
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === date
        );
    }

    // 날짜 key
    function getDateKey(date) {
        if (!date) return '';
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    }

    return (
        <CalendarContainer>
            <Header>
                <MonthYear>{`${year}년 ${month + 1}월`}</MonthYear>
                <NavigationButtons>
                    <NavButton onClick={handlePrevMonth}><ChevronLeft /></NavButton>
                    <NavButton onClick={handleNextMonth}><ChevronRight /></NavButton>
                </NavigationButtons>
            </Header>
            <DaysContainer>
                <DaysRow>
                    {days.map((day) => (
                        <DayCell key={day}>
                            <DayText>{day}</DayText>
                        </DayCell>
                    ))}
                </DaysRow>
                {dates.map((week, i) => (
                    <DateRow key={i}>
                        {week.map((date, j) => {
                            const dateKey = getDateKey(date);
                            const emotionClass = emotionMap && emotionMap[dateKey] ? emotionMap[dateKey] : '';
                            return (
                                <DateCell
                                    key={j}
                                    inactive={!date}
                                    className={`calendar-cell${isTodayCell(year, month, date) ? ' today' : ''}${isSelectedCell(date) ? ' selected' : ''} ${emotionClass}`}
                                    onClick={() => date && onSelectDate && onSelectDate(new Date(year, month, date))}
                                >
                                    <DateText inactive={!date}>{date ? date : ''}</DateText>
                                </DateCell>
                            );
                        })}
                    </DateRow>
                ))}
            </DaysContainer>
        </CalendarContainer>
    );
};

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 30px;
  gap: 12px;
  width: 502px;
  height: 497px;
  background: #FFFFFF;
  border: 5px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 442px;
  height: 46px;
`;

const MonthYear = styled.div`
  font-family: 'Inter';
  font-weight: 900;
  font-size: 24px;
  line-height: 29px;
  color: #000000;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const NavButton = styled.button`
  width: 46px;
  height: 46px;
  padding: 16px;
  background: none;
  border: none;
  cursor: pointer;
`;

const ChevronLeft = styled.div`
  width: 14px;
  height: 14px;
  border-top: 2px solid #AFAFAF;
  border-left: 2px solid #AFAFAF;
  transform: rotate(-45deg);
`;

const ChevronRight = styled.div`
  width: 14px;
  height: 14px;
  border-top: 2px solid #000000;
  border-right: 2px solid #000000;
  transform: rotate(45deg);
`;

const DaysContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 442px;
  height: 379px;
`;

const DaysRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 442px;
  height: 64px;
  margin: -1px 0;
`;

const DayCell = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  width: 64px;
  height: 64px;
`;

const DayText = styled.div`
  width: 24px;
  height: 24px;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  display: flex;
  align-items: center;
  text-align: center;
  color: #000000;
`;

const DateRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 442px;
  height: 64px;
  margin: -1px 0;
`;

const DateCell = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  width: 64px;
  height: 64px;
  border: 1px solid #D5D4DF;
  background: ${props => props.inactive ? '#F2F3F7' : '#FFFFFF'};
  position: relative;

  &.today {
    border: 2px solid #0089ED !important;
    border-radius: 8px;
  }
  &.today::after {
    content: '';
    display: block;
    width: 7px;
    height: 7px;
    background: #0089ED;
    border-radius: 50%;
    position: absolute;
    left: 50%;
    bottom: 8px;
    transform: translateX(-50%);
  }
`;

const DateText = styled.div`
  width: 24px;
  height: 24px;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  display: flex;
  align-items: center;
  text-align: center;
  color: ${props => props.inactive ? '#A8A8A8' : '#000000'};
`;

export default Calendar;