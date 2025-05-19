import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import 'react-calendar/dist/Calendar.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { startOfWeek, format, addDays } from 'date-fns';
import DoctorCalendar from '../components/DoctorCalendar';
import Navigation from '../components/Navigation';

// 더미 환자 데이터
const dummyPatients = [
  { id: 1, name: '환자 1', info: '성별, 나이, 병명, 상태, 치료 주차 등을 기록' },
  { id: 2, name: '환자 2', info: '성별, 나이, 병명, 상태, 치료 주차 등을 기록' },
  { id: 3, name: '환자 3', info: '성별, 나이, 병명, 상태, 치료 주차 등을 기록' },
  { id: 4, name: '환자 4', info: '성별, 나이, 병명, 상태, 치료 주차 등을 기록' },
];

// 더미 감정/식사/외출 데이터 (1주일)
const dummyDiaryStats = [
  { date: '2025-04-15', emotion: 0.2, meal: 2, outing: 1, diary: '오늘은 기분이 괜찮았다.' },
  { date: '2025-04-16', emotion: -0.5, meal: 1, outing: 0, diary: '조금 우울했다.' },
  { date: '2025-04-17', emotion: 0.7, meal: 3, outing: 1, diary: '행복한 하루!' },
  { date: '2025-04-18', emotion: 0.0, meal: 2, outing: 0, diary: '평범했다.' },
  { date: '2025-04-19', emotion: null, meal: null, outing: null, diary: null }, // 일기 없음
  { date: '2025-04-20', emotion: -0.2, meal: 1, outing: 1, diary: '조금 힘들었다.' },
  { date: '2025-04-21', emotion: 0.4, meal: 2, outing: 1, diary: '좋은 하루였다.' },
  { date: '2025-04-22', emotion: 0.3, meal: 2, outing: 0, diary: '일요일은 휴식.' },
];

const DoctorPageContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: row;
  margin-top: 80px;
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  width: 340px;
  min-width: 260px;
  background: #fff;
  border-right: 1.5px solid #eee;
  padding: 40px 16px 24px 32px;
  display: flex;
  flex-direction: column;
  @media (max-width: 900px) {
    width: 100vw;
    border-right: none;
    border-bottom: 1.5px solid #eee;
    padding: 24px 8px 12px 8px;
  }
`;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid #bbb;
  font-size: 16px;
  outline: none;
`;

const AddBtn = styled.button`
  margin-left: 8px;
  background: #0089ED;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #1976d2; }
`;

const PatientCard = styled.div`
  background: #fff;
  border: 2.5px solid #222;
  border-radius: 18px;
  padding: 18px 16px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
`;

const PatientInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const PatientName = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const PatientDesc = styled.div`
  font-size: 14px;
  color: #444;
`;

const PatientAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #e3e3e3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
`;

const RightPanel = styled.div`
  flex: 1;
  padding: 40px 40px 24px 40px;
  display: flex;
  flex-direction: column;
  @media (max-width: 900px) {
    padding: 24px 8px 12px 8px;
  }
`;

const CalendarAndChartsRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: flex-start;
  margin-bottom: 32px;
`;

const ChartCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ChartBox = styled.div`
  width: 420px;
  height: 200px;
  background: #f7f7fa;
  border-radius: 16px;
  padding: 16px 12px 0 12px;
  margin-bottom: 0;
`;

const SectionTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin: 24px 0 12px 0;
`;

const SummaryCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const OutingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0 18px 0;
  background: #f7f7fa;
  border-radius: 16px;
  overflow: hidden;
  font-size: 15px;
  th, td {
    border: 1px solid #ddd;
    padding: 10px 0;
    text-align: center;
  }
  th {
    background: #e3f1fc;
    font-weight: 700;
  }
`;

const DiaryModalBg = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.15);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DiaryModalBox = styled.div`
  background: #fff;
  border-radius: 18px;
  min-width: 320px;
  max-width: 90vw;
  min-height: 180px;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DiaryModalTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 18px;
`;

const DiaryModalText = styled.div`
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
  white-space: pre-line;
`;

