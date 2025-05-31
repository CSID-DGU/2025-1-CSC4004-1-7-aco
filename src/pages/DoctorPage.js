import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import 'react-calendar/dist/Calendar.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { startOfWeek, format, addDays } from 'date-fns';
import DoctorCalendar from '../components/DoctorCalendar';
import Navigation from '../components/Navigation';
import { registerPatient, getPatientsInfo, deletePatient, getWeeklyData, getPatientDiary } from '../api/medical';

const DoctorPageContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: row;
  margin-top: 80px;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 1200px) {
    flex-direction: column;
    max-width: 100vw;
  }
`;

const LeftPanel = styled.div`
  width: 380px;
  min-width: 280px;
  background: #fff;
  border-right: 1.5px solid #eee;
  padding: 48px 24px 32px 40px;
  display: flex;
  flex-direction: column;
  @media (max-width: 1200px) {
    width: 100vw;
    border-right: none;
    border-bottom: 1.5px solid #eee;
    padding: 32px 8px 16px 8px;
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
  position: relative;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  ${PatientCard}:hover & {
    opacity: 1;
  }
  &:hover {
    background: #cc0000;
  }
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
  padding: 48px 48px 32px 48px;
  display: flex;
  flex-direction: column;
  @media (max-width: 1200px) {
    padding: 24px 8px 12px 8px;
  }
`;

const CalendarAndChartsRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 48px;
  align-items: flex-start;
  margin-bottom: 40px;
`;

const ChartCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  
`;

const ChartBox = styled.div`
  width: 480px;
  height: 240px;
  background: #f7f7fa;
  border-radius: 20px;
  padding: 0 16px 0 16px;
  margin-bottom: 0;
`;

const SectionTitle = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px 0;
`;

const SummaryCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const OutingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 18px 0;
  background: #f7f7fa;
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

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0089ED;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  padding: 12px;
  margin: 8px 0;
  background: #fff5f5;
  border-radius: 8px;
  border: 1px solid #ffdddd;
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
  // 의사가 등록한 환자 리스트
  const [patients, setPatients] = useState([]);

  // 리스트 중에서 선택한 환자의 코드
  const [selectedPatientCode, setSelectedPatientCode] = useState("");

  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);

  // 일기 모달 창 띄우기
  const [showDiaryModal, setShowDiaryModal] = useState(false);

  // 모달 내 일기 내용
  const [modalDiary, setModalDiary] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [patientEmotionMap, setPatientEmotionMap] = useState({});
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [patientCode, setPatientCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [weekStats, setWeekStats] = useState([]);

  // selectedDate를 항상 KST로 변환해서 사용
  const kstSelectedDate = useMemo(() => toKST(selectedDate), [selectedDate]);

  // 달력에서 날짜 클릭 시
  const handleDateChange = (date) => {
    setSelectedDate(date);

    // 환자가 선택되어 있을 때만 주간 데이터 받아오기
    if (selectedPatientCode !== "") {
      handleGetWeeklyData(selectedPatientCode, date);
    }
  };

  // 월 변경 핸들러
  const handleChangeMonth = (date) => {
    setCurrentMonth(date);
  };

  // 그래프에서 일자 클릭 시 모달 오픈
  const handleChartClick = (data) => {
    if (data && data.diary) {
      setModalDiary(data);
      setShowDiaryModal(true);
    }
  };

  // 주간 데이터 계산
  useEffect(() => {
    // 주간 시작일 계산 (KST 기준)
    const weekStart = startOfWeek(kstSelectedDate, { weekStartsOn: 1 });
    // 한 주의 7일 날짜 배열 생성 (KST 기준)
    const weekDatesArr = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      weekDatesArr.push(format(d, 'yyyy-MM-dd'));
    }
    // 각 날짜별로 데이터 매칭 (실제 API 연동 필요)
    setWeekStats(weekDatesArr.map(dateStr => ({
      date: dateStr,
      emotion: null,
      meal: null,
      outing: null,
      diary: null
    })));
  }, [kstSelectedDate]);

  // 환자의 감정 데이터를 가져오는 함수 (실제 API 연동 필요)
  // useEffect(() => {
  //   const fetchPatientEmotions = async () => {
  //     try {
  //       // TODO: API 호출하여 환자의 감정 데이터 가져오기
  //       setPatientEmotionMap({});
  //     } catch (error) {
  //       console.error('Failed to fetch patient emotions:', error);
  //     }
  //   };

  //   fetchPatientEmotions();
  // }, []);

  // 환자 추가하기
  const handleRegisterPatient = async (patientCode) => {
    console.log(typeof patientCode, patientCode);
    try {

      // 환자 추가
      await registerPatient(patientCode);
      setShowAddPatientModal(false);
      setPatientCode('');

      // 환자 리스트 새로고침
      await handleGetPatientsInfo();

    } catch (error) {
      console.error('환자 등록에 실패했습니다.');
    }
  };

  // 환자 리스트 불러오기
  const handleGetPatientsInfo = async () => {
    try {
      setLoading(true);
      const data = await getPatientsInfo();
      console.log("data", data);

      // 환자 한 명씩 불러오기
      const mappedPatients = data.map(patient => ({
        patientCode: patient.patientCode,
        patientName: patient.patientName,
        patientBirthDate: `생년월일: ${patient.patientBirthDate}`
      }));
      console.log("mappedPatients:", mappedPatients);
  
      setPatients(mappedPatients);
      setError(null);

    } catch (error) {
      console.error('handleGetPatientsInfo: 환자 목록을 불러오는데 실패했습니다.', error);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 진입 시 환자 리스트 불러오기
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        await handleGetPatientsInfo();
      } catch (error) {
        console.error('fetchPatient: 환자 목록을 불러오는데 실패했습니다.');
      }
    }
    fetchPatient();
  }, []);

  // 환자 삭제하기
  const handleDeletePatient = async (medicId, e) => {
    e.stopPropagation();
    if(!window.confirm('정말로 이 환자를 삭제하시겠습니까?')) return;
    console.log("handleDeletePatient");
    try {
      setDeleteLoading(true);
      setDeleteError(null);

      // 환자 삭제
      await deletePatient(medicId);
      console.log("환자 삭제 완료");

      // 환자 목록 새로고침
      await handleGetPatientsInfo();
      console.log("환자 목록 새로고침 완료");

    } catch (error) {
      console.error('환자 삭제에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // 환자의 주간 데이터 가져오기
  const handleGetWeeklyData = async (patientCode, baseDate) => {

    console.log("요청 날짜", baseDate);

    try {
      const data = await getWeeklyData(patientCode, baseDate);
      console.log("patient weekly data", data);
    } catch (error) {
      console.error('handleGetWeeklyData: 주간 데이터를 불러오는데 실패했습니다.');
    }
  };
  
  // 환자 추가 모달 취소
  const handleAddPatientCancel = () => {
    setShowAddPatientModal(false);
    setPatientCode('');
  };

  // 환자 검색 필터링
  // const filteredPatients = patients.filter(p =>
  //   p.name.includes(search) || p.info.includes(search)
  // );

  // 선택된 날짜의 데이터
  const dayStat = weekStats.find(d => d.date === format(kstSelectedDate, 'yyyy-MM-dd'));

  // PatientCard 클릭 핸들러
  const handlePatientSelect = (patientCode) => {
    setSelectedPatientCode(patientCode);
    
    // 환자 선택 시 현재 선택된 날짜가 있다면 해당 날짜의 주간 데이터 가져오기
    if (selectedDate) {
      handleGetWeeklyData(patientCode, selectedDate);
    }
  };

  return (
    <>
      <Navigation />
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
          {loading ? (
            <LoadingText>
              <LoadingSpinner />
              환자 목록을 불러오는 중...
            </LoadingText>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            // filteredPatients 대신 patients 사용
            patients.map(p => (
              <PatientCard 
                key={p.patientCode} 
                onClick={() => handlePatientSelect(p.patientCode)}
                style={{ 
                  borderColor: selectedPatientCode === p.patientCode ? '#0089ED' : '#222' 
                }}
              >
                <PatientInfo>
                  <PatientName>{p.patientName}</PatientName>
                  <PatientDesc>{p.patientBirthDate}</PatientDesc>
                  <PatientDesc style={{ color: '#666', marginTop: '4px' }}>환자 코드: {p.patientCode}</PatientDesc>
                </PatientInfo>
                <PatientAvatar>👤</PatientAvatar>
                <DeleteButton
                  onClick={(e) => handleDeletePatient(p.medicId, e)}
                  disabled={deleteLoading}
                  title="환자 삭제"
                >
                  ×
                </DeleteButton>
              </PatientCard>
            ))
          )}
          {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
        </LeftPanel>


        <RightPanel>
          
          {patientDetail && (
            <div style={{ marginBottom: '24px' }}>
              <SectionTitle>환자 정보</SectionTitle>
              <div style={{
                background: '#f7f7fa',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '15px',
                lineHeight: '1.6'
              }}>
                <p><strong>이름:</strong> {patientDetail.name}</p>
                <p><strong>생년월일:</strong> {patientDetail.birthDate}</p>
                <p><strong>성별:</strong> {patientDetail.gender === 'FEMALE' ? '여성' : '남성'}</p>
                <p><strong>이메일:</strong> {patientDetail.email}</p>
                <p><strong>전화번호:</strong> {patientDetail.phone}</p>
                <p><strong>환자 코드:</strong> {patientDetail.patientCode}</p>
                <p><strong>병원:</strong> {patientDetail.hospital}</p>
              </div>
            </div>
          )}


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
                      <YAxis
                        domain={[-1, 1]}
                        tickCount={5}
                        label={{ value: '감정 수치', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip formatter={(v) => v === null ? '-' : v} />
                      <Line
                        type="monotone"
                        dataKey="emotion"
                        stroke="#0089ED"
                        strokeWidth={2}
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
                      <Bar dataKey="meal" fill="#00C49F" radius={[8, 8, 0, 0]} />
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
                    <th key={d.date}>{['월', '화', '수', '목', '금', '토', '일'][idx]}</th>
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
                value={patientCode}
                onChange={e => setPatientCode(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px solid #bbb', fontSize: 15 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <DiaryModalClose onClick={() => handleRegisterPatient(patientCode)}>확인</DiaryModalClose>
              <DiaryModalClose style={{ background: '#bbb' }} onClick={handleAddPatientCancel}>취소</DiaryModalClose>
            </div>
          </DiaryModalBox>
        </DiaryModalBg>
      )}
    </>
  );
} 