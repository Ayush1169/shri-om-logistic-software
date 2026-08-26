export function parseManifest(text) {
  const header = parseHeader(text);

  const rows = extractRows(text)
    .map(cleanRow)
    .map(tokenizeRow)
    .map(parseRow);

  return {
    header,
    rows,
  };
}

function parseHeader(text) {
  const challanMatch = text.match(/Challan No\.\s*:-\s*(\d+)/);

  const vehicleMatch = text.match(/\b[A-Z]{2}\d{2}[A-Z]{1,2}-?\d{4}\b/);

  const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{2})\s*Date\s*:-/);

  return {
    challanNumber: challanMatch ? challanMatch[1] : null,
    vehicleNumber: vehicleMatch
      ? vehicleMatch[0].replace("-", "")
      : null,
    challanDate: dateMatch ? dateMatch[1] : null,
  };
}

function extractRows(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.filter((line) =>
    /^\d+\s+\d+\s+\d{2}\/\d{2}\/\d{2}/.test(line)
  );
}

function cleanRow(row) {
  return row
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeRow(row) {
  return row.split(" ").filter(Boolean);
}

function parseRow(tokens) {
  // --------------------------------------------------
  // BASIC FIELDS
  // --------------------------------------------------

  const weight = Number(tokens[0]) || null;

  const serialNo = Number(tokens[1]) || null;

  const biltyDate = tokens[2] || null;

  // --------------------------------------------------
  // FIND LR NUMBER
  // --------------------------------------------------

  const lrIndex = tokens.findIndex(
    (token) => /^\d{6,}$/.test(token)
  );

  const lrNo =
    lrIndex !== -1
      ? tokens[lrIndex]
      : null;

  // --------------------------------------------------
  // FREIGHT
  // --------------------------------------------------

  let freight = null;

  if (lrIndex !== -1) {
    const freightToken = tokens[lrIndex + 1];

    if (
      freightToken &&
      /^\d+(?:\.\d+)?$/.test(freightToken)
    ) {
      freight = Number(freightToken);
    }
  }

  // --------------------------------------------------
  // FIND PACKAGE COUNT
  //
  // Usually package count is the number immediately
  // before "-" after the marka/consignee section.
  // --------------------------------------------------

  let packages = null;
  let packageIndex = -1;

  for (let i = 3; i < lrIndex; i++) {
    if (
      /^\d+$/.test(tokens[i]) &&
      tokens[i + 1] === "-"
    ) {
      packages = Number(tokens[i]);
      packageIndex = i;
      break;
    }
  }

  // --------------------------------------------------
  // GOODS / ITEM
  //
  // Everything between DATE and KORBA
  // --------------------------------------------------

  const korbaIndex = tokens.findIndex(
    (token, index) =>
      index >= 3 &&
      token.toUpperCase() === "KORBA"
  );

  let goods = null;

  if (korbaIndex !== -1) {
    goods = tokens
      .slice(3, korbaIndex)
      .join(" ")
      .trim() || null;
  }

  // --------------------------------------------------
  // CONSIGNEE + MARKA
  // --------------------------------------------------

  let consignee = null;
  let marka = null;

  if (
    korbaIndex !== -1 &&
    packageIndex !== -1
  ) {
    const customerTokens = tokens.slice(
      korbaIndex + 1,
      packageIndex
    );

    if (customerTokens.length > 0) {
      /*
       * Usually last token before package is P.Marka.
       *
       * Example:
       * TIRUPATI MOTORS CMT 9
       *
       * Consignee = TIRUPATI MOTORS
       * Marka     = CMT
       */

      if (customerTokens.length >= 2) {
        marka =
          customerTokens[
            customerTokens.length - 1
          ];

        consignee =
          customerTokens
            .slice(0, -1)
            .join(" ")
            .trim() || null;
      } else {
        /*
         * Example:
         * LAZER ENTERPRISES 1
         *
         * There is no clear separate marka.
         * Treat the token as consignee.
         */

        consignee = customerTokens[0];
        marka = null;
      }
    }
  }

  // --------------------------------------------------
  // DEBUG
  // --------------------------------------------------

  console.log("========== PARSED ROW ==========");
  console.log({
    serialNo,
    biltyDate,
    weight,
    goods,
    consignee,
    marka,
    packages,
    lrNo,
    freight,
  });
  console.log("================================");

  return {
    weight,
    serialNo,
    biltyDate,

    lrNo,
    freight,
    packages,

    goods,
    consignee,
    marka,

    rawTokens: tokens,
  };
}