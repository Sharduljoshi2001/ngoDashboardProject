const { isValidMonth } = require("./month");

/** NGO ID must not look like a negative-only number (-5, - 42); allows NGO-042 etc. */
const NGO_ID_NEGATIVE_NUMBER = /^-\s*\d+\s*$/;

function validateReport(body) {
  const errors = [];
  const { ngo_id, month, people_helped, events_conducted, funds_utilized } =
    body || {};

  const trimmedId = typeof ngo_id === "string" ? ngo_id.trim() : "";

  if (!trimmedId) {
    errors.push("ngo_id is required and must be a non-empty string.");
  } else if (NGO_ID_NEGATIVE_NUMBER.test(trimmedId)) {
    errors.push("ngo_id cannot be a negative number.");
  }

  if (!isValidMonth(month)) {
    errors.push("month is required and must be in YYYY-MM format.");
  }

  if (
    people_helped == null ||
    !Number.isInteger(people_helped) ||
    people_helped < 0
  ) {
    errors.push("people_helped must be a non-negative integer.");
  }

  if (
    events_conducted == null ||
    !Number.isInteger(events_conducted) ||
    events_conducted < 0
  ) {
    errors.push("events_conducted must be a non-negative integer.");
  }

  if (
    funds_utilized == null ||
    typeof funds_utilized !== "number" ||
    funds_utilized < 0
  ) {
    errors.push("funds_utilized must be a non-negative number.");
  }

  return errors;
}

module.exports = { validateReport };