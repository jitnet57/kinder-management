import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle, VerticalAlign, AlignmentType } from 'docx';

// Excel export - 아동정보
export const exportChildrenToExcel = (children: any[]) => {
  const data = children.map(child => ({
    '이름': child.name,
    '생년월일': child.birthDate,
    '전화번호': child.phone,
    '주소': child.address,
    '기타정보': child.notes,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '아동정보');

  // 열 너비 설정
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 30 },
  ];

  XLSX.writeFile(workbook, `아동정보_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Excel export - 스케줄
export const exportScheduleToExcel = (schedules: any[], children: any[]) => {
  const childMap = Object.fromEntries(children.map(c => [c.id, c.name]));

  const data = schedules.map(schedule => ({
    '요일': schedule.dayOfWeek,
    '시간': `${schedule.startTime}-${schedule.endTime}`,
    '아동명': childMap[schedule.childId] || '미지정',
    '세션명': schedule.sessionName,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '주간스케줄');

  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.writeFile(workbook, `주간스케줄_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Excel export - 완료목록
export const exportCompletionToExcel = (completions: any[]) => {
  const data = completions.map(item => ({
    '아동': item.child,
    '과제': item.task,
    '완료시간': item.date,
    '상태': item.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '완료목록');

  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
    { wch: 10 },
  ];

  XLSX.writeFile(workbook, `완료목록_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Word export - 아동정보 보고서
export const exportChildrenToWord = (children: any[]) => {
  const rows = children.map(child =>
    new TableRow({
      cells: [
        new TableCell({
          text: child.name,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          text: child.birthDate,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          text: child.phone,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          text: child.address,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          text: child.notes,
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    })
  );

  const table = new Table({
    rows: [
      new TableRow({
        cells: [
          new TableCell({
            text: '이름',
            shading: { fill: '8B7DC1' },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          new TableCell({
            text: '생년월일',
            shading: { fill: '8B7DC1' },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          new TableCell({
            text: '전화번호',
            shading: { fill: '8B7DC1' },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          new TableCell({
            text: '주소',
            shading: { fill: '8B7DC1' },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          new TableCell({
            text: '기타정보',
            shading: { fill: '8B7DC1' },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
        ],
      }),
      ...rows,
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: '🎓 아동정보 관리 보고서',
          fontSize: 28,
          bold: true,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `생성일: ${new Date().toLocaleDateString('ko-KR')}`,
          fontSize: 12,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 400 },
        }),
        table,
      ],
    }],
  });

  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `아동정보_${new Date().toISOString().split('T')[0]}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};

// Word export - 스케줄 보고서
export const exportScheduleToWord = (schedules: any[], children: any[]) => {
  const childMap = Object.fromEntries(children.map(c => [c.id, c.name]));

  const rows = schedules.map(schedule =>
    new TableRow({
      cells: [
        new TableCell({
          text: schedule.dayOfWeek,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          text: `${schedule.startTime}-${schedule.endTime}`,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          text: childMap[schedule.childId] || '미지정',
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          text: schedule.sessionName,
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    })
  );

  const table = new Table({
    rows: [
      new TableRow({
        cells: [
          new TableCell({
            text: '요일',
            shading: { fill: 'A8D8D8' },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          new TableCell({
            text: '시간',
            shading: { fill: 'A8D8D8' },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          new TableCell({
            text: '아동명',
            shading: { fill: 'A8D8D8' },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
          new TableCell({
            text: '세션명',
            shading: { fill: 'A8D8D8' },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          }),
        ],
      }),
      ...rows,
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: '📅 주간 스케줄 보고서',
          fontSize: 28,
          bold: true,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `생성일: ${new Date().toLocaleDateString('ko-KR')}`,
          fontSize: 12,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 400 },
        }),
        table,
      ],
    }],
  });

  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `주간스케줄_${new Date().toISOString().split('T')[0]}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};
