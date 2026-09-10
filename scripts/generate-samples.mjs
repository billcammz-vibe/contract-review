/**
 * Generates two realistic dummy contracts for testing:
 *
 *   sample-contracts/cloudnimbus-saas-agreement.docx  — vendor-favourable, many red flags
 *   sample-contracts/meridian-msa.pdf                  — balanced, mostly meets the playbook
 *
 * Run with:  npm run samples
 */
import { mkdirSync, writeFileSync, createWriteStream } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";
import PDFDocument from "pdfkit";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "sample-contracts");
mkdirSync(OUT_DIR, { recursive: true });

/* -------------------------------------------------------------------------- */
/*  Contract content                                                         */
/* -------------------------------------------------------------------------- */

const cloudNimbus = {
  title: "CLOUDNIMBUS MASTER SUBSCRIPTION AGREEMENT",
  sections: [
    [
      "1. Parties",
      'This Master Subscription Agreement ("Agreement") is entered into as of March 1, 2026 (the "Effective Date") by and between CloudNimbus, Inc., a Delaware corporation with offices at 500 Harbor Street, San Francisco, California ("CloudNimbus" or "Provider"), and the customer identified in the applicable Order Form ("Customer").',
    ],
    [
      "2. Term",
      'The initial term of this Agreement is three (3) years commencing on the Effective Date (the "Initial Term"). Upon expiration of the Initial Term, this Agreement shall automatically renew for successive renewal terms of two (2) years each (each, a "Renewal Term") unless either party provides written notice of non-renewal at least ninety (90) days prior to the end of the then-current term.',
    ],
    [
      "3. Termination",
      "Customer may terminate this Agreement only in the event of a material breach by Provider that remains uncured sixty (60) days after written notice. Customer shall have no right to terminate this Agreement for convenience. Provider may terminate this Agreement or any Order Form for convenience at any time upon thirty (30) days' written notice to Customer. No refunds of prepaid fees shall be due upon any termination.",
    ],
    [
      "4. Fees and Payment",
      "Customer shall pay all fees within fifteen (15) days of the invoice date. Late amounts accrue interest at 1.5% per month or the maximum rate permitted by law. Provider may increase fees for any Renewal Term, and may also increase fees during any term by up to ten percent (10%) per year upon notice to Customer. All fees are non-cancelable and non-refundable.",
    ],
    [
      "5. Limitation of Liability",
      "The aggregate liability of Provider arising out of or related to this Agreement shall not exceed the total fees paid by Customer in the three (3) months immediately preceding the event giving rise to the claim. Customer's liability under this Agreement shall not be subject to any cap. Nothing in this section limits Customer's payment obligations or Customer's indemnification obligations.",
    ],
    [
      "6. Indemnification",
      "Customer shall defend, indemnify, and hold harmless Provider and its affiliates from and against any and all claims, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to Customer's use of the Services, Customer Data, or Customer's breach of this Agreement. Provider has no indemnification obligations of any kind under this Agreement.",
    ],
    [
      "7. Confidentiality",
      'Customer shall hold in strict confidence all non-public information disclosed by Provider, including pricing, product roadmaps, and the terms of this Agreement ("Provider Confidential Information"), and shall not disclose it to any third party for a period of two (2) years following disclosure. Provider shall be free to use any feedback, data, or information provided by Customer without restriction.',
    ],
    [
      "8. Governing Law; Venue",
      "This Agreement is governed by the laws of Ireland, without regard to its conflict-of-laws rules. The parties submit to the exclusive jurisdiction of the courts of Dublin, Ireland for any dispute arising under this Agreement.",
    ],
    [
      "9. Assignment",
      "Customer may not assign or transfer this Agreement, in whole or in part, whether by operation of law or otherwise, without the prior written consent of Provider, which may be withheld in Provider's sole discretion. Provider may freely assign this Agreement to any affiliate or successor.",
    ],
    [
      "10. General",
      "This Agreement constitutes the entire agreement between the parties and supersedes all prior discussions. Any amendment must be in writing and signed by both parties.",
    ],
  ],
};

