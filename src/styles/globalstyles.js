import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'NanumBarunpen';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_two@1.0/NanumBarunpen.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

  body {
    margin: 0;
    padding: 0;
    font-family: 'NanumBarunpen', sans-serif;
  }
`;
