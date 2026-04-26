/**
 * ============================================================
 * 📌 동적 문서 내보내기 모듈
 * 📋 목적: 문서 내보내기 라이브러리(jspdf, html2canvas, docx)를
 *         필요할 때만 로드하여 초기 번들 크기 최소화
 * 🎯 효과: documents 청크(254KB) 지연 로드
 * 📅 작성일: 2026-04-27
 * ============================================================
 */

/**
 * HTML을 PDF로 변환하여 다운로드 (동적 import)
 * 사용자가 PDF 다운로드를 클릭할 때만 라이브러리 로드
 * @param filename - 저장할 파일명
 * @param elementId - PDF로 변환할 HTML 요소의 ID
 */
export async function exportToPDF(filename: string, elementId: string) {
  try {
    // 동적 import로 필요할 때만 로드
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).jsPDF;

    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`요소 ${elementId}를 찾을 수 없습니다`);
      return;
    }

    // HTML을 캔버스로 변환
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // 캔버스를 PDF로 변환
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // 여백 고려
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF 내보내기 실패:', error);
  }
}

/**
 * HTML을 Excel로 변환하여 다운로드 (동적 import)
 * @param filename - 저장할 파일명
 * @param data - 테이블 데이터 (2D 배열)
 */
export async function exportToExcel(
  filename: string,
  data: (string | number)[][]
) {
  try {
    // 동적 import로 필요할 때만 로드
    const XLSX = await import('xlsx');

    // 워크북 및 워크시트 생성
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '시트1');

    // 파일 다운로드
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Excel 내보내기 실패:', error);
  }
}

/**
 * HTML을 Word 문서로 변환하여 다운로드 (동적 import)
 * @param filename - 저장할 파일명
 * @param content - 문서 내용 (HTML 문자열)
 */
export async function exportToWord(filename: string, content: string) {
  try {
    // 동적 import로 필요할 때만 로드
    const { Document, Packer, Paragraph, TextRun } = await import('docx');

    // 간단한 텍스트 추출 및 Word 문서 생성
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: filename,
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              text: content.replace(/<[^>]*>/g, ''), // HTML 태그 제거
            }),
          ],
        },
      ],
    });

    // 파일 다운로드
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Word 내보내기 실패:', error);
  }
}
