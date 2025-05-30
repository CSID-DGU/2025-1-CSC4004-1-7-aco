import { useState, useEffect } from "react";
import { getPatient } from '../api/medical';

export default function TestDoctor() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetPatient = async () => {
    console.log("handleGetPatient");
    try {
      const data = await getPatient();

      console.log("data", data);

      setPatients(data.map(patient => ({
        patientCode: patient.patientCode,
        patientName: patient.patientName,
        patientBirthDate: `생년월일: ${patient.patientBirthDate}`
      })));

      setError(null);
    } catch (error) {
      console.error('환자 목록을 불러오는데 실패했습니다.', error);
      setError('환자 목록을 불러오는데 .');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetPatient();
  }, []);

  return (
    <div>
      <h2>환자 목록</h2>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {patients.map(patient => (
          <li key={patient.patientCode}>
            <strong>{patient.patientName}</strong><br />
            {patient.patientBirthDate}<br />
            코드: {patient.patientCode}
          </li>
        ))}
      </ul>
    </div>
  );
}