/**
 * CSV 다운로드 유틸리티 (Excel 호환)
 * @param {Array} data - 추출할 데이터 배열 (예: [{건물명: 'A', 호실: '101호'}, ...])
 * @param {String} filename - 다운로드될 파일명
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || !data.length) {
    alert('다운로드할 데이터가 없습니다.');
    return;
  }

  // 1. 헤더 추출
  const headers = Object.keys(data[0]);
  
  // 2. CSV 문자열 생성 (헤더 + 데이터)
  const csvRows = [];
  csvRows.push(headers.join(',')); // 헤더 행

  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header] !== null && row[header] !== undefined ? row[header] : '';
      const strVal = String(val);
      // 값에 쉼표, 줄바꿈, 따옴표가 있으면 따옴표로 감싸기
      if (strVal.includes(',') || strVal.includes('\\n') || strVal.includes('"')) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');

  // 3. 한글 깨짐 방지를 위한 UTF-8 BOM 추가
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });

  // 4. 다운로드 링크 생성 및 클릭 이벤트 발생
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
