export function parseManifest(text, biltyType = "PAKKA") {
  const header = parseHeader(text);

  const rows = extractRows(text)
    .map(cleanRow)
    .map(tokenizeRow)
    .map((tokens) => parseRow(tokens, biltyType))
    .filter((row) => row.lrNo);

  console.log("=================================");
  console.log("BILTY TYPE:", biltyType);
  console.log("FINAL PARSED BILTY COUNT:", rows.length);
  console.log("=================================");

  return {
    header,
    rows,
  };
}

/* =========================================================
   HEADER
========================================================= */

function parseHeader(text) {
  const challanMatch = text.match(
    /Challan\s*No\.?\s*[:\-]+\s*(\d+)/i
  );

  const vehicleMatch = text.match(
    /\b[A-Z]{2}\d{2}[A-Z]{1,3}-?\d{4}\b/i
  );

  const dateMatch = text.match(
    /\b\d{2}[\/-]\d{2}[\/-]\d{2,4}\b/
  );

  return {
    challanNumber: challanMatch
      ? challanMatch[1]
      : null,

    vehicleNumber: vehicleMatch
      ? vehicleMatch[0]
          .replace(/-/g, "")
          .toUpperCase()
      : null,

    challanDate: dateMatch
      ? dateMatch[0].replace(/-/g, "/")
      : null,
  };
}

/* =========================================================
   ROW EXTRACTION
========================================================= */

function extractRows(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const rows = [];

  let currentRow = null;

  for (const line of lines) {

    /*
     * KACHHA + PAKKA
     *
     * Actual Kachha:
     *
     * 70.00 1 19/08/26 ...
     *
     * Actual Pakka:
     *
     * 20 1 21/08/26 ...
     *
     * Dono ko support karenge.
     */

    const rowStart =
      /^(?:\d+(?:\.\d+)?)\s+\d+\s+\d{2}[\/-]\d{2}[\/-]\d{2,4}\b/.test(
        line
      );

    if (rowStart) {

      if (currentRow) {
        rows.push(currentRow);
      }

      currentRow = line;

      continue;
    }

    /*
     * Kachha PDF mein LR number kabhi
     * next line par aa sakta hai.
     *
     * Example:
     *
     * MYR- 405191 -
     */

    const lrContinuation =
      /^[A-Z0-9]+-\s*\d{4,}\s*-?$/.test(line) ||
      /^\d{4,}\s*-?$/.test(line);

    if (currentRow && lrContinuation) {
      currentRow += " " + line;
    }
  }

  if (currentRow) {
    rows.push(currentRow);
  }

  console.log("========== EXTRACTED ROWS ==========");
  console.log("TOTAL EXTRACTED ROWS:", rows.length);

  rows.forEach((row, index) => {
    console.log(`${index + 1}:`, row);
  });

  console.log("====================================");

  return rows;
}

/* =========================================================
   CLEAN
========================================================= */

