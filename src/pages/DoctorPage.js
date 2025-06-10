import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { startOfWeek, format, addDays } from 'date-fns';
import DoctorCalendar from '../components/DoctorCalendar';
import Navigation from '../components/Navigation';
import { registerPatient, getPatientsInfo, deletePatient, getWeeklyData, getPatientDiary, getPaintByDate, getChatList } from '../api/medical';

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

// 감정 그래프의 점(dot) 클릭 시 모달 띄우는 커스텀 Dot 컴포넌트
// const CustomDot = (props) => {
//   const { cx, cy, payload, onClick } = props;

//   // console.log("payload", payload);

//   // emotion이 null이면 dot을 그리지 않음
//   if (payload.emotion === null || payload.emotion === undefined) return null;
//   return (
//     <circle cx={cx} cy={cy} r={7} stroke="#0089ED" fill="#fff" strokeWidth={2}
//       style={{ cursor: 'pointer', pointerEvents: 'all' }} onClick={() => onClick(payload)} />
//   );
// };

export default function DoctorPage() {
  // 의사가 등록한 환자 리스트
  const [patients, setPatients] = useState([]);

  // 리스트 중에서 선택한 환자의 코드
  const [selectedPatientCode, setSelectedPatientCode] = useState("");

  // 환자 검색
  const [search, setSearch] = useState('');

  // 일기 모달 창 띄우기
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  // 모달 내 일기 내용
  const [modalDiary, setModalDiary] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [patientEmotionMap, setPatientEmotionMap] = useState({});

  // 환자 추가 모달 창
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  // 환자 추가를 위해 입력하는 환자 코드
  const [patientCode, setPatientCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // 받아온 환자의 주간 데이터
  const [weekStats, setWeekStats] = useState([]);

  // 선택한 날짜의 환자의 그림
  const [paintFile, setPaintFile] = useState(null);
  const [paintId, setPaintId] = useState("");

  // 선택한 날짜에 그림을 그린 뒤 채팅 내용
  const [chatList, setChatList] = useState([]);

  // selectedDate를 항상 KST로 변환해서 사용
  const kstSelectedDate = selectedDate; // 이미 KST이므로 변환 불필요

  const CustomDot = (props) => {
    const { cx, cy, payload, onClick } = props;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#fff"
        stroke="#0089ED"
        strokeWidth={2}
        cursor="pointer"
        onClick={() => onClick?.(payload)}
      />
    )
  }

  // 달력에서 날짜 클릭 시
  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log("date click", date);
    console.log("selectedPatientCode after date click", selectedPatientCode);

    // 환자가 선택되어 있을 때만 주간 데이터 받아오기
    if (selectedPatientCode !== "") {
      // Date 객체를 'yyyy-MM-dd' 형식의 문자열로 변환
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log("formattedDate", formattedDate);

      // 변환된 날짜 문자열로 주간 데이터 요청
      handleGetWeeklyData(selectedPatientCode, formattedDate);

      // 변환된 날짜 문자열로 해당 날짜에 환자가 그린 그림 가져오기
      handleGetPaintByDate(formattedDate);
    } else {
      // 환자가 선택되지 않은 경우에도 일주일 날짜만 표시
      const weekStart = addDays(date, -6);
      const weekDatesArr = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(weekStart, i);
        weekDatesArr.push(format(d, 'yyyy-MM-dd'));
      }
      // 빈 데이터로 주간 통계 초기화
      setWeekStats(weekDatesArr.map(dateStr => ({
        date: dateStr,
        emotion: null,
        meal: null,
        outing: null,
        wakeTime: null,
      })));
    }
  };

  // 월 변경 핸들러
  const handleChangeMonth = (date) => {
    setCurrentMonth(date);
  };

  // 주간 데이터 계산 (초기 진입 및 날짜 변경 시)
  useEffect(() => {
    // 환자가 선택되어 있지 않을 때만 동작
    if (selectedPatientCode === "") {
      const weekStart = startOfWeek(kstSelectedDate, { weekStartsOn: 1 });
      const weekDatesArr = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(weekStart, i);
        weekDatesArr.push(format(d, 'yyyy-MM-dd'));
      }
      setWeekStats(weekDatesArr.map(dateStr => ({
        date: dateStr,
        emotion: null,
        meal: null,
        outing: null,
        wakeTime: null,
      })));
    }
  }, [kstSelectedDate, selectedPatientCode]);

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
        patientBirthDate: `생년월일: ${patient.patientBirthDate}`,
        // medicId: patient.medicId,
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
    console.log("selectedDate", selectedDate);

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
  const handleDeletePatient = async (patientCode, e) => {
    e.stopPropagation();
    if (!window.confirm('정말로 이 환자를 삭제하시겠습니까?')) return;
    console.log("handleDeletePatient");
    try {
      setDeleteLoading(true);
      setDeleteError(null);


      console.log("patientCode", patientCode);
      // 환자 삭제
      await deletePatient(patientCode);
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
      console.log("raw weekly data", data);

      // 받아온 데이터를 주간 통계 형식에 맞게 변환
      const weekStart = addDays(new Date(baseDate), -6);
      const weekDatesArr = [];

      // 한 주의 날짜 배열 생성
      for (let i = 0; i < 7; i++) {
        const d = addDays(weekStart, i);
        weekDatesArr.push(format(d, 'yyyy-MM-dd'));
      }
      console.log("weekDatesArr", weekDatesArr);

      // 각 날짜별 데이터 매핑
      const formattedData = weekDatesArr.map(dateStr => {
        // 해당 날짜의 데이터 찾기
        const dayData = data.find(item => format(new Date(item.createDate), 'yyyy-MM-dd') === dateStr) || {};

        return {
          date: dateStr,
          // 감정 수치 (-1 ~ 1 사이값)

          emotion: dayData.emotionRate || null,

          // 식사 횟수 (0 ~ 3)
          meal: dayData.mealCount || null,
          // 외출 여부 (0 또는 1)
          outing: dayData.wentOutside !== undefined ? dayData.wentOutside : null,
          // 기상 시간 (HH:mm 형식)
          wakeTime: dayData.wakeUpTime || null,
        };
      });

      console.log("formattedData", formattedData);

      // 변환된 데이터로 상태 업데이트
      setWeekStats(formattedData);

    } catch (error) {
      console.error('handleGetWeeklyData: 주간 데이터를 불러오는데 실패했습니다.');
    }
  };

  // 환자가 해당 일자에 작성한 일기 가져오기
  const handleGetPatientDiary = async (patientCode, date) => {
    try {
      const data = await getPatientDiary(patientCode, date);
      console.log("patient diary", data);
      return data;

    } catch (error) {
      console.error('handleGetPatientDiary: 일기를 불러오는데 실패했습니다.');
    }
  };

  // 일기 내용 파일 가져오기
  const getDiaryFile = async (contentPath) => {
    try {
      const response = await axios.get(contentPath, { responseType: 'text' });
      console.log("diaryFile", response.data);
      return response.data;
    } catch (error) {
      console.error('getDiaryFile: 일기 내용 파일을 불러오는데 실패했습니다.');
      return null;
    }
  };

  // 그래프에서 점 클릭 시 모달 오픈
  // 환자가 해당 날짜에 작성한 일기 보여주기
  const handleDotClick = async (data) => {
    console.log("data", data);
    console.log("selectedPatientCode", selectedPatientCode);
    console.log("data.date", data.date);

    if (data && data.date) {
      try {
        // 일기 내용 받아오기
        console.log("enter handleDotClick");
        const diaryContent = await handleGetPatientDiary(selectedPatientCode, data.date);
        console.log("diaryContent", diaryContent);

        const diaryFile = await getDiaryFile(diaryContent.contentPath);
        console.log("diaryFile", diaryFile);

        if (!diaryFile) {
          console.log("일기 내용 파일 받아오기 실패");
          return;
        }

        setModalDiary({ diaryContent, diaryFile });

        console.log("modalDiary", modalDiary);
        setShowDiaryModal(true);
      } catch (error) {
        console.error('handleDotClick: 일기를 불러오는데 실패했습니다.');
      }
    }
  };

  // modalDiary가 변경될 때마다 새로운 값 출력
  useEffect(() => {
    if (modalDiary) {
      console.log("modalDiary updated:", modalDiary);
    }
  }, [modalDiary]);

  // 그림 파일 가져오기
  const getPaintFile = async (contentPath) => {
    console.log("contentPath", contentPath);

    try {
      const response = await axios.get(contentPath, { responseType: 'blob' });
      console.log("paintFile", response.data);

      // 이미지 URL 생성
      const imageUrl = URL.createObjectURL(response.data);
      console.log("imageUrl", imageUrl);

      return imageUrl;

    } catch (error) {
      console.error('getPaintFile: 그림 파일을 불러오는데 실패했습니다.');
      return null;
    }
  };

  // 선택된 날짜의 그림 분석 데이터 가져오기
  const handleGetPaintByDate = async (date) => {

    try {
      console.log("date", date);
      console.log("date type", typeof date);
      console.log("selectedPatientCode", selectedPatientCode);

      const data = await getPaintByDate(selectedPatientCode, date);
      console.log("paintByDate", data);

      if (!data) {
        setPaintId("");
        setPaintFile(null);
        setChatList([]);
        return;
      }

      setPaintId(data.paintId);
      console.log("paintId 값 찍어보기 - data.paintId", data.paintId);
      console.log("paintId 값 찍어보기 - paintId", paintId);
      handleGetChatList(data.paintId);

      const paintFile = await getPaintFile(data.fileUrl);
      console.log("paintFile", paintFile);

      setPaintFile(paintFile);
      console.log("paintFile", paintFile);

    } catch (error) {
      console.error('handleGetPaintByDate: 그림 분석 데이터를 불러오는데 실패했습니다.');
    }
  };

  // 해당 그림에 대한 채팅 내용 가져오기
  const handleGetChatList = async (paintId) => {
    try {

      if (!paintId) {
        setChatList([]);
        console.log("paintId가 없음");
        return;
      }

      console.log("paintId에 대한 채팅 내용 가져오기");
      const data = await getChatList(paintId);
      console.log("채팅 내용 받아옴");

      if (!data) {
        setChatList([]);
        console.log("채팅 내용이 없음");
        return;
      }

      console.log("chatList", data);
      setChatList(data);

      // check
    } catch (error) {
      console.error('handleGetChatList: 채팅 내용을 불러오는데 실패했습니다.');
    }
  };

  // 환자 추가 모달 취소
  const handleAddPatientCancel = () => {
    setShowAddPatientModal(false);
    setPatientCode('');
  };

  // 환자 검색 필터링
  const filteredPatients = patients.filter(p =>
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.patientCode.toLowerCase().includes(search.toLowerCase()) ||
    p.patientBirthDate.toLowerCase().includes(search.toLowerCase())
  );

  // 선택된 날짜의 데이터
  // const dayStat = weekStats.find(d => d.date === format(kstSelectedDate, 'yyyy-MM-dd'));

  // PatientCard 클릭 핸들러
  const handlePatientSelect = (patientCode) => {
    console.log("set PatientCode", patientCode);
    setSelectedPatientCode(patientCode);
    console.log("selectedPatientCode!!", selectedPatientCode);
  };

  // 환자와 날짜 선택 시 주간 데이터와 그림, 채팅 내용 가져오기
  useEffect(() => {
    if (selectedPatientCode && selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      handleGetWeeklyData(selectedPatientCode, formattedDate);
      handleGetPaintByDate(formattedDate);
      // handleGetChatList(paintId);
    }
  }, [selectedPatientCode]);

  useEffect(() => {
    console.log("weekStates updated", weekStats);
  }, [weekStats]);

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
            filteredPatients.map(p => (
              <PatientCard
                key={p.patientCode}
                onClick={() => handlePatientSelect(p.patientCode)}
                style={{ borderColor: selectedPatientCode === p.patientCode ? '#0089ED' : '#222' }}
              >
                <PatientInfo>
                  <PatientName>{p.patientName}</PatientName>
                  <PatientDesc>{p.patientBirthDate}</PatientDesc>
                  <PatientDesc style={{ color: '#666', marginTop: '4px' }}>환자 코드: {p.patientCode}</PatientDesc>
                </PatientInfo>
                <PatientAvatar>👤</PatientAvatar>
                <DeleteButton
                  onClick={(e) => handleDeletePatient(p.patientCode, e)}
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
                      <YAxis domain={[-1, 1]} tickCount={5} label={{ value: '감정 수치', angle: -90, position: 'insideLeft', offset: 10, dy: 30 }} />
                      <Tooltip formatter={(v) => v === null ? '-' : v} />
                      <Line
                        type="monotone"
                        dataKey="emotion"
                        stroke="#0089ED"
                        strokeWidth={2}
                        dot={(props) => {
                          const { key, payload, ...rest } = props;
                          if (payload.emotion === null || payload.emotion === undefined) return null;
                          return <CustomDot key={key} payload={payload} {...rest} onClick={handleDotClick} />;
                        }}
                        activeDot={(props) => {
                          const { key, payload, ...rest } = props;
                          if (payload.emotion === null || payload.emotion === undefined) return null;
                          return <CustomDot key={key} payload={payload} {...rest} onClick={handleDotClick} />;
                        }}
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
                      <YAxis allowDecimals={false} label={{ value: '식사 횟수', angle: -90, position: 'insideLeft', offset: 10, dy: 30 }} />
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
                  {weekStats.map((d) => (
                    <th key={d.date}>{d.date.slice(5)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {weekStats.map((d) => (
                    <td key={d.date} style={{ width: 156.7, background: d.outing === true || d.outing === false ? '#fff' : 'inherit' }}>
                      {d.outing === true ? 'O' : d.outing === false ? 'X' : '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </OutingTable>

            <SectionTitle>기상 시간 (요일별)</SectionTitle>
            <OutingTable>
              <thead>
                <tr>
                  {weekStats.map((d) => (
                    <th key={d.date}>{d.date.slice(5)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {weekStats.map((d) => (
                    <td key={d.date} style={{ width: 156.7, background: d.wakeTime ? '#fff' : 'inherit' }}>
                      {d.wakeTime ? d.wakeTime.slice(0, 5) : '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </OutingTable>

            <div>
              <SectionTitle>그림과 채팅 내용</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'flex-start', }}>
                <div className="paint-container" style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  width: '500px', aspectRatio: '4/3', border: '1px solid #ddd', backgroundColor: '#f9f9f9'
                }}>
                  {paintFile ? (
                    <img src={paintFile} alt="환자 그림" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', }} />
                  ) : (
                    <div
                      style={{ color: '#888', fontSize: 15, textAlign: 'center', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                      해당 일자의 그림 분석 데이터가 없습니다.
                    </div>
                  )}
                </div>

                <div className="chat-container"
                  style={{
                    width: '100%',
                    maxWidth: '546px',
                    height: '375px',
                    overflowY: 'auto',
                    paddingRight: '8px',
                  }}>
                  {chatList.map((chat, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: chat.writerType === 'bot' ? 'flex-start' : 'flex-end',
                      marginBottom: '8px',
                    }}>
                      <div style={{
                        backgroundColor: chat.writerType === 'bot' ? '#b6b8b8' : '#0089ED',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '16px',
                        maxWidth: '70%',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {chat.comment}
                      </div>
                    </div>
                  ))}
                </div>
              </div>


            </div>


          </SummaryCol>
        </RightPanel>
      </DoctorPageContainer>
      {showDiaryModal && (
        <DiaryModalBg>
          <DiaryModalBox>
            <DiaryModalTitle>{modalDiary.diaryContent.title}</DiaryModalTitle>
            <DiaryModalText>
              {modalDiary && modalDiary.diaryFile ? modalDiary.diaryFile : "일기 기록이 없습니다."}
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