const DiaryModalClose = styled.button`
  margin-top: 8px;
  background: #0089ED;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 6px 22px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;

// KST 변환 함수
function toKST(date) {
  return new Date(date.getTime() + (9 * 60 * 60 * 1000));
}

// 감정 그래프의 점(dot) 클릭 시 모달 띄우는 커스텀 Dot 컴포넌트
const CustomDot = (props) => {
  const { cx, cy, payload, onClick } = props;
  // emotion이 null이면 dot을 그리지 않음
  if (payload.emotion === null || payload.emotion === undefined) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={7}
      stroke="#0089ED"
      fill="#fff"
      strokeWidth={2}
      style={{ cursor: 'pointer', pointerEvents: 'all' }}
      onClick={() => onClick(payload)}
    />
  );
};

export default function DoctorPage() {
  const [patients] = useState(dummyPatients);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(dummyPatients[0]);
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [modalDiary, setModalDiary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [patientEmotionMap, setPatientEmotionMap] = useState({});
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [addPatientId, setAddPatientId] = useState('');

  // selectedDate를 항상 KST로 변환해서 사용
  const kstSelectedDate = toKST(selectedDate);

  // 달력에서 날짜 클릭 시
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // 월 변경 핸들러
  const handleChangeMonth = (date) => {
    setCurrentMonth(date);
  };

  // 주간 시작일 계산 (KST 기준)
  const weekStart = startOfWeek(kstSelectedDate, { weekStartsOn: 1 });
  // 한 주의 7일 날짜 배열 생성 (KST 기준)
  const weekDatesArr = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    weekDatesArr.push(format(d, 'yyyy-MM-dd'));
  }
  // 각 날짜별로 데이터 매칭
  const weekStats = weekDatesArr.map(dateStr => {
    const found = dummyDiaryStats.find(d => d.date === dateStr);
    return found || { date: dateStr, emotion: null, meal: null, outing: null, diary: null };
  });
  // 선택된 날짜의 데이터도 KST 기준으로 찾기
  const dayStat = dummyDiaryStats.find(d => d.date === format(kstSelectedDate, 'yyyy-MM-dd'));

  // 그래프에서 일자 클릭 시 모달 오픈
  const handleChartClick = (data) => {
    setModalDiary(data);
    setShowDiaryModal(true);
  };

  // 환자 검색 필터링
  const filteredPatients = patients.filter(p =>
    p.name.includes(search) || p.info.includes(search)
  );

  // 점선 데이터: null 구간의 앞뒤 값만 점선으로 연결
  let dashedLineData = [];
  for (let i = 1; i < weekStats.length - 1; i++) {
    if (
      weekStats[i].emotion === null &&
      weekStats[i - 1].emotion !== null &&
      weekStats[i + 1].emotion !== null
    ) {
      dashedLineData.push(
        { ...weekStats[i - 1] },
        { ...weekStats[i + 1] }
      );
    }
  }

  // 환자의 감정 데이터를 가져오는 함수 (실제 구현 필요)
  useEffect(() => {
    // TODO: API 호출하여 환자의 감정 데이터 가져오기
    const fetchPatientEmotions = async () => {
      try {
        // 임시 데이터
        const mockData = {
          '2024-03-20': 'happy',
          '2024-03-21': 'sad',
          '2024-03-22': 'normal',
          '2024-03-23': 'very_happy',
          '2024-03-24': 'slightly_sad',
          '2024-03-25': 'very_sad',
        };
        setPatientEmotionMap(mockData);
      } catch (error) {
        console.error('Failed to fetch patient emotions:', error);
      }
    };

    fetchPatientEmotions();
  }, []);

  const handleMyPage = () => {
    alert('마이페이지로 이동');
  };
  const handleLogout = () => {
    alert('로그아웃');
  };

  // 환자 추가 모달 확인
  const handleAddPatientConfirm = () => {
    alert(`검색어: ${addPatientId}`);
    setShowAddPatientModal(false);
    setAddPatientId('');
  };
  // 환자 추가 모달 취소
  const handleAddPatientCancel = () => {
    setShowAddPatientModal(false);
    setAddPatientId('');
  };

  return (
    <>
      <Navigation
        userName="홍길동"
        showWelcome={true}
        showMyPage={true}
        showLogout={true}
        onMyPage={handleMyPage}
        onLogout={handleLogout}
      />
      <DoctorPageContainer>
        <LeftPanel>
          <SearchRow>
            <SearchInput
              placeholder="환자 검색하기"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <AddBtn title="환자 추가" onClick={() => setShowAddPatientModal(true)}>+</AddBtn>
          </SearchRow>
          {filteredPatients.map(p => (
            <PatientCard
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              style={{ borderColor: selectedPatient.id === p.id ? '#0089ED' : '#222' }}
            >
              <PatientInfo>
                <PatientName>{p.name}</PatientName>
                <PatientDesc>{p.info}</PatientDesc>
              </PatientInfo>
              <PatientAvatar>👤</PatientAvatar>
            </PatientCard>
          ))}
        </LeftPanel>
        <RightPanel>
          <CalendarAndChartsRow>
            <DoctorCalendar
              selectedDate={selectedDate}
              onSelectDate={handleDateChange}
              patientEmotionMap={patientEmotionMap}
              currentMonth={currentMonth}
              onChangeMonth={handleChangeMonth}
            />
            <ChartCol>
              <div>
                <SectionTitle>감정 수치 (주간)</SectionTitle>
                <ChartBox>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weekStats} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={d => d.slice(5)} />
                      <YAxis domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} />
                      <Tooltip formatter={(v) => v === null ? '-' : v} />
                      <Line
                        type="monotone"
                        dataKey="emotion"
                        stroke="#0089ED"
                        strokeWidth={3}
                        dot={<CustomDot onClick={handleChartClick} />}
                        activeDot={<CustomDot onClick={handleChartClick} />}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartBox>
              </div>
              <div>
                <SectionTitle>식사 횟수 (일별)</SectionTitle>
                <ChartBox>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekStats} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={d => d.slice(5)} />
                      <YAxis allowDecimals={false} />
                      <Tooltip formatter={(v) => v === null ? '-' : v} />
                      <Bar dataKey="meal" fill="#00C49F" radius={[8,8,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartBox>
              </div>
            </ChartCol>
          </CalendarAndChartsRow>
          <SummaryCol>
            <SectionTitle>외출 여부 (요일별)</SectionTitle>
            <OutingTable>
              <thead>
                <tr>
                  {weekStats.map((d, idx) => (
                    <th key={d.date}>{['월','화','수','목','금','토','일'][idx]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {weekStats.map((d, idx) => (
                    <td key={d.date}>{d.outing === 1 ? 'O' : d.outing === 0 ? 'X' : '-'}</td>
                  ))}
                </tr>
              </tbody>
            </OutingTable>
            <SectionTitle>그림으로 분석된 내용 (일별)</SectionTitle>
            <div style={{ color: '#444', fontSize: 15, marginBottom: 18 }}>
              {dayStat && dayStat.diary ? (
                <>
                  <b>{format(selectedDate, 'yyyy-MM-dd')}</b> : {dayStat.diary}
                </>
              ) : (
                <>해당 일자의 그림 분석 데이터가 없습니다.</>
              )}
            </div>
          </SummaryCol>
        </RightPanel>
      </DoctorPageContainer>
      {showDiaryModal && (
        <DiaryModalBg>
          <DiaryModalBox>
            <DiaryModalTitle>일기 기록 ({modalDiary.date})</DiaryModalTitle>
            <DiaryModalText>
              {modalDiary && modalDiary.diary
                ? modalDiary.diary
                : "일기 기록이 없습니다."}
            </DiaryModalText>
            <DiaryModalClose onClick={() => setShowDiaryModal(false)}>닫기</DiaryModalClose>
          </DiaryModalBox>
        </DiaryModalBg>
      )}
      {showAddPatientModal && (
        <DiaryModalBg>
          <DiaryModalBox>
            <DiaryModalTitle>환자 추가</DiaryModalTitle>
            <div style={{ width: '100%', marginBottom: 16 }}>
              <input
                type="text"
                placeholder="환자 고유 ID 입력"
                value={addPatientId}
                onChange={e => setAddPatientId(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px solid #bbb', fontSize: 15 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <DiaryModalClose onClick={handleAddPatientConfirm}>확인</DiaryModalClose>
              <DiaryModalClose style={{ background: '#bbb' }} onClick={handleAddPatientCancel}>취소</DiaryModalClose>
            </div>
          </DiaryModalBox>
        </DiaryModalBg>
      )}
    </>
  );
} 