function cleanRow(row) {
  return row
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   TOKENIZE
========================================================= */

function tokenizeRow(row) {
  return row
    .split(" ")
    .filter(Boolean);
}

/* =========================================================
   PARSE ROW
========================================================= */

function parseRow(tokens, biltyType) {

  let weight = null;
  let serialNo = null;
  let biltyDate = null;

  /*
   * KACHHA/PDF FORMAT:
   *
   * 70.00 1 19/08/26
   *
   * weight = 70.00
   * serial = 1
   * date   = 19/08/26
   */

  if (
    tokens.length >= 3 &&
    /^\d+(?:\.\d+)?$/.test(tokens[0]) &&
    /^\d+$/.test(tokens[1]) &&
    /^\d{2}[\/-]\d{2}[\/-]\d{2,4}$/.test(tokens[2])
  ) {
    weight = Number(tokens[0]);
    serialNo = Number(tokens[1]);
    biltyDate = tokens[2];
  }

  if (
    weight === null ||
    serialNo === null ||
    biltyDate === null
  ) {
    console.log("ROW FORMAT NOT RECOGNIZED:", tokens);

    return {
      weight: null,
      serialNo: null,
      biltyDate: null,
      lrNo: null,
      freight: null,
      packages: null,
      goods: null,
      consignee: null,
      marka: null,
      pMarka: null,
      rawTokens: tokens,
    };
  }

  /* =======================================================
     LR NUMBER
  ======================================================= */

  let lrNo = null;

  let lrIndex = -1;

  for (let i = 3; i < tokens.length; i++) {

    const token = String(tokens[i])
      .replace(/[,:]/g, "")
      .trim();

    /*
     * Prefix + number
     *
     * MYR- 405191
     * BWN- 412588
     * DB16- 414257
     * ALPCG- 80003223
     */

    if (/^[A-Z0-9]+-$/i.test(token)) {

      for (
        let j = i + 1;
        j < tokens.length;
        j++
      ) {

        const number = String(tokens[j])
          .replace(/[,:]/g, "")
          .trim();

        if (/^\d{4,}$/.test(number)) {

          lrNo = `${token}${number}`;

          lrIndex = j;

          break;
        }
      }

      if (lrNo) {
        break;
      }
    }

    /*
     * Complete LR
     *
     * MYR-405191
     */

    if (/^[A-Z0-9]+-\d{4,}$/i.test(token)) {

      lrNo = token;

      lrIndex = i;

      break;
    }

    /*
     * Numeric LR
     */

    if (/^\d{6,}$/.test(token)) {

      lrNo = token;

      lrIndex = i;

      break;
    }
  }

  /* =======================================================
     DESTINATION
  ======================================================= */

  const destinationIndex =
    tokens.findIndex(
      (token, index) =>
        index >= 3 &&
        token.toUpperCase() === "KORBA"
    );

  /* =======================================================
     GOODS
  ======================================================= */

  let goods = null;

  if (destinationIndex !== -1) {

    goods = tokens
      .slice(3, destinationIndex)
      .filter(
        (token) =>
          !/^[A-Z0-9]+-$/i.test(token)
      )
      .join(" ")
      .trim();

    if (!goods) {
      goods = null;
    }
  }

  /* =======================================================
     PACKAGES
  ======================================================= */

  let packages = null;

  if (destinationIndex !== -1) {

    const afterDestination =
      tokens.slice(destinationIndex + 1);

    /*
     * Kachha format:
     *
     * KORBA 1 - MYR- 405191 -
     *
     * OR
     *
     * KORBA BADAL 3 - ...
     */

    for (let i = 0; i < afterDestination.length; i++) {

      if (
        /^\d+$/.test(afterDestination[i]) &&
        Number(afterDestination[i]) > 0
      ) {
        packages = Number(afterDestination[i]);
        break;
      }
    }
  }

  /* =======================================================
   CONSIGNEE + PMARKA
======================================================= */

let consignee = null;
let marka = null;

if (destinationIndex !== -1) {

  const afterDestination =
    tokens.slice(destinationIndex + 1);

  /*
   * =====================================================
   * KACHHA
   * =====================================================
   *
   * Example:
   *
   * KORBA 0801 3 - BWN- 412588 -
   *
   * 0801 = PMarka
   * 3    = Packages
   *
   * Kachha mein consignee nahi lena.
   */

  if (biltyType === "KACHHA") {

    const numericIndex =
      afterDestination.findIndex(
        (token) =>
          /^\d+$/.test(token)
      );

    if (numericIndex > 0) {

      const possibleMarka =
        afterDestination[numericIndex - 1];

      if (
        possibleMarka &&
        possibleMarka !== "-" &&
        !/^\d+(?:\.\d+)?$/.test(
          possibleMarka
        )
      ) {
        marka = possibleMarka;
      }
    }

  }

  /*
   * =====================================================
   * PAKKA
   * =====================================================
   *
   * Pakka mein:
   *
   * KORBA CONSIGNEE PMARKA PKGS -
   *
   * Example:
   *
   * KORBA TIRUPATI MOTORS CMT 9 -
   *
   * Consignee = TIRUPATI MOTORS
   * PMarka    = CMT
   * Packages  = 9
   */

  if (biltyType === "PAKKA") {

    let packageIndex = -1;

    /*
     * Packages ke baad "-" hota hai.
     */
    for (
      let i = 0;
      i < afterDestination.length - 1;
      i++
    ) {

      if (
        /^\d+$/.test(
          afterDestination[i]
        ) &&
        afterDestination[i + 1] === "-"
      ) {
        packageIndex = i;
        break;
      }
    }

    if (packageIndex !== -1) {

      const customerTokens =
        afterDestination.slice(
          0,
          packageIndex
        );

      if (customerTokens.length >= 2) {

        /*
         * Last token = PMarka
         */
        marka =
          customerTokens[
            customerTokens.length - 1
          ];

        /*
         * Baaki = Consignee
         */
        consignee =
          customerTokens
            .slice(0, -1)
            .join(" ")
            .trim() || null;

      } else if (
        customerTokens.length === 1
      ) {

        /*
         * Sirf ek token hai,
         * usko consignee maanenge.
         */
        consignee =
          customerTokens[0];
      }
    }
  }
}

  /* =======================================================
     FREIGHT
  ======================================================= */

  let freight = null;

  /*
   * Kachha challan mein ToPay/cartage
   * ke jagah "-" hai.
   *
   * Isliye null.
   *
   * Pakka mein agar LR ke baad numeric
   * value hai to use freight maanenge.
   */

  if (
    lrIndex !== -1 &&
    lrIndex + 1 < tokens.length
  ) {

    const possibleFreight =
      tokens[lrIndex + 1];

    if (
      /^\d+(?:\.\d+)?$/.test(
        possibleFreight
      )
    ) {
      freight = Number(possibleFreight);
    }
  }

  /* =======================================================
     DEBUG
  ======================================================= */

  console.log("========== PARSED ROW ==========");

  console.log({
  biltyType,
  serialNo,
  biltyDate,
  lrNo,
  goods,
  consignee,
  marka,
  packages,
  weight,
  freight,
});

  console.log("================================");

  return {
  serialNo,
  biltyDate,
  lrNo,
  freight,
  packages,
  weight,
  goods,

  consignee,

  marka,
  pMarka: marka,

  rawTokens: tokens,
};
}