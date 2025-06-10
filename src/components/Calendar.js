import React from 'react';
import styled from 'styled-components';

const days = ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun'];

const Calendar = ({ selectedDate, onSelectDate, emotionMap = {}, currentMonth, onChangeMonth, showLegend }) => {
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

    // KST 기준 YYYY-MM-DD 문자열 반환 함수
    const getKSTDateString = (date) => {
        const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
        return kst.toISOString().slice(0, 10);
    };

    // 오늘 날짜 판별 함수
    const isTodayCell = (date) => {
        if (!date) return false;
        const cellDate = new Date(year, month, date);
        return getKSTDateString(cellDate) === getKSTDateString(new Date());
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

    // 날짜 클릭 핸들러
    const handleDateClick = (date) => {
        if (!date) return;
        const newDate = new Date(year, month, date);
        console.log('Calendar: Date clicked:', newDate); // 디버깅용
        console.log('Calendar: Date key:', getDateKey(date)); // 디버깅용
        if (onSelectDate) {
            onSelectDate(newDate);
        }
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
                            const emotion = dateKey ? (emotionMap[dateKey] || null) : null;
                            
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
            {showLegend && (
                <EmotionLegend>
                    <LegendItems>
                        <LegendItem>
                            <ColorBox color="#CCCCFF" />
                            <LegendText>매우 우울</LegendText>
                        </LegendItem>
                        <LegendItem>
                            <ColorBox color="#CCDDFF" />
                            <LegendText>우울</LegendText>
                        </LegendItem>
                        <LegendItem>
                            <ColorBox color="#CCEEFF" />
                            <LegendText>약간 우울</LegendText>
                        </LegendItem>
                        <LegendItem>
                            <ColorBox color="#CCFFEE" />
                            <LegendText>보통</LegendText>
                        </LegendItem>
                        <LegendItem>
                            <ColorBox color="#CCFFCC" />
                            <LegendText>약간 행복</LegendText>
                        </LegendItem>
                        <LegendItem>
                            <ColorBox color="#EEFFCC" />
                            <LegendText>행복</LegendText>
                        </LegendItem>
                        <LegendItem>
                            <ColorBox color="#FFFFCC" />
                            <LegendText>매우 행복</LegendText>
                        </LegendItem>
                    </LegendItems>
                </EmotionLegend>
            )}
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
  padding-left: 20px;
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
  width: 100%;
  height: auto;
  min-height: 379px;
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
  padding: 20px 10px;
  width: 64px;
  height: 64px;
`;

const DayText = styled.div`
  width: 100%;
  height: 100%;
  font-family: 'Inter';
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  display: flex;
  align-items: center;
  text-align: center;
  color: #000000;
  justify-content: center;
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
  padding: 12px;
  width: 64px;
  height: 64px;
  border: 1px solid #D5D4DF;
  background: ${props => {
    if (props.$inactive) return '#F2F3F7';
    if (props.$emotion !== null && props.$emotion !== undefined) {
      const colors = [
        '#CCCCFF', // 매우 우울
        '#CCDDFF', // 우울
        '#CCEEFF', // 약간 우울
        '#CCFFEE', // 보통
        '#CCFFCC', // 약간 행복
        '#EEFFCC', // 행복
        '#FFFFCC'  // 매우 행복
      ];
      const idx = Math.min(6, Math.max(0, Math.floor(((props.$emotion + 1) / 2) * 7)));
      return colors[idx];
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
  font-family: 'Inter';
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
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

const EmotionLegend = styled.div`
    margin-top: 85px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 8px;
    width: 100%;
`;

const LegendItems = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const ColorBox = styled.div`
    width: 12px;
    height: 12px;
    background: ${props => props.color};
    border-radius: 2px;
    border: 1px solid rgba(0, 0, 0, 0.1);
`;

const LegendText = styled.div`
    font-family: 'Inter';
    font-size: 10px;
    color: #666;
`;

export default Calendar;