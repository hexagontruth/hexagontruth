export default class HexagonError extends Error {
  constructor(msg) {
    super(msg);
    console.error(msg);
  }
}
