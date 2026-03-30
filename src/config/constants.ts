export const REFRESH_TOKEN_HASH_ROUNDS = 12;
export const PROJECT_LENGTH_THRESHOLD = [
  {
    max: 30,
    value: "less_than_1_month",
  },
  {
    max: 90,
    value: "1_to_3_months",
  },
  {
    max: 180,
    value: "3_to_6_months",
  },
  {
    max: 365,
    value: "6_to_12_months",
  },
  {
    max: Infinity,
    value: "more_than_12_months",
  },
];