const meridian = {
  title: "MERIDIAN SOFTWARE MASTER SERVICES AGREEMENT",
  sections: [
    [
      "1. Parties",
      'This Master Services Agreement ("Agreement") is made effective as of June 15, 2026 (the "Effective Date") between Meridian Software LLC, a Delaware limited liability company ("Meridian"), and the customer named on the signature page ("Customer"). Each is a "party" and together the "parties".',
    ],
    [
      "2. Term",
      'This Agreement begins on the Effective Date and continues for an initial term of one (1) year. Thereafter it renews for additional one (1) year terms unless either party gives written notice of non-renewal at least thirty (30) days before the end of the then-current term.',
    ],
    [
      "3. Termination for Convenience",
      "Either party may terminate this Agreement or any Order for convenience upon thirty (30) days' prior written notice to the other party. If Customer terminates for convenience, Meridian will refund any prepaid fees for the terminated portion of the subscription term on a pro-rata basis.",
    ],
    [
      "4. Termination for Cause",
      "Either party may terminate this Agreement if the other party materially breaches the Agreement and fails to cure the breach within thirty (30) days after receiving written notice describing the breach in reasonable detail.",
    ],
    [
      "5. Fees and Payment",
      "Customer will pay undisputed invoiced amounts within thirty (30) days of the invoice date. Late undisputed amounts may accrue interest at one percent (1%) per month. Fees stated in an Order are fixed for that Order's term; Meridian will not increase fees during a term.",
    ],
    [
      "6. Limitation of Liability",
      "Except for the Excluded Claims, each party's total aggregate liability arising out of or relating to this Agreement will not exceed the total fees paid or payable by Customer under this Agreement in the twelve (12) months preceding the event giving rise to the claim. \"Excluded Claims\" means (a) a party's breach of its confidentiality obligations, (b) a party's indemnification obligations, and (c) claims of intellectual property infringement. Neither party is liable for indirect, incidental, or consequential damages.",
    ],
    [
      "7. Indemnification",
      "Meridian will defend Customer against any third-party claim alleging that the Services, as provided by Meridian and used in accordance with this Agreement, infringe a third party's intellectual property rights, and will indemnify Customer for amounts finally awarded against Customer. Customer will defend Meridian against any third-party claim arising from Customer Data or Customer's unlawful use of the Services. The foregoing obligations are the parties' sole remedies for third-party claims.",
    ],
    [
      "8. Confidentiality",
      "Each party will protect the other party's Confidential Information using at least reasonable care and will not use or disclose it except as permitted under this Agreement. These obligations apply during the term and for three (3) years after termination, except that obligations with respect to trade secrets continue for as long as the information remains a trade secret under applicable law.",
    ],
    [
      "9. Governing Law; Venue",
      "This Agreement is governed by the laws of the State of Delaware, without regard to its conflict-of-laws principles. The state and federal courts located in Delaware will have exclusive jurisdiction over any dispute arising out of this Agreement.",
    ],
    [
      "10. Assignment",
      "Neither party may assign this Agreement without the other party's prior written consent, such consent not to be unreasonably withheld, conditioned, or delayed. Notwithstanding the foregoing, either party may assign this Agreement in its entirety, on written notice and without the other party's consent, to an affiliate or in connection with a merger, acquisition, or sale of all or substantially all of its assets.",
    ],
    [
      "11. General",
      "This Agreement is the entire agreement between the parties regarding its subject matter and supersedes all prior agreements. Amendments must be in a writing signed by both parties.",
    ],
  ],
};

/* -------------------------------------------------------------------------- */
/*  Renderers                                                                */
/* -------------------------------------------------------------------------- */

async function writeDocx(contract, filename) {
  const children = [
    new Paragraph({ text: contract.title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: "" }),
  ];
  for (const [heading, body] of contract.sections) {
    children.push(
      new Paragraph({ text: heading, heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ children: [new TextRun(body)] }),
      new Paragraph({ text: "" }),
    );
  }
  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);
  writeFileSync(join(OUT_DIR, filename), buffer);
  console.log("wrote", filename);
}

function writePdf(contract, filename) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 64 });
    const stream = createWriteStream(join(OUT_DIR, filename));
    stream.on("finish", () => {
      console.log("wrote", filename);
      resolve();
    });
    stream.on("error", reject);
    doc.pipe(stream);

    doc.font("Helvetica-Bold").fontSize(15).text(contract.title);
    doc.moveDown();
    for (const [heading, body] of contract.sections) {
      doc.font("Helvetica-Bold").fontSize(11).text(heading);
      doc.moveDown(0.25);
      doc.font("Helvetica").fontSize(10.5).text(body, { align: "left" });
      doc.moveDown(0.9);
    }
    doc.end();
  });
}

await writeDocx(cloudNimbus, "cloudnimbus-saas-agreement.docx");
await writePdf(meridian, "meridian-msa.pdf");
console.log("\nDone. Upload these from the app, or drop your own PDFs/.docx into sample-contracts/.");
