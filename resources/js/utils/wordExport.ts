// // utils/wordExport.ts
// import {
//     Document,
//     Packer,
//     Paragraph,
//     HeadingLevel,
//     TextRun,
//     Numbering,
//     AlignmentType,
//     convertInchesToTwip,
// } from 'docx';
// import { saveAs } from 'file-saver';

// export const downloadDocx = (htmlContent: string) => {
//     const tempDiv = document.createElement('div');
//     tempDiv.innerHTML = htmlContent;

//     const children = Array.from(tempDiv.children);

//     const paragraphs: Paragraph[] = [];

//     children.forEach((el) => {
//         switch (el.tagName.toLowerCase()) {
//             case 'h1':
//                 paragraphs.push(
//                     new Paragraph({
//                         text: el.textContent || '',
//                         heading: HeadingLevel.HEADING_1,
//                     })
//                 );
//                 break;
//             case 'h2':
//                 paragraphs.push(
//                     new Paragraph({
//                         text: el.textContent || '',
//                         heading: HeadingLevel.HEADING_2,

//                     })
//                 );
//                 break;
//             case 'h3':
//                 paragraphs.push(
//                     new Paragraph({
//                         text: el.textContent || '',
//                         heading: HeadingLevel.HEADING_3,
//                     })
//                 );
//                 break;
//             case 'p':
//                 paragraphs.push(new Paragraph(el.textContent || ''));
//                 break;
//             case 'ul':
//                 Array.from(el.children).forEach((li) => {
//                     paragraphs.push(
//                         new Paragraph({
//                             text: li.textContent || '',
//                             bullet: {
//                                 level: 0,
//                             },
//                         })
//                     );
//                 });
//                 break;
//             case 'ol':
//                 Array.from(el.children).forEach((li, index) => {
//                     paragraphs.push(
//                         new Paragraph({
//                             text: li.textContent || '',
//                             numbering: {
//                                 reference: 'my-numbering',
//                                 level: 0,
//                             },
//                         })
//                     );
//                 });
//                 break;
//             default:
//                 paragraphs.push(new Paragraph(el.textContent || ''));
//                 break;
//         }
//     });

//     const doc = new Document({
//         numbering: {
//             config: [
//                 {
//                     reference: 'my-numbering',
//                     levels: [
//                         {
//                             level: 0,
//                             format: 'decimal',
//                             text: '%1.',
//                             alignment: AlignmentType.LEFT,
//                             style: {
//                                 paragraph: {
//                                     indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
//                                 },
//                             },
//                         },
//                     ],
//                 },
//             ],
//         },
//         sections: [
//             {
//                 children: paragraphs,
//             },
//         ],
//     });

//     Packer.toBlob(doc).then((blob) => {
//         saveAs(blob, 'document.docx');
//     });
// };


// import { saveAs } from 'file-saver';
// // @ts-ignore
// import htmlDocx from 'html-docx-js';

// export const downloadDocx = (htmlContent: string, filename = 'document.docx') => {
//     let doc = htmlDocx.asBlob(htmlContent); // Convert HTML to Blob or Buffer
//     // Ensure doc is a Blob (for compatibility with file-saver)
//     if (!(doc instanceof Blob)) {
//         doc = new Blob([doc], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
//     }
//     saveAs(doc, filename); // Download the Blob
// };


// utils/wordExport.ts
import htmlToDocx from 'html-to-docx-lite';
// @ts-ignore
import { saveAs } from 'file-saver';

export const downloadDocx = async (htmlContent: string, filename: string = 'document.docx') => {
    try {
        const blob = await htmlToDocx(htmlContent, {
            orientation: 'portrait',
            margins: {
                top: 720,    // 0.5 inch
                right: 720,
                bottom: 720,
                left: 720,
            },
        });

        saveAs(blob, filename);
    } catch (error) {
        console.error('DOCX export error:', error);
    }
};
