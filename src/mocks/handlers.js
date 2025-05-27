// import { http, HttpResponse } from 'msw';

// export const handlers = [
//   http.get('http://localhost:8080/api/medical/doctor/:licenseNumber/patients', ({ params }) => {
//     return HttpResponse.json([
//       {
//         patientCode: "PX8321",
//         name: "이환자",
//         birthDate: "2000-05-10"
//       }
//     ]);
//   }),
//   http.get('http://localhost:8080/api/medical/patient/:patientCode', ({ params }) => {
//     return HttpResponse.json({
//       name: "이환자",
//       birthDate: "2000-05-10",
//       gender: "FEMALE",
//       email: "pat@example.com",
//       phone: "010-9876-5432",
//       patientCode: "PX8321",
//       hospital: "서울대병원"
//     });
//   }),
//   http.post('http://localhost:8080/api/medical/doctor/:licenseNumber/patient/:patientCode', ({ params }) => {
//     return HttpResponse.json({
//       message: "환자 추가 성공",
//       patientCode: params.patientCode,
//       licenseNumber: params.licenseNumber
//     }, { status: 201 });
//   }),
// ];
