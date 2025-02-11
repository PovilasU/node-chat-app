import { toUpperCase, toLowerCase } from "../src/utils/string";

describe("String Utilities", () => {
  test("toUpperCase should convert string to uppercase", () => {
    expect(toUpperCase("hello")).toBe("HELLO");
  });

  test("toLowerCase should convert string to lowercase", () => {
    expect(toLowerCase("HELLO")).toBe("hello");
  });
});
