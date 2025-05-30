import React from 'react';
import styled from 'styled-components';

const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const DoctorCalendar = ({ selectedDate, onSelectDate, patientEmotionMap, currentMonth, onChangeMonth }) => {
    const today = new Date();
    // 한국 시간으로 변환
    const koreaTime = new Date(today.getTime() + (9 * 60 * 60 * 1000));
    const currentDate = currentMonth || new Date(koreaTime.getFullYear(), koreaTime.getMonth(), 1);

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
    const isTodayCell = (date) => {
        if (!date) return false;
        return (
            koreaTime.getFullYear() === year &&
            koreaTime.getMonth() === month &&
            koreaTime.getDate() === date
        );
    };

    // 선택된 날짜 판별 함수
    const isSelectedCell = (date) => {
        if (!selectedDate || !date) return false;
        return (
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === date
        );
    };

    // 날짜 클릭 핸들러
    const handleDateClick = (date) => {
        if (!date) return;
        const newDate = new Date(year, month, date);
        console.log('DoctorCalendar: Date clicked:', newDate); // 디버깅용
        if (onSelectDate) {
            onSelectDate(newDate);
        }
    };

    // 감정 분석 결과에 따른 날짜 키 생성
    const getDateKey = (date) => {
        if (!date) return null;
        // 한국 시간으로 날짜 생성
        const newDate = new Date(year, month, date);
        // YYYY-MM-DD 형식으로 변환
        const dateYear = newDate.getFullYear();
        const dateMonth = String(newDate.getMonth() + 1).padStart(2, '0');
        const dateDay = String(newDate.getDate()).padStart(2, '0');
        return `${dateYear}-${dateMonth}-${dateDay}`;
    };

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
                            const isToday = isTodayCell(date);
                            const isSelected = isSelectedCell(date);
                            const dateKey = getDateKey(date);
                            const emotion = dateKey ? (patientEmotionMap[dateKey] || null) : null;
                            
                            return (
                                <DateCell
                                    key={j}
                                    $inactive={!date}
                                    $isToday={isToday}
                                    $isSelected={isSelected}
                                    $emotion={emotion}
                                    onClick={() => handleDateClick(date)}
                                >
                                    <DateText 
                                        $inactive={!date}
                                        $emotion={emotion}
                                    >
                                        {date || ''}
                                    </DateText>
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
box-sizing: border-box;
  overflow: visible;
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
  height: auto;
  min-height: 379px;
  padding-bottom: 1px;
`;

const DaysRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 442px;
  height: 64px;
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
  background: ${props => {
    if (props.$inactive) return '#F2F3F7';
    if (props.$emotion) {
      switch (props.$emotion) {
        case 'very_happy':
          return '#F0FFFF';  // 매우 행복 - 거의 흰색
        case 'happy':
          return '#E0FFFF';  // 행복 - 매우 연한 파란색
        case 'slightly_happy':
          return '#ADD8E6';  // 약간 행복 - 연한 파란색
        case 'normal':
          return '#87CEEB';  // 보통 - 하늘색
        case 'slightly_sad':
          return '#4169E1';  // 약간 우울 - 로얄 블루
        case 'sad':
          return '#0000CD';  // 우울 - 중간 파란색
        case 'very_sad':
          return '#000080';  // 매우 우울 - 진한 파란색
        default:
          return '#FFFFFF';
      }
    }
    return '#FFFFFF';
  }};
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$inactive ? '#F2F3F7' : '#F5F5F5'};
  }

  ${props => props.$isToday && `
    border: 2px solid #0089ED !important;
    border-radius: 8px;
    &::after {
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
  `}

  ${props => props.$isSelected && `
    background: #E3F1FC !important;
    border: 2px solid #0089ED !important;
    border-radius: 8px;
    color: #0089ED;
    font-weight: 700;
  `}
`;

const DateText = styled.div`
  width: 100%;
  height: 100%;
  justify-content: center;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  display: flex;
  align-items: center;
  text-align: center;
  color: ${props => {
    if (props.$inactive) return '#A8A8A8';
    if (props.$emotion) {
      switch (props.$emotion) {
        case 'sad':
        case 'very_sad':
          return '#FFFFFF';  // 우울과 매우 우울일 때는 흰색
        default:
          return '#000000';
      }
    }
    return '#000000';
  }};
  transition: all 0.2s ease;
`;

export default DoctorCalendar